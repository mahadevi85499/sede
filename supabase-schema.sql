-- Restaurant Management System Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    seats INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    current_order_id UUID,
    reserved_by TEXT,
    reserved_until TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests table
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number INTEGER NOT NULL,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number INTEGER NOT NULL,
    order_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Points table
CREATE TABLE loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some indexes for better performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_in_stock ON menu_items(in_stock);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_loyalty_points_customer_id ON loyalty_points(customer_id);

-- Add some constraints
ALTER TABLE orders ADD CONSTRAINT chk_order_status 
    CHECK (status IN ('pending', 'preparing', 'ready', 'completed'));

ALTER TABLE orders ADD CONSTRAINT chk_order_type 
    CHECK (order_type IN ('dine-in', 'takeout', 'delivery'));

ALTER TABLE reservations ADD CONSTRAINT chk_reservation_status 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

ALTER TABLE tables ADD CONSTRAINT chk_table_status 
    CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance'));

ALTER TABLE service_requests ADD CONSTRAINT chk_request_type 
    CHECK (request_type IN ('staff', 'water', 'hot-water', 'cleaning'));

ALTER TABLE service_requests ADD CONSTRAINT chk_service_status 
    CHECK (status IN ('pending', 'completed'));

-- Enable Row Level Security (RLS) if needed
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true);
CREATE POLICY "Allow all operations on tables" ON tables FOR ALL USING (true);
CREATE POLICY "Allow all operations on service_requests" ON service_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on feedback" ON feedback FOR ALL USING (true);
CREATE POLICY "Allow all operations on loyalty_points" ON loyalty_points FOR ALL USING (true);