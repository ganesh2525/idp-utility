import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const HardwareTokens = () => {
  const [c100Tokens, setC100Tokens] = useState([]);
  const [c200Tokens, setC200Tokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingOTP, setGeneratingOTP] = useState({});
  const [otpResults, setOtpResults] = useState({});

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      // Reset OTP results when refreshing
      setOtpResults({});
      const [c100Response, c200Response] = await Promise.all([
        axios.get('/mfa/hardware-token/feitian-c100/get-details'),
        axios.get('/mfa/hardware-token/feitian-c200/get-details')
      ]);
      
      setC100Tokens(c100Response.data);
      setC200Tokens(c200Response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      alert('Failed to fetch tokens. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, setMessage) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage('Copied!');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setMessage('Failed');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    });
  };

  const generateOTP = async (tokenType, tokenSecretKey) => {
    const key = `${tokenType}-${tokenSecretKey}`;
    
    try {
      setGeneratingOTP(prev => ({ ...prev, [key]: true }));
      setOtpResults(prev => ({ ...prev, [key]: null }));

      const endpoint = tokenType === 'feitian-c100' 
        ? '/mfa/hardware-token/feitian-c100/generate-otp'
        : '/mfa/hardware-token/feitian-c200/generate-otp';

      const response = await axios.post(endpoint, {
        tokenSecretKey: tokenSecretKey
      });

      if (response.data.msg === 'SUCCESS') {
        setOtpResults(prev => ({ ...prev, [key]: response.data.otp }));
        
        // Update counter in local state for C100 tokens immediately
        if (tokenType === 'feitian-c100' && response.data.newCounter !== undefined) {
          setC100Tokens(prev => prev.map(token => 
            token.tokenSecretKey === tokenSecretKey 
              ? { ...token, tokenCounter: response.data.newCounter }
              : token
          ));
        }
      } else {
        throw new Error(response.data.error || 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate OTP';
      setOtpResults(prev => ({ ...prev, [key]: `Error: ${errorMessage}` }));
    } finally {
      setGeneratingOTP(prev => ({ ...prev, [key]: false }));
    }
  };

  const TokenCard = ({ token, tokenType }) => {
    const key = `${tokenType}-${token.tokenSecretKey}`;
    const isGenerating = generatingOTP[key];
    const otp = otpResults[key];
    const imagePath = tokenType === 'feitian-c100' ? '/feitain-c100.png' : '/feitain-c200.png';
    const [displayOTP, setDisplayOTP] = useState('xxxxxx');
    const otpTimerRef = useRef(null);
    const [copyMessage, setCopyMessage] = useState('');

    // Update display OTP when otp changes
    useEffect(() => {
      if (otp && !otp.startsWith('Error')) {
        setDisplayOTP(otp);
        
        // Clear existing timer if any
        if (otpTimerRef.current) {
          clearTimeout(otpTimerRef.current);
        }
        
        // Set timer to reset OTP after 60 seconds
        otpTimerRef.current = setTimeout(() => {
          setDisplayOTP('xxxxxx');
        }, 60000);
      } else if (otp && otp.startsWith('Error')) {
        setDisplayOTP('xxxxxx');
      }
      
      // Cleanup timer on unmount
      return () => {
        if (otpTimerRef.current) {
          clearTimeout(otpTimerRef.current);
        }
      };
    }, [otp]);

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full md:w-[400px] md:min-w-[400px] h-[480px] flex-shrink-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-semibold">{token.serialNumber || 'N/A'}</h3>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">{tokenType}</span>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-5 space-y-3">
            <div className="flex justify-between items-start pb-3 border-b border-gray-700 gap-3">
              <span className="text-sm font-semibold text-dark-text-muted flex-shrink-0">Secret Key:</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 overflow-x-auto max-h-12 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <span className="text-sm text-dark-text font-mono whitespace-nowrap block">{token.tokenSecretKey}</span>
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => copyToClipboard(token.tokenSecretKey, setCopyMessage)}
                    className="text-dark-text-muted hover:text-dark-text transition-colors"
                    title={copyMessage ? '' : 'Copy secret key'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {copyMessage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                      {copyMessage}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {tokenType === 'feitian-c100' && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-sm font-semibold text-dark-text-muted">Counter:</span>
                <span className="text-sm text-dark-text font-mono">{token.tokenCounter}</span>
              </div>
            )}
            {tokenType === 'feitian-c200' && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                <span className="text-sm font-semibold text-dark-text-muted">Time Step:</span>
                <span className="text-sm text-dark-text font-mono">{token.tokenOffset}</span>
              </div>
            )}
            
            {/* Image row */}
            <div className="flex justify-center items-center pt-2 pb-3 border-b border-gray-700">
              <img 
                src={imagePath} 
                alt={tokenType}
                className="w-48 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            {/* OTP row */}
            <div className="flex flex-col items-center pt-2 pb-2">
              <div className="text-xs font-semibold text-dark-text-muted mb-2">OTP:</div>
              <div className={`text-3xl font-bold font-mono tracking-wider ${displayOTP === 'xxxxxx' ? 'text-gray-600' : 'text-blue-400'}`}>
                {displayOTP}
              </div>
            </div>
          </div>

          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={() => generateOTP(tokenType, token.tokenSecretKey)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate OTP'}
          </button>

          {otp && otp.startsWith('Error') && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
              <div className="text-sm font-semibold text-red-400">{otp}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-dark-text">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Loading tokens...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5 min-h-screen">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-dark-text">Hardware Tokens</h1>
        <button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          onClick={fetchTokens}
        >
          Refresh
        </button>
      </div>

      {c100Tokens.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-dark-text mb-5">Feitian C100 Tokens (HOTP)</h2>
          <div className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
            {c100Tokens.map((token, index) => (
              <TokenCard key={`c100-${token.tokenSecretKey}-${index}`} token={token} tokenType="feitian-c100" />
            ))}
          </div>
        </div>
      )}

      {c200Tokens.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-dark-text mb-5">Feitian C200 Tokens (TOTP)</h2>
          <div className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
            {c200Tokens.map((token, index) => (
              <TokenCard key={`c200-${token.tokenSecretKey}-${index}`} token={token} tokenType="feitian-c200" />
            ))}
          </div>
        </div>
      )}

      {c100Tokens.length === 0 && c200Tokens.length === 0 && (
        <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
          <p className="text-dark-text-muted text-lg">No tokens found. Make sure the backend server is running and tokens are available.</p>
        </div>
      )}
    </div>
  );
};

export default HardwareTokens;

