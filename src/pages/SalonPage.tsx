import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StaffCard from "@/components/StaffCard";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

// Demo data
const DEMO_SALON = {
  name: "Zürich Ink Studio",
  slug: "zurich-ink",
  staff: [
    { id: "1", name: "Lena Meier", role: "Senior Artist", depositCents: 15000, avatar: "LM" },
    { id: "2", name: "Marco Brunner", role: "Tattoo Artist", depositCents: 10000, avatar: "MB" },
    { id: "3", name: "Sofia Keller", role: "Piercing Specialist", depositCents: 5000, avatar: "SK" },
  ],
};

const SalonPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // In production, fetch salon by slug
  const salon = DEMO_SALON;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Sureslot home" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot logo" className="h-8 w-auto" loading="lazy" />
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Book an Appointment
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
            {salon.name}
          </h1>
          <div className="swiss-divider my-8" />
        </motion.div>

        <div className="space-y-1">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Select a Staff Member
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {salon.staff.map((member, i) => (
              <StaffCard key={member.id} member={member} index={i} salonSlug={slug || "demo"} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonPage;

