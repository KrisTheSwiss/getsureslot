-- Allow public to update booking status to cancelled (for cancellation flow)
CREATE POLICY "Public can cancel booking by reference" ON public.bookings
  FOR UPDATE
  TO public
  USING (reference_number IS NOT NULL)
  WITH CHECK (status = 'cancelled');