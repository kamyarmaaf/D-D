// Example usage of InfoBanner component
import React from 'react';
import InfoBanner from './InfoBanner';

const InfoBannerExample: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-8">InfoBanner Component Example</h1>
      
      {/* Default usage */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Default InfoBanner:</h2>
        <InfoBanner />
      </div>

      {/* Custom usage */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Custom InfoBanner:</h2>
        <InfoBanner 
          icon="🎲"
        />
      </div>

      {/* Another custom example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Another Custom Example:</h2>
        <InfoBanner 
          icon="📖"
        />
      </div>
    </div>
  );
};

export default InfoBannerExample;
