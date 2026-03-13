import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Calendar, CreditCard, Settings, Lock } from "lucide-react";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const steps = [
  {
    icon: User,
    number: "01",
    title: "Identity",
    description:
      "Complete your professional profile and upload your portfolio link.",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Sync Calendar",
    description:
      "Securely connect your Google, Outlook, or Apple Calendar (iCloud). We only see your 'busy' blocks to prevent double-bookings—your private appointment details stay private.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Secure Payments",
    description:
      "Connect your bank account to receive instant deposit payouts. Have your Routing and Account numbers ready. This ensures your cut lands in your pocket automatically.",
  },
  {
    icon: Settings,
    number: "04",
    title: "Set Your Rules",
    description: "Confirm your working hours and services.",
  },
];

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-center">
          <Link to="/">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Getting Started
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Welcome to the Studio.
          </h1>
          <p className="font-body text-base text-muted-foreground max-w-md">
            Connect your tools in 2 minutes so you can focus on the chair.
          </p>

          <div className="swiss-divider my-12" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-10 h-10 border border-border rounded-sm flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground mb-1">
                    Step {step.number}
                  </p>
                  <h2 className="font-display text-lg font-semibold mb-1">
                    {step.title}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="swiss-divider my-12" />

          <div className="flex items-start gap-2 text-muted-foreground">
            <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="font-body text-xs leading-relaxed">
              We use industry-standard partners like Stripe to keep your banking
              data encrypted and secure.
            </p>
          </div>

          <div className="mt-12">
            <Link
              to="/dashboard"
              className="font-display text-sm uppercase tracking-wider px-8 py-4 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity inline-block"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;
