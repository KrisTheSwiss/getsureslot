import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const ManageBookingPage = () => {
  const { referenceNumber } = useParams<{ referenceNumber: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [staffName, setStaffName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [depositCents, setDepositCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!referenceNumber) return;
      const { data } = await supabase
        .from("bookings")
        .select("*, staff(name, deposit_amount_cents, salons(name))")
        .eq("reference_number", referenceNumber.toUpperCase())
        .single();

      if (data) {
        setBooking(data);
        setStaffName((data as any).staff?.name || "");
        setSalonName((data as any).staff?.salons?.name || "");
        setDepositCents((data as any).staff?.deposit_amount_cents || 0);
      }
      setLoading(false);
    };
    load();
  }, [referenceNumber]);

  const hoursUntil = booking
    ? (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
    : 0;

  const canCancel = booking && hoursUntil > 24 && booking.status !== "cancelled";
  const isNonRefundable = booking && hoursUntil <= 24 && hoursUntil > 0 && booking.status !== "cancelled";
  const isPast = booking && hoursUntil <= 0;

  const handleCancel = async () => {
    if (!booking || !canCancel) return;
    setCancelling(true);

    // TODO: Trigger Stripe refund via edge function (deposit minus $10 platform fee)
    // For now, update status to cancelled
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" as any })
      .eq("id", booking.id);

    if (!error) {
      setCancelled(true);
      setBooking({ ...booking, status: "cancelled" });
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Booking Not Found</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            No booking matches reference <span className="font-mono">{referenceNumber?.toUpperCase()}</span>.
          </p>
          <Link to="/" className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Sureslot
          </Link>
        </div>
      </div>
    );
  }

  const refundAmount = ((depositCents - 1000) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">{salonName}</span>
          <Link to="/" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Manage Booking
          </p>

          {/* Reference Number - prominent */}
          <div className="mb-6">
            <span className="font-mono text-3xl md:text-4xl font-bold tracking-wider text-foreground">
              {booking.reference_number}
            </span>
          </div>

          <div className="swiss-divider my-8" />

          <div className="bg-card border border-border p-8 rounded-sm space-y-6 max-w-md">
            <div className="space-y-3 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artist</span>
                <span>{staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                <span>{new Date(booking.start_time).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                <span>{new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <span>{booking.client_email}</span>
              </div>
              <div className="swiss-divider" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Paid</span>
                <span className="font-display font-semibold">CHF {(depositCents / 100).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-body text-xs uppercase tracking-wider px-2 py-1 rounded-sm ${
                  booking.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                  booking.status === "confirmed" ? "bg-accent/10 text-accent" :
                  booking.status === "paid" ? "bg-green-500/10 text-green-600" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Cancellation section */}
            {booking.status === "cancelled" && (
              <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-sm">
                <p className="font-body text-sm text-destructive font-medium">This booking has been cancelled.</p>
                {cancelled && (
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    A refund of CHF {refundAmount} (minus CHF 10 platform fee) is being processed.
                  </p>
                )}
              </div>
            )}

            {canCancel && (
              <div className="space-y-3">
                <p className="font-body text-xs text-muted-foreground">
                  You may cancel and receive a refund of <strong>CHF {refundAmount}</strong> (deposit minus CHF 10 platform fee).
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full font-display text-sm uppercase tracking-wider px-8 py-4 bg-destructive text-destructive-foreground rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {cancelling ? "Processing…" : "Cancel & Refund"}
                </button>
              </div>
            )}

            {isNonRefundable && (
              <div className="bg-muted/50 border border-border p-4 rounded-sm flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="font-body text-sm text-muted-foreground">
                  Non-refundable window active. Contact the studio for assistance.
                </p>
              </div>
            )}

            {isPast && booking.status !== "cancelled" && (
              <p className="font-body text-xs text-muted-foreground">This appointment has already passed.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageBookingPage;
