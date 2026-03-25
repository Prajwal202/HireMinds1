import React from 'react';

const UPIQRCode = ({ upiId, amount, projectName }) => {
  // Generate UPI payment URL for direct UPI payment
  const generateUPIURL = () => {
    const params = new URLSearchParams({
      pa: upiId, // Payee address (UPI ID)
      pn: 'Freelancer', // Payee name
      am: amount?.toString() || '', // Amount (optional)
      cu: 'INR', // Currency
      tn: `Payment for ${projectName || 'services'}`, // Transaction note
      tr: `TRX${Date.now()}` // Transaction reference
    });
    
    return `upi://pay?${params.toString()}`;
  };

  const upiURL = generateUPIURL();
  
  // Debug: Log the UPI URL to console
  console.log('Generated UPI URL:', upiURL);
  console.log('UPI ID:', upiId);
  console.log('Amount:', amount);
  console.log('Project Name:', projectName);
  
  // Use a more reliable QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiURL)}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <img 
          src={qrCodeUrl} 
          alt="UPI QR Code" 
          className="w-48 h-48"
          onError={(e) => {
            console.error('QR Code generation failed:', e);
            // Fallback to a simple text display
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-48 h-48 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg';
              fallback.innerHTML = `
                <div class="text-center p-4">
                  <div class="text-2xl mb-2">📱</div>
                  <div class="text-sm text-gray-600">QR Code</div>
                  <div class="text-xs text-gray-500 mt-1">Failed to load</div>
                </div>
              `;
              parent.appendChild(fallback);
            }
          }}
          onLoad={() => {
            console.log('QR Code loaded successfully');
          }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Scan to pay freelancer directly</p>
        <p className="text-xs text-gray-500 mt-1">UPI ID: {upiId}</p>
        {amount && (
          <p className="text-sm font-bold text-green-600 mt-1">₹{amount.toLocaleString()}</p>
        )}
        <p className="text-xs text-blue-600 mt-2">Direct UPI transfer • No intermediaries</p>
      </div>
    </div>
  );
};

export default UPIQRCode;
