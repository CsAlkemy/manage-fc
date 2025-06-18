-- SQL script to add missing columns to employees table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Add password column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add is_admin column  
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update existing admin user
UPDATE public.employees 
SET password = 'admin123', is_admin = true 
WHERE email = 'admin@company.com';

-- Update existing employee user (if exists)
UPDATE public.employees 
SET password = 'employee123', is_admin = false 
WHERE email = 'john.doe@company.com';

-- Verify the changes
SELECT id, first_name, last_name, email, password, is_admin 
FROM public.employees 
ORDER BY created_at; 