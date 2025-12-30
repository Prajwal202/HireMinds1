/**
 * Format salary string to display in INR
 * @param {string} salary - The salary string (e.g., "80,000 - 120,000" or "90,000")
 * @returns {string} Formatted salary string in INR
 */
export const formatSalaryToINR = (salary) => {
  if (!salary || salary === 'Not specified') {
    return 'Not specified';
  }

  // Handle different salary formats
  try {
    // Handle range format: "80,000 - 120,000"
    if (salary.includes('-')) {
      const [min, max] = salary.split('-').map(s => s.trim());
      const formatPart = (part) => {
        const amount = parseFloat(part.replace(/[^0-9.]/g, ''));
        if (isNaN(amount)) return part;
        return formatINR(amount);
      };
      return `${formatPart(min)} - ${formatPart(max)}`;
    }
    
    // Handle single amount format: "90,000"
    const amount = parseFloat(salary.replace(/[^0-9.]/g, ''));
    if (!isNaN(amount)) {
      return formatINR(amount);
    }
    
    return salary;
  } catch (error) {
    console.error('Error formatting salary:', error);
    return salary;
  }
};

/**
 * Format number as INR currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted INR string
 */
const formatINR = (amount) => {
  // Convert to number if it's a string
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with Indian numbering system (lakhs and crores)
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Convert USD to INR
 * @param {number} usd - Amount in USD
 * @param {number} [rate=83.5] - Current USD to INR rate (default: 83.5)
 * @returns {number} Amount in INR
 */
export const usdToInr = (usd, rate = 83.5) => {
  return usd * rate;
};
