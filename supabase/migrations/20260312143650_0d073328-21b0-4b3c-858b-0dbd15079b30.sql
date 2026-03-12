
CREATE OR REPLACE FUNCTION public.generate_unique_booking_ref()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  new_ref TEXT;
  done BOOL;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_ref := 'SLOT-' || upper(substring(md5(random()::text) from 1 for 6));
    new_ref := translate(new_ref, '01IO', 'ABCE');
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE reference_number = new_ref) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_ref;
END;
$function$;
