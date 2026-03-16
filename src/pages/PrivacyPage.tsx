import { Link } from "react-router-dom";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";
import GlobalFooter from "@/components/GlobalFooter";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-center">
          <Link to="/">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20 flex-1">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Legal
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 font-body text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Entity</h2>
            <p>
              SureSlot is a service provided by Fonque LLC. This Privacy Policy explains how we collect, use,
              and protect your information when you use our platform.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Data Collection</h2>
            <p>
              We collect names and email addresses for the purpose of facilitating bookings. Artists connect
              their calendars and bank accounts through secure, industry-standard partners (Nylas for calendar
              synchronization, Stripe for payment processing).
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Usage</h2>
            <p>
              We only sync "Free/Busy" calendar status to prevent double-bookings. We do not read, store,
              or access private event contents, titles, descriptions, or attendee lists.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Security</h2>
            <p>
              We do not store credit card numbers, bank account numbers, or any sensitive financial credentials.
              All financial data is encrypted and handled exclusively by our industry-standard partners.
              We employ best practices for data protection across our infrastructure.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Data Inquiries</h2>
            <p>
              For questions regarding your data or to request deletion, please contact us at:
            </p>
            <p className="mt-3">
              Fonque LLC<br />
              3400 Cottage Way, Ste G2 #23479<br />
              Sacramento, CA 95825
            </p>
          </section>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default PrivacyPage;
