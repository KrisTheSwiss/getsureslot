import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, LogOut, ExternalLink, RefreshCw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [staffProfile, setStaffProfile] = useState<any>(null);
  const [salonName, setSalonName] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      // For now, show bookings for all staff the user owns via salon
      // In production, staff would link to auth user
      const { data: salons } = await supabase
        .from("salons")
        .select("id, name")
        .eq("owner_id", user.id);

      if (!salons?.length) { setLoading(false); return; }
      setSalonName(salons[0].name);

      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .eq("salon_id", salons[0].id)
        .limit(1);

      if (staffData?.length) {
        setStaffProfile(staffData[0]);

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("staff_id", staffData[0].id)
          .order("start_time", { ascending: true })
          .limit(30);

        setBookings(bookingsData || []);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleExportCSV = () => {
    if (!bookings.length || !staffProfile) return;
    const PLATFORM_FEE_CENTS = 1000;
    const headers = ["Date", "Booking_Ref", "Salon_Name", "Artist_Name", "Client_Email", "Deposit_Amount", "Sureslot_Fee", "Net_Payout"];
    const rows = bookings.map((b) => {
      const deposit = staffProfile.deposit_amount_cents / 100;
      const fee = PLATFORM_FEE_CENTS / 100;
      const net = deposit - fee;
      return [
        new Date(b.start_time).toLocaleDateString(),
        (b as any).reference_number || "—",
        salonName,
        staffProfile.name,
        b.client_email,
        deposit.toFixed(2),
        fee.toFixed(2),
        net.toFixed(2),
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sureslot-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => new Date(b.start_time) >= new Date());
  const pastBookings = bookings.filter((b) => new Date(b.start_time) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Artist Dashboard
            </span>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {!staffProfile ? (
            <div className="text-center py-20">
              <h1 className="font-display text-3xl font-bold mb-4">No Profile Found</h1>
              <p className="font-body text-sm text-muted-foreground">
                Your artist profile hasn't been set up yet. Ask your salon owner to add you.
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Your Schedule
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-1">
                {staffProfile.name}
              </h1>
              <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                Booking page:{" "}
                <Link to={`/book/${staffProfile.id}`} className="underline hover:text-foreground inline-flex items-center gap-1">
                  /book/{staffProfile.id.slice(0, 8)}…
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
              <div className="mt-4">
                <button
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    const res = await supabase.functions.invoke("nylas-calendar", {
                      body: { action: "getAuthUrl" },
                    });
                    if (res.data?.url) {
                      window.open(res.data.url, "_blank");
                    }
                  }}
                  className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border border-border rounded-sm hover:bg-card transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Calendar
                </button>
              </div>
              <div className="swiss-divider my-8" />

              {/* Export */}
              <div className="mb-8">
                <button
                  onClick={handleExportCSV}
                  disabled={!bookings.length}
                  className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border border-border rounded-sm hover:bg-card transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download for Bookkeeper
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-border mb-12">
                <div className="bg-background p-6">
                  <Calendar className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="font-display text-2xl font-bold">{upcomingBookings.length}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Upcoming</p>
                </div>
                <div className="bg-background p-6">
                  <p className="font-display text-2xl font-bold">
                    ${(staffProfile.deposit_amount_cents / 100).toFixed(0)}
                  </p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Deposit Amount</p>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <section className="mb-12">
                <h2 className="font-display text-lg font-semibold mb-6">Upcoming Bookings</h2>
                {upcomingBookings.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No upcoming bookings.</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingBookings.map((b) => (
                      <div key={b.id} className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
                        <div>
                          {(b as any).reference_number && (
                            <p className="font-mono text-xs text-muted-foreground mb-0.5">{(b as any).reference_number}</p>
                          )}
                          <p className="font-display text-sm font-semibold">
                            {new Date(b.start_time).toLocaleDateString()} at{" "}
                            {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">{b.client_email}</p>
                        </div>
                        <span className={`font-body text-xs uppercase tracking-wider px-2 py-1 rounded-sm ${
                          b.status === "confirmed" ? "bg-accent/10 text-accent" :
                          b.status === "paid" ? "bg-green-500/10 text-green-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <section>
                  <h2 className="font-display text-lg font-semibold mb-6 text-muted-foreground">Past Bookings</h2>
                  <div className="space-y-2 opacity-60">
                    {pastBookings.map((b) => (
                      <div key={b.id} className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm font-semibold">
                            {new Date(b.start_time).toLocaleDateString()}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">{b.client_email}</p>
                        </div>
                        <span className="font-body text-xs uppercase tracking-wider px-2 py-1 rounded-sm bg-muted text-muted-foreground">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
