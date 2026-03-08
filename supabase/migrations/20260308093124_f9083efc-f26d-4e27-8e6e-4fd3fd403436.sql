
-- Replace overly permissive INSERT policy with one that requires a non-empty client_email
DROP POLICY "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking with valid email" ON public.bookings FOR INSERT WITH CHECK (client_email IS NOT NULL AND client_email <> '');
