import { Database } from '../types/supabase';

export interface ParsedReceipt {
  date: string;
  total: number;
  merchant: string;
  items: Array<{
    name: string;
    price: number;
  }>;
}

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split('\n').map(line => line.trim());
  
  // Try to find the date using regex
  const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
  const dateMatch = text.match(dateRegex);
  const date = dateMatch ? dateMatch[0] : new Date().toLocaleDateString();

  // Try to find the total using regex
  const totalRegex = /total[\s:]*[$]?\s*(\d+\.?\d*)/i;
  const totalMatch = text.match(totalRegex);
  const total = totalMatch ? parseFloat(totalMatch[1]) : 0;

  // Try to find the merchant name (usually at the top of the receipt)
  const merchant = lines[0] || 'Unknown Merchant';

  // Try to parse items (this is a basic implementation)
  const items: Array<{ name: string; price: number }> = [];
  const priceRegex = /[\s][$]?\s*(\d+\.?\d*)\s*$/;

  lines.forEach(line => {
    const priceMatch = line.match(priceRegex);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const name = line.replace(priceMatch[0], '').trim();
      if (name && !name.toLowerCase().includes('total')) {
        items.push({ name, price });
      }
    }
  });

  return {
    date,
    total,
    merchant,
    items,
  };
}