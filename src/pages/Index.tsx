import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const features = [
  {
    icon: Shield,
    title: "No-Show Protection",
    desc: "Require a deposit before booking so empty slots stop draining your day.",
  },
  {
    icon: Calendar,
    title: "Calendar Control",
    desc: "Open only the hours you actually want to work, synced in real time.",
  },
  {
    icon: Clock,
    title: "Reminder Sequence",
    desc: "Automated reminders reduce forgetful no-shows before they hit your schedule.",
  },
  {
    icon: CreditCard,
    title: "Direct Payouts",
    desc: "Deposits and payments go straight to each artist without payout friction.",
  },
];

const Index = () => {
  const [firstStaffId, setFirstStaffId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("staff")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data?.length) setFirstStaffId(data[0].id);
      });
  }, []);

  const demoLink = firstStaffId ? `/book/${firstStaffId}` : "/demo";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Sureslot home" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot logo" className="h-8 w-auto" loading="lazy" />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to={demoLink}
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
                Protect Your Time
              </p>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight mb-8">
                Your skill is
                <br />
                world-class.
                <br />
                Your time is
                <br />
                finite.
                <br />
                <span className="text-accent-brand">Protect both.</span>
              </h1>
              <div className="swiss-divider mb-8" />
              <p className="font-body text-base text-muted-foreground max-w-md leading-relaxed">
                A deposit protects your wallet, but a no-show still steals an hour of your life. We are here to protect both.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-col gap-1"
            >
              {[
                "01 — Set your no-show deposit",
                "02 — Share your booking link",
                "03 — Let reminders do the chasing",
                "04 — Keep your day protected",
              ].map((step, i) => (
                <div
                  key={i}
                  className="py-5 border-b border-border font-display text-sm md:text-base tracking-wide text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  {step}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-12">
            Time Protection System
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
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Owners */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            For Studio Owners &amp; Managers
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
                Scaling your studio shouldn&apos;t mean scaling your headaches.
              </h2>
              <div className="swiss-divider mb-6" />
              <p className="font-body text-base text-muted-foreground max-w-md leading-relaxed mb-10">
                Sureslot allows you to manage 2 to 20+ artists under one roof while ensuring every professional gets paid directly.
              </p>
              <Link
                to={demoLink}
                className="inline-block font-display text-sm px-8 py-4 bg-accent-brand text-background rounded-sm hover:opacity-90 transition-opacity tracking-wide uppercase"
              >
                Schedule a White-Glove Onboarding
              </Link>
            </div>
            <div className="flex flex-col gap-px bg-border">
              {[
                {
                  title: "Centralized Manager Dashboard",
                  desc: "One view to oversee every artist's bookings, deposits, and availability across your entire studio.",
                },
                {
                  title: "Independent Artist Onboarding",
                  desc: "Each artist sets their own schedule, deposit rules, and services — no bottleneck through management.",
                },
                {
                  title: "Real-Time Availability for the Entire Shop",
                  desc: "Clients see live openings for every artist in your studio from a single booking page.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className="bg-background p-8"
                >
                  <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Protect your calendar,
            <br />
            not just your revenue.
          </h2>
          <p className="font-body text-muted-foreground mb-10 max-w-md mx-auto">
            Set up your booking flow in minutes and stop losing your best hours to no-shows.
          </p>
          <Link
            to={demoLink}
            className="inline-block font-display text-sm px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity tracking-wide uppercase"
          >
            View Demo Salon
          </Link>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
};

export default Index;

