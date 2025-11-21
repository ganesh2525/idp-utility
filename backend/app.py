from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pyotp
import base64
import json
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to the database JSON file
DB_FILE = os.getenv('DB_FILE', os.path.join(os.path.dirname(__file__), 'db.json'))


def load_db():
    """Load data from db.json file"""
    try:
        if os.path.exists(DB_FILE):
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading database: {e}")
        return []


def save_db(data):
    """Save data to db.json file"""
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving database: {e}")
        return False


@app.route('/mfa/hardware-token/feitian-c100/generate-otp', methods=['POST'])
def feitian_c100():
    """
    Generate HOTP (counter-based OTP) for Feitian C100.
    Takes tokenSecretKey in request body to identify the token.
    Generates OTP using the token's secret key and current counter,
    then increments the counter by 1 and saves to db.json.
    Returns OTP in response.
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        token_secret_key = data.get('tokenSecretKey')
        
        if not token_secret_key:
            return jsonify({'error': 'tokenSecretKey is required'}), 400
        
        # Load database
        db_data = load_db()
        
        # Find the token by tokenSecretKey
        token = None
        token_index = -1
        for i, t in enumerate(db_data):
            if t.get('tokenType') == 'feitian-c100' and t.get('tokenSecretKey') == token_secret_key:
                token = t
                token_index = i
                break
        
        if token is None:
            return jsonify({'error': 'Token not found with the provided tokenSecretKey'}), 404
        
        # Get current counter (handle both string and number formats)
        counter = token.get('tokenCounter', 0)
        if isinstance(counter, str):
            try:
                counter = int(counter)
            except (ValueError, TypeError):
                counter = 0
        elif not isinstance(counter, int):
            counter = 0
        
        # Convert hex to Base32
        try:
            secret_key = base64.b32encode(bytes.fromhex(token_secret_key)).decode()
        except ValueError:
            return jsonify({'error': 'Invalid hex tokenSecretKey format'}), 400
        
        # Initialize HOTP
        hotp = pyotp.HOTP(secret_key)
        
        # Generate OTP using current counter
        otp = hotp.at(counter)
        
        # Increment counter by 1
        new_counter = counter + 1
        token['tokenCounter'] = new_counter  # Store as number, not string
        
        # Update the token in database
        db_data[token_index] = token
        
        # Save updated database
        if not save_db(db_data):
            return jsonify({'error': 'Failed to save updated counter'}), 500
        
        return jsonify({
            'otp': otp,
            'msg': 'SUCCESS',
            'newCounter': new_counter
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/mfa/hardware-token/feitian-c200/generate-otp', methods=['POST'])
def feitian_c200():
    """
    Generate TOTP (time-based OTP) for Feitian C200.
    Takes tokenSecretKey in request body to identify the token.
    Generates OTP using the token's secret key and tokenOffset as time step.
    Returns OTP in response.
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        token_secret_key = data.get('tokenSecretKey')
        
        if not token_secret_key:
            return jsonify({'error': 'tokenSecretKey is required'}), 400
        
        # Load database
        db_data = load_db()
        
        # Find the token by tokenSecretKey
        token = None
        for t in db_data:
            if t.get('tokenType') == 'feitian-c200' and t.get('tokenSecretKey') == token_secret_key:
                token = t
                break
        
        if token is None:
            return jsonify({'error': 'Token not found with the provided tokenSecretKey'}), 404
        
        # Get tokenOffset and use it directly as interval
        # tokenOffset should always be >= 30
        token_offset = token.get('tokenOffset', '30')
        try:
            time_step = int(token_offset)
            # Ensure minimum interval of 30 seconds (TOTP standard)
            if time_step < 30:
                time_step = 30
        except (ValueError, TypeError):
            time_step = 30  # Default to 30 seconds if offset is invalid
        
        # Convert hex to bytes, then to base32
        try:
            key_bytes = bytes.fromhex(token_secret_key)
            base32_secret = base64.b32encode(key_bytes).decode('utf-8')
        except ValueError:
            return jsonify({'error': 'Invalid hex tokenSecretKey format'}), 400
        
        # Initialize TOTP with tokenOffset as interval (minimum 30 seconds)
        totp = pyotp.TOTP(base32_secret, interval=time_step)
        
        # Generate OTP
        otp = totp.now()
        
        return jsonify({
            'otp': otp,
            'msg': 'SUCCESS'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/mfa/hardware-token/feitian-c100/get-details', methods=['GET'])
def get_c100_details():
    """
    Get all details of type feitian-c100 from db.json.
    Returns array of c100 token details.
    """
    try:
        data = load_db()
        c100_tokens = [token for token in data if token.get('tokenType') == 'feitian-c100']
        return jsonify(c100_tokens), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/mfa/hardware-token/feitian-c200/get-details', methods=['GET'])
def get_c200_details():
    """
    Get all details of type feitian-c200 from db.json.
    Returns array of c200 token details.
    """
    try:
        data = load_db()
        c200_tokens = [token for token in data if token.get('tokenType') == 'feitian-c200']
        return jsonify(c200_tokens), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    host = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
    # Use PORT environment variable (for platforms like Railway, Heroku) or fallback to FLASK_RUN_PORT
    port = int(os.getenv('PORT', os.getenv('FLASK_RUN_PORT', 5000)))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host=host, port=port)

