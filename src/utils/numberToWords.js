/**
 * Converts numbers into Indian Currency words (Rupees and Paise)
 * Example: 5000 -> "INR FIVE THOUSAND RUPEES ONLY"
 * Example: 125000.50 -> "INR ONE LAKH TWENTY FIVE THOUSAND RUPEES AND FIFTY PAISE ONLY"
 */

const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN"
];

const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
];

function convertBelowThousand(num) {
  let str = "";
  if (num >= 100) {
    str += ONES[Math.floor(num / 100)] + " HUNDRED ";
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) {
      str += ONES[num] + " ";
    } else {
      str += TENS[Math.floor(num / 10)] + " ";
      if (num % 10 > 0) {
        str += ONES[num % 10] + " ";
      }
    }
  }
  return str.trim();
}

export function numberToIndianWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "INR ZERO RUPEES ONLY";
  }

  const num = Math.abs(Number(amount));
  if (num === 0) {
    return "INR ZERO RUPEES ONLY";
  }

  const parts = num.toFixed(2).split(".");
  let whole = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  let result = "";

  // Indian Numbering System:
  // Crores (10,000,000)
  const crore = Math.floor(whole / 10000000);
  whole %= 10000000;

  // Lakhs (100,000)
  const lakh = Math.floor(whole / 100000);
  whole %= 100000;

  // Thousands (1,000)
  const thousand = Math.floor(whole / 1000);
  whole %= 1000;

  // Hundreds & Below
  const remainder = whole;

  if (crore > 0) {
    result += convertBelowThousand(crore) + " CRORE ";
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + " LAKH ";
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + " THOUSAND ";
  }
  if (remainder > 0) {
    result += convertBelowThousand(remainder) + " ";
  }

  result = result.trim();
  if (!result) {
    result = "ZERO";
  }

  let finalStr = "INR " + result + " RUPEES";

  if (paise > 0) {
    finalStr += " AND " + convertBelowThousand(paise) + " PAISE";
  }

  finalStr += " ONLY";
  return finalStr.replace(/\s+/g, " ");
}

export function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return "0.00";
  return Number(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
