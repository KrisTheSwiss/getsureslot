import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Shield } from "lucide-react";

const DEMO_STAFF: Record<string, { name: string; role: string; depositCents: number }> = {
  "1": { name: "Lena Meier", role: "Senior Artist", depositCents: 15000 },
  "2": { name: "Marco Brunner", role: "Tattoo Artist", depositCents: 10000 },
  "3": { name: "Sofia Keller", role: "Piercing Specialist", depositCents: 5000 },
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const BookingPage = () => {
  const { slug, staffId } = useParams<{ slug: string; staffId: string }>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");

  const staff = DEMO_STAFF[staffId || "1"] || DEMO_STAFF["1"];

  const handleConfirm = () => {
    // In production: create booking + Stripe payment intent
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link
            to={`/s/${slug}`}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Booking
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-1">
            {staff.name}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-2">{staff.role}</p>
          <div className="swiss-divider my-8" />
        </motion.div>

        {step === "select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-10"
          >
            {/* Date */}
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Select Date
              </label>
              <div className="mt-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="font-body text-sm bg-card border border-border px-4 py-3 rounded-sm w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Time */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <div className="bg-card border border-border p-8 rounded-sm space-y-6">
              <h3 className="font-display text-lg font-semibold">Booking Summary</h3>
              <div className="space-y-3 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff</span>
                  <span>{staff.name}</span>
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
                  <span>CHF {(staff.depositCents / 100).toFixed(0)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 mt-0.5 text-accent-brand flex-shrink-0" />
                <span>Deposit is charged via Stripe and credited to the artist directly.</span>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full font-display text-sm uppercase tracking-wider px-8 py-4 bg-accent-brand text-accent-foreground rounded-sm hover:opacity-90 transition-opacity"
              >
                Pay Deposit & Confirm
              </button>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-accent-foreground font-display text-xl">✓</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">Booking Confirmed</h2>
            <p className="font-body text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              A confirmation has been sent to {email}. Your deposit of CHF{" "}
              {(staff.depositCents / 100).toFixed(0)} has been processed.
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

export default BookingPage;
