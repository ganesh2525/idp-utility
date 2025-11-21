import React from 'react';

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-dark-text">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-dark-text-muted mb-8">Page Not Available</p>
        <a 
          href="/mfa/hardware-tokens" 
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Go to Hardware Tokens
        </a>
      </div>
    </div>
  );
};

export default PageNotFound;

