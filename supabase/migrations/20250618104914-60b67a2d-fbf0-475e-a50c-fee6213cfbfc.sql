-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  profile_photo TEXT,
  password TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave types table
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  days_allowed INTEGER NOT NULL,
  carry_over BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave applications table
CREATE TABLE public.leave_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES public.employees(id),
  approved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  allocated INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  remaining INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (making them permissive for now since there's no authentication yet)
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow all operations on leave_types" ON public.leave_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on leave_applications" ON public.leave_applications FOR ALL USING (true);
CREATE POLICY "Allow all operations on leave_balances" ON public.leave_balances FOR ALL USING (true);

-- Insert some default leave types
INSERT INTO public.leave_types (name, description, days_allowed, carry_over, color) VALUES
  ('Annual Leave', 'Yearly vacation days for rest and relaxation', 25, true, '#10B981'),
  ('Sick Leave', 'Time off for illness or medical appointments', 10, false, '#EF4444'),
  ('Personal Leave', 'Personal time off for family matters or personal needs', 5, false, '#8B5CF6'),
  ('Maternity Leave', 'Leave for new mothers', 90, false, '#F59E0B'),
  ('Paternity Leave', 'Leave for new fathers', 14, false, '#06B6D4');

-- Insert a default admin user
INSERT INTO public.employees (first_name, last_name, email, position, department, password, is_admin) VALUES
  ('Admin', 'User', 'admin@company.com', 'System Administrator', 'IT', 'admin123', true);

-- Create function to automatically calculate remaining leave balance
CREATE OR REPLACE FUNCTION calculate_remaining_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining = NEW.allocated - NEW.used;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update remaining balance
CREATE TRIGGER update_remaining_balance
  BEFORE INSERT OR UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION calculate_remaining_balance();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON public.leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_applications_updated_at BEFORE UPDATE ON public.leave_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
