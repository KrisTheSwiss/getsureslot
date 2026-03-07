import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  depositCents: number;
  avatar: string;
}

interface StaffCardProps {
  member: StaffMember;
  index: number;
  salonSlug: string;
}

const StaffCard = ({ member, index, salonSlug }: StaffCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        to={`/s/${salonSlug}/book/${member.id}`}
        className="block bg-background p-8 hover:bg-card transition-colors group"
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          <span className="font-display text-sm font-semibold">{member.avatar}</span>
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">{member.name}</h3>
        <p className="font-body text-sm text-muted-foreground mb-4">{member.role}</p>
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-muted-foreground">
            Deposit: CHF {(member.depositCents / 100).toFixed(0)}
          </span>
          <span className="font-display text-xs uppercase tracking-wider text-accent-brand opacity-0 group-hover:opacity-100 transition-opacity">
            Book →
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default StaffCard;
