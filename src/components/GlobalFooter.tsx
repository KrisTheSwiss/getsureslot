import { Link } from "react-router-dom";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const GlobalFooter = () => (
  <footer className="border-t border-border py-12 px-6">
    <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
      <img src={sureslotWordmark} alt="Sureslot logo" className="h-7 w-auto" loading="lazy" />
      <div className="flex items-center gap-4 font-body text-xs text-muted-foreground">
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Terms of Service
        </Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} Sureslot</span>
      </div>
      <p className="font-body text-[11px] text-muted-foreground/70 text-center max-w-lg leading-relaxed">
        SureSlot is a service provided by Fonque LLC. Registered Address: 3400 Cottage Way, Ste G2 #23479, Sacramento, CA 95825.
      </p>
    </div>
  </footer>
);

export default GlobalFooter;
