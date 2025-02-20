/*
  # Create receipts schema

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date)
      - `total` (decimal)
      - `merchant` (text)
      - `created_at` (timestamptz)
    - `receipt_items`
      - `id` (uuid, primary key)
      - `receipt_id` (uuid, references receipts)
      - `name` (text)
      - `price` (decimal)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Insert their own receipts
      - Read their own receipts
*/

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL,
  total decimal(10,2) NOT NULL,
  merchant text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create receipt items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid REFERENCES receipts ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Policies for receipts
CREATE POLICY "Users can insert their own receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own receipts"
  ON receipts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for receipt items
CREATE POLICY "Users can insert their own receipt items"
  ON receipt_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_items.receipt_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own receipt items"
  ON receipt_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE id = receipt_items.receipt_id
      AND user_id = auth.uid()
    )
  );