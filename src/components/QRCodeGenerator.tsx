import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  roomCode: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ roomCode }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(roomCode)}`;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="bg-white p-1 sm:p-2 rounded-lg">
        <img 
          src={qrCodeUrl} 
          alt={`QR Code for room ${roomCode}`}
          className="w-24 h-24 sm:w-32 sm:h-32"
        />
      </div>
      <p className="text-xs sm:text-sm text-gray-300">Scan to join room</p>
    </div>
  );
};