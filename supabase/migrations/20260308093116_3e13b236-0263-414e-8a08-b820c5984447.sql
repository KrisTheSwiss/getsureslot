
-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'no_show', 'paid');

-- Create salons table
CREATE TABLE public.salons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stripe_account_id TEXT,
  nylas_grant_id TEXT,
  deposit_amount_cents INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Salons: public read, owners can manage
CREATE POLICY "Salons are publicly readable" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Owners can insert their salons" ON public.salons FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their salons" ON public.salons FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their salons" ON public.salons FOR DELETE USING (auth.uid() = owner_id);

-- Staff: public read, salon owners can manage
CREATE POLICY "Staff are publicly readable" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Salon owners can insert staff" ON public.staff FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
);
CREATE POLICY "Salon owners can update staff" ON public.staff FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
);
CREATE POLICY "Salon owners can delete staff" ON public.staff FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
);

-- Bookings: anyone can insert, salon owners can read/update
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings readable by salon owners" ON public.bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.salons sa ON sa.id = s.salon_id
    WHERE s.id = staff_id AND sa.owner_id = auth.uid()
  )
);
CREATE POLICY "Salon owners can update bookings" ON public.bookings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.salons sa ON sa.id = s.salon_id
    WHERE s.id = staff_id AND sa.owner_id = auth.uid()
  )
);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_staff_salon_id ON public.staff(salon_id);
CREATE INDEX idx_bookings_staff_id ON public.bookings(staff_id);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_salons_slug ON public.salons(slug);
