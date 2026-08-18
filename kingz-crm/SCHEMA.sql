-- KINGZ CRM Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Create contacts table
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deals table
CREATE TABLE deals (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  value DECIMAL(12, 2),
  stage TEXT DEFAULT 'lead',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_notes_contact_id ON notes(contact_id);
CREATE INDEX idx_notes_deal_id ON notes(deal_id);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (update these based on your auth needs)
CREATE POLICY "contacts_all_access" ON contacts USING (true) WITH CHECK (true);
CREATE POLICY "deals_all_access" ON deals USING (true) WITH CHECK (true);
CREATE POLICY "notes_all_access" ON notes USING (true) WITH CHECK (true);
