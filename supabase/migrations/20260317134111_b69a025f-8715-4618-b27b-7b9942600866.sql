
CREATE TABLE public.reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type text NOT NULL, -- '25h' or '2h'
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
  error_message text
);

ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert/read (edge function)
CREATE POLICY "Service role can insert reminder logs"
  ON public.reminder_logs FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can read reminder logs"
  ON public.reminder_logs FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

-- Salon owners can read reminder logs for their bookings
CREATE POLICY "Salon owners can read reminder logs"
  ON public.reminder_logs FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN staff s ON s.id = b.staff_id
      JOIN salons sa ON sa.id = s.salon_id
      WHERE b.id = reminder_logs.booking_id
        AND sa.owner_id = auth.uid()
    )
  );
