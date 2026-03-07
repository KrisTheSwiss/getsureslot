import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Calendar } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Deposit Protection",
    desc: "Reduce no-shows with upfront deposits via Stripe Connect.",
  },
  {
    icon: Calendar,
    title: "Calendar Sync",
    desc: "Real-time availability powered by Nylas calendar integration.",
  },
  {
    icon: CreditCard,
    title: "Direct Charges",
    desc: "Payments go directly to each staff member's Stripe account.",
  },
  {
    icon: Clock,
    title: "Multi-Tenant",
    desc: "Each salon gets its own branded booking page and dashboard.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Sure<span className="text-accent-brand">slot</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/demo"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
            <Link
              to="/login"
              className="font-body text-sm px-4 py-2 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Booking Infrastructure
              </p>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight mb-8">
                Precision
                <br />
                booking for
                <br />
                modern
                <br />
                <span className="text-accent-brand">salons.</span>
              </h1>
              <div className="swiss-divider mb-8" />
              <p className="font-body text-base text-muted-foreground max-w-md leading-relaxed">
                Multi-tenant scheduling with deposit protection, calendar sync,
                and direct payments — engineered with Swiss precision.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-col gap-1"
            >
              {["01 — Create your salon", "02 — Add staff & services", "03 — Share your booking link", "04 — Collect deposits automatically"].map(
                (step, i) => (
                  <div
                    key={i}
                    className="py-5 border-b border-border font-display text-sm md:text-base tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-default"
                  >
                    {step}
                  </div>
                )
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-12">
            Core Features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-background p-8 flex flex-col gap-4"
              >
                <f.icon className="w-5 h-5 text-accent-brand" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to eliminate
            <br />
            no-shows?
          </h2>
          <p className="font-body text-muted-foreground mb-10 max-w-md mx-auto">
            Set up your salon in minutes. Start collecting deposits today.
          </p>
          <Link
            to="/demo"
            className="inline-block font-display text-sm px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity tracking-wide uppercase"
          >
            View Demo Salon
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-display text-sm font-bold">
            Sure<span className="text-accent-brand">slot</span>
          </p>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sureslot. Engineered with precision.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
