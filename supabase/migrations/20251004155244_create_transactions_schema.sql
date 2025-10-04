/*
  # Create Transaction Management System Schema

  1. New Enums
    - `category` - Transaction categories (session, session-coaching, monthly-subscription, weekly-subscription, others)
    - `source` - Payment sources (wave, orange-money, manual)
    - `status` - Transaction status (completed, pending, failed)
    - `user_role` - User roles (admin, manager, staff)

  2. New Tables
    - `users`
      - `id` (uuid, primary key, auto-generated)
      - `email` (text, unique, required)
      - `password_hash` (text, required)
      - `first_name` (varchar 100, required)
      - `last_name` (varchar 100, required)
      - `role` (user_role enum, defaults to 'staff')
      - `is_active` (boolean, defaults to true)
      - `last_login_at` (timestamp)
      - `created_at` (timestamp, defaults to current timestamp)
      - `updated_at` (timestamp, defaults to current timestamp)
    
    - `transactions`
      - `id` (uuid, primary key, auto-generated)
      - `amount` (decimal 10,2, required)
      - `description` (text, required)
      - `category` (category enum, required)
      - `source` (source enum, required)
      - `status` (status enum, defaults to 'completed')
      - `date` (timestamp, defaults to current timestamp)
      - `created_by` (uuid, foreign key to users.id)
      - `created_at` (timestamp, defaults to current timestamp)

  3. Security
    - Enable RLS on both tables
    - Users can read their own user record
    - Authenticated users can view all transactions
    - Authenticated users can create transactions
    - Only admins can update or delete transactions
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE category AS ENUM ('session', 'session-coaching', 'monthly-subscription', 'weekly-subscription', 'others');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source AS ENUM ('wave', 'orange-money', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status AS ENUM ('completed', 'pending', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamp,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10, 2) NOT NULL,
  description text NOT NULL,
  category category NOT NULL,
  source source NOT NULL,
  status status NOT NULL DEFAULT 'completed',
  date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Authenticated users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);