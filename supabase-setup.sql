-- Restaurant Operating System Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  is_vegetarian BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15,
  in_stock BOOLEAN DEFAULT true,
  inventory INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number TEXT,
  customer_name TEXT,
  items JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'dine-in',
  payment_mode TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  loyalty_points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  table_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  current_order_id UUID,
  reserved_by TEXT,
  reserved_until TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  customer_name TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true);
CREATE POLICY "Allow all operations on tables" ON tables FOR ALL USING (true);
CREATE POLICY "Allow all operations on service_requests" ON service_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on feedback" ON feedback FOR ALL USING (true);
CREATE POLICY "Allow all operations on loyalty_points" ON loyalty_points FOR ALL USING (true);

-- Insert some sample tables for testing
INSERT INTO tables (number, seats, status) VALUES
(1, 2, 'available'),
(2, 4, 'available'),
(3, 4, 'available'),
(4, 6, 'available'),
(5, 8, 'available')
ON CONFLICT (number) DO NOTHING;

-- Success message
SELECT 'Restaurant Operating System database schema created successfully!' AS message;