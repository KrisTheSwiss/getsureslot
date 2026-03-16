import { Link } from "react-router-dom";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const TermsPage = () => {
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
        <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Legal
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-3">
          Terms of Service
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 font-body text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Provider</h2>
            <p>
              This platform is operated by Fonque LLC ("the Company"). SureSlot is a service provided by Fonque LLC.
              Registered Address: 3400 Cottage Way, Ste G2 #23479, Sacramento, CA 95825.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">The SureSlot Fee</h2>
            <p>
              Users acknowledge that SureSlot retains a fixed $10 non-refundable service fee for every booking.
              This fee covers payment processing and calendar synchronization and is not refundable under any circumstances.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">The 24-Hour Cancellation Rule</h2>
            <p>
              Clients may cancel an appointment more than 24 hours in advance for a refund of their deposit
              (minus the $10 non-refundable service fee).
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Late Cancellation</h2>
            <p>
              Cancellations made within 24 hours of the appointment time are non-refundable.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Privacy</h2>
            <p>
              We use industry-standard encryption for all data. We do not store full credit card details or
              private calendar event contents. Financial transactions are processed securely via Stripe.
            </p>
          </section>

          <div className="swiss-divider" />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Contact</h2>
            <p>
              Fonque LLC<br />
              3400 Cottage Way, Ste G2 #23479<br />
              Sacramento, CA 95825
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-body text-xs text-muted-foreground">
            SureSlot is a service provided by Fonque LLC. Registered Address: 3400 Cottage Way, Ste G2 #23479, Sacramento, CA 95825.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
