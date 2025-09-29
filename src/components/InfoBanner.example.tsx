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
          title="درباره بازی‌های نقش‌آفرینی"
          description="این بازی یک تجربه تعاملی و جذاب از ماجراجویی‌های خیالی است که در آن بازیکنان می‌توانند شخصیت‌های منحصر به فردی ایجاد کنند و در دنیای‌های مختلف ماجراجویی کنند."
          icon="🎲"
        />
      </div>

      {/* Another custom example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Another Custom Example:</h2>
        <InfoBanner 
          title="راهنمای شروع"
          description="برای شروع بازی، ابتدا یک نام کاربری انتخاب کنید و سپس یا اتاق جدیدی بسازید یا به اتاق موجودی بپیوندید. کد اتاق را با دوستانتان به اشتراک بگذارید تا همگی بتوانید در یک ماجراجویی شرکت کنید."
          icon="📖"
        />
      </div>
    </div>
  );
};

export default InfoBannerExample;
