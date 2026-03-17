import { createClient } from 'npm:@supabase/supabase-js@2'

const SITE_URL = 'https://getsureslot.lovable.app'

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()

  // Fetch upcoming confirmed/paid bookings in the next 26 hours
  const windowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000)
  const { data: bookings, error: bErr } = await supabase
    .from('bookings')
    .select('id, start_time, client_email, reference_number, staff_id')
    .in('status', ['confirmed', 'paid'])
    .gte('start_time', now.toISOString())
    .lte('start_time', windowEnd.toISOString())

  if (bErr) {
    console.error('Failed to fetch bookings', bErr)
    return new Response(JSON.stringify({ error: bErr.message }), { status: 500 })
  }

  if (!bookings?.length) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get all booking IDs to check which reminders already sent
  const bookingIds = bookings.map((b) => b.id)
  const { data: existingLogs } = await supabase
    .from('reminder_logs')
    .select('booking_id, reminder_type')
    .in('booking_id', bookingIds)
    .eq('status', 'sent')

  const sentSet = new Set(
    (existingLogs || []).map((l) => `${l.booking_id}:${l.reminder_type}`)
  )

  // Get staff names
  const staffIds = [...new Set(bookings.map((b) => b.staff_id))]
  const { data: staffRows } = await supabase
    .from('staff')
    .select('id, name')
    .in('id', staffIds)

  const staffMap = new Map((staffRows || []).map((s) => [s.id, s.name]))

  let processed = 0

  for (const booking of bookings) {
    const startTime = new Date(booking.start_time)
    const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const artistName = staffMap.get(booking.staff_id) || 'your artist'
    const manageUrl = `${SITE_URL}/manage/${booking.reference_number}`
    const timeStr = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles',
    })
    const dateStr = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    })

    // 25-hour reminder (send between 24.5h and 25.5h before)
    if (hoursUntil >= 24.5 && hoursUntil <= 25.5) {
      const key = `${booking.id}:25h`
      if (!sentSet.has(key)) {
        try {
          await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              to: booking.client_email,
              from: 'SureSlot <notify@notify.getsureslot.com>',
              sender_domain: 'notify.getsureslot.com',
              subject: `Reminder: Your session with ${artistName} is tomorrow`,
              html: render25hEmail(booking.client_email, artistName, dateStr, timeStr, manageUrl),
              text: `Hi, this is a courtesy reminder for your session with ${artistName} on ${dateStr} at ${timeStr}. You have one hour left to cancel or reschedule and still receive your deposit refund (minus the $10 service fee). After that, the 24-hour non-refundable window begins. Manage your booking: ${manageUrl}`,
              purpose: 'transactional',
              label: 'reminder-25h',
              message_id: `reminder-25h-${booking.id}`,
              queued_at: new Date().toISOString(),
            },
          })
          await supabase.from('reminder_logs').insert({
            booking_id: booking.id,
            reminder_type: '25h',
            status: 'sent',
          })
          processed++
        } catch (err) {
          console.error('Failed to enqueue 25h reminder', booking.id, err)
          await supabase.from('reminder_logs').insert({
            booking_id: booking.id,
            reminder_type: '25h',
            status: 'failed',
            error_message: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // 2-hour reminder (send between 1.5h and 2.5h before)
    if (hoursUntil >= 1.5 && hoursUntil <= 2.5) {
      const key = `${booking.id}:2h`
      if (!sentSet.has(key)) {
        try {
          await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              to: booking.client_email,
              from: 'SureSlot <notify@notify.getsureslot.com>',
              sender_domain: 'notify.getsureslot.com',
              subject: `See you soon! Your appointment starts in 2 hours`,
              html: render2hEmail(artistName, timeStr, manageUrl),
              text: `See you soon! Your appointment at the studio starts in two hours. Need to check details? ${manageUrl}`,
              purpose: 'transactional',
              label: 'reminder-2h',
              message_id: `reminder-2h-${booking.id}`,
              queued_at: new Date().toISOString(),
            },
          })
          await supabase.from('reminder_logs').insert({
            booking_id: booking.id,
            reminder_type: '2h',
            status: 'sent',
          })
          processed++
        } catch (err) {
          console.error('Failed to enqueue 2h reminder', booking.id, err)
          await supabase.from('reminder_logs').insert({
            booking_id: booking.id,
            reminder_type: '2h',
            status: 'failed',
            error_message: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }
  }

  return new Response(JSON.stringify({ processed }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function render25hEmail(
  clientEmail: string,
  artistName: string,
  dateStr: string,
  timeStr: string,
  manageUrl: string
): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;">
<tr><td style="padding:32px 40px 24px;">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;margin:0 0 24px;">SureSlot · Reminder</p>
  <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 16px;line-height:1.3;">Your session is tomorrow</h1>
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
    Hi, this is a courtesy reminder for your session with <strong>${artistName}</strong> on <strong>${dateStr}</strong> at <strong>${timeStr}</strong>.
  </p>
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
    You have <strong>one hour left</strong> to cancel or reschedule and still receive your deposit refund (minus the $10 service fee). After that, the 24-hour non-refundable window begins.
  </p>
  <p style="margin:24px 0;">
    <a href="${manageUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Manage Booking</a>
  </p>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #e5e5e5;">
  <p style="font-size:11px;color:#999;margin:0;line-height:1.5;">
    SureSlot is a service provided by Fonque LLC. 3400 Cottage Way, Ste G2 #23479, Sacramento, CA 95825.
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function render2hEmail(
  artistName: string,
  timeStr: string,
  manageUrl: string
): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;">
<tr><td style="padding:32px 40px 24px;">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#999;margin:0 0 24px;">SureSlot · Reminder</p>
  <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 16px;line-height:1.3;">See you soon!</h1>
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
    Your appointment with <strong>${artistName}</strong> starts in <strong>two hours</strong> at <strong>${timeStr}</strong>.
  </p>
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
    Need to check details?
  </p>
  <p style="margin:24px 0;">
    <a href="${manageUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">View Booking</a>
  </p>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #e5e5e5;">
  <p style="font-size:11px;color:#999;margin:0;line-height:1.5;">
    SureSlot is a service provided by Fonque LLC. 3400 Cottage Way, Ste G2 #23479, Sacramento, CA 95825.
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}
