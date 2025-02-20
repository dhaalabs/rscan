export interface ReceiptData {
  date: string;
  total: number;
  merchant: string;
  items: Array<{
    name: string;
    price: number;
  }>;
}