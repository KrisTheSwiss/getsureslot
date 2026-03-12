import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!ref) { setConfirming(false); return; }

    const confirmPayment = async () => {
      try {
        const res = await supabase.functions.invoke("confirm-payment", {
          body: { referenceNumber: ref },
        });
        if (res.data?.confirmed) {
          setConfirmed(true);
        }
      } catch {
        // Silent fail — booking still exists
      }
      setConfirming(false);
    };

    confirmPayment();
  }, [ref]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-center">
          <Link to="/" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
          {confirming ? (
            <p className="font-body text-sm text-muted-foreground">Confirming your payment…</p>
          ) : (
            <>
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-foreground font-display text-xl">✓</span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">
                {confirmed ? "Booking Confirmed" : "Booking Received"}
              </h2>
              {ref && (
                <p className="font-mono text-2xl font-bold tracking-wider text-foreground mb-4">
                  {ref}
                </p>
              )}
              <p className="font-body text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                {confirmed
                  ? "Your deposit has been processed and your appointment is confirmed."
                  : "Your booking has been received. We're processing your payment."}
              </p>
              {ref && (
                <Link
                  to={`/manage/${ref}`}
                  className="font-body text-sm text-muted-foreground underline hover:text-foreground transition-colors mb-8 inline-block"
                >
                  Manage or cancel this booking →
                </Link>
              )}
              <div className="mt-6">
                <Link
                  to="/"
                  className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Sureslot
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
