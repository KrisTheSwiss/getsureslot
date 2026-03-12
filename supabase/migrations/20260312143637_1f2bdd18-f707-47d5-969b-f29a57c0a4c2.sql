
-- Add 'cancelled' to booking_status enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add reference_number column with default from generate_unique_booking_ref()
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS reference_number text UNIQUE DEFAULT public.generate_unique_booking_ref();

-- RLS policy: allow public to read a booking by reference_number (for manage page)
CREATE POLICY "Public can read booking by reference" 
ON public.bookings FOR SELECT TO public 
USING (reference_number IS NOT NULL);
