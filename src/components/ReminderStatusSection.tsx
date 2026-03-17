import { useEffect, useState } from "react";
import { Mail, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReminderLog {
  id: string;
  booking_id: string;
  reminder_type: string;
  sent_at: string;
  status: string;
  error_message: string | null;
  client_email?: string;
  start_time?: string;
  reference_number?: string;
}

interface Props {
  staffId: string;
}

const ReminderStatusSection = ({ staffId }: Props) => {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      // Get bookings for this staff member, then their reminder logs
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, client_email, start_time, reference_number")
        .eq("staff_id", staffId)
        .order("start_time", { ascending: false })
        .limit(30);

      if (!bookings?.length) {
        setLoading(false);
        return;
      }

      const bookingIds = bookings.map((b) => b.id);
      const { data: reminderData } = await supabase
        .from("reminder_logs" as any)
        .select("*")
        .in("booking_id", bookingIds)
        .order("sent_at", { ascending: false });

      const bookingMap = new Map(bookings.map((b) => [b.id, b]));
      const enriched = ((reminderData as any[]) || []).map((r: any) => {
        const b = bookingMap.get(r.booking_id);
        return {
          ...r,
          client_email: b?.client_email,
          start_time: b?.start_time,
          reference_number: b?.reference_number,
        };
      });

      setLogs(enriched);
      setLoading(false);
    };

    fetchLogs();
  }, [staffId]);

  if (loading) {
    return (
      <div className="py-4">
        <p className="font-body text-sm text-muted-foreground">Loading reminders…</p>
      </div>
    );
  }

  const typeLabel = (t: string) => (t === "25h" ? "Fair Play (25h)" : "Day-Of (2h)");

  return (
    <section className="mb-12">
      <h2 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Reminders
      </h2>
      <p className="font-body text-xs text-muted-foreground mb-6">
        Automated email reminders sent to clients before their appointments.
      </p>

      {logs.length === 0 ? (
        <div className="border border-border rounded-sm p-6 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="font-body text-sm text-muted-foreground">
            No reminders sent yet. They'll appear here once clients have upcoming bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-card border border-border p-4 rounded-sm flex items-center justify-between"
            >
              <div>
                <p className="font-display text-sm font-semibold">
                  {typeLabel(log.reminder_type)}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {log.client_email} · {log.reference_number || "—"}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Appt: {log.start_time ? new Date(log.start_time).toLocaleDateString() : "—"}
                  {" · "}Sent: {new Date(log.sent_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 font-body text-xs uppercase tracking-wider px-2 py-1 rounded-sm ${
                  log.status === "sent"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {log.status === "sent" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {log.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReminderStatusSection;
