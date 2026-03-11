import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const PublicBookingPage = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const [staffMember, setStaffMember] = useState<any>(null);
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [submitting, setSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!staffId) return;
      const { data: staff } = await supabase
        .from("staff")
        .select("*, salons(name, slug)")
        .eq("id", staffId)
        .single();

      if (staff) {
        setStaffMember(staff);
        setSalonName((staff as any).salons?.name || "");
      }
      setLoading(false);
    };
    load();
  }, [staffId]);

  const handleConfirm = async () => {
    if (!staffId || !selectedDate || !selectedTime || !email) return;
    setSubmitting(true);

    const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const { error } = await supabase.from("bookings").insert({
      staff_id: staffId,
      client_email: email,
      start_time: startTime,
    });

    if (!error) {
      setStep("done");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Staff Not Found</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            This booking link may be invalid.
          </p>
          <Link to="/" className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Sureslot
          </Link>
        </div>
      </div>
    );
  }

  const depositCHF = (staffMember.deposit_amount_cents / 100).toFixed(0);

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
            Book an Appointment
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-1">
            {staffMember.name}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-2">
            Deposit: CHF {depositCHF}
          </p>
          <div className="swiss-divider my-8" />
        </motion.div>

        {step === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-10">
            {/* Date */}
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-4 font-body text-sm bg-card border border-border px-4 py-3 rounded-sm w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            {/* Time */}
            {selectedDate && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Select Time
                </label>
                <div className="mt-4 grid grid-cols-4 md:grid-cols-7 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`font-display text-sm py-3 border rounded-sm transition-all ${
                        selectedTime === time
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Email */}
            {selectedTime && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                  Your Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-4 font-body text-sm bg-card border border-border px-4 py-3 rounded-sm w-full max-w-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </motion.div>
            )}

            {selectedDate && selectedTime && email && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={() => setStep("confirm")}
                  className="font-display text-sm uppercase tracking-wider px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity"
                >
                  Continue to Deposit
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <div className="bg-card border border-border p-8 rounded-sm space-y-6">
              <h3 className="font-display text-lg font-semibold">Booking Summary</h3>
              <div className="space-y-3 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff</span>
                  <span>{staffMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="swiss-divider" />
                <div className="flex justify-between font-display font-semibold">
                  <span>Deposit Required</span>
                  <span>CHF {depositCHF}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Deposit is charged via Stripe and credited to the artist directly.</span>
              </div>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full font-display text-sm uppercase tracking-wider px-8 py-4 bg-accent text-accent-foreground rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Pay Deposit & Confirm"}
              </button>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-accent-foreground font-display text-xl">✓</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Booking Confirmed</h2>
            <p className="font-body text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              A confirmation has been sent to {email}. Your deposit of CHF {depositCHF} has been processed.
            </p>
            <Link
              to="/"
              className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Sureslot
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicBookingPage;
