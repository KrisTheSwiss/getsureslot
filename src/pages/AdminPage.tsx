import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, Calendar, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sureslotWordmark from "@/assets/sureslot-wordmark.png";

const AdminPage = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: salons } = await supabase
        .from("salons")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1);

      if (!salons?.length) { setLoading(false); return; }

      const s = salons[0];
      setSalon(s);

      const [staffRes, bookingsRes] = await Promise.all([
        supabase.from("staff").select("*").eq("salon_id", s.id),
        supabase
          .from("bookings")
          .select("*, staff(name)")
          .in("staff_id", (await supabase.from("staff").select("id").eq("salon_id", s.id)).data?.map((st: any) => st.id) || [])
          .order("start_time", { ascending: false })
          .limit(20),
      ]);

      setStaff(staffRes.data || []);
      setBookings(bookingsRes.data || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <img src={sureslotWordmark} alt="Sureslot" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Admin
            </span>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {!salon ? (
            <div className="text-center py-20">
              <h1 className="font-display text-3xl font-bold mb-4">No Salon Yet</h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                You haven't created a salon. Contact support to get started.
              </p>
            </div>
          ) : (
            <>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Salon Dashboard
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-1">
                {salon.name}
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Public link:{" "}
                <Link to={`/s/${salon.slug}`} className="underline hover:text-foreground transition-colors">
                  /s/{salon.slug}
                </Link>
              </p>
              <div className="swiss-divider my-8" />

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border mb-12">
                <div className="bg-background p-6">
                  <Users className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="font-display text-2xl font-bold">{staff.length}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Staff</p>
                </div>
                <div className="bg-background p-6">
                  <Calendar className="w-4 h-4 text-muted-foreground mb-2" />
                  <p className="font-display text-2xl font-bold">{bookings.length}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Bookings</p>
                </div>
                <div className="bg-background p-6">
                  <p className="font-display text-2xl font-bold">
                    ${bookings.reduce((sum, b) => {
                      const s = staff.find((st) => st.id === b.staff_id);
                      return sum + (s?.deposit_amount_cents || 0);
                    }, 0) / 100}
                  </p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Deposit Total</p>
                </div>
              </div>

              {/* Staff */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-semibold">Staff Members</h2>
                </div>
                {staff.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No staff members yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
                    {staff.map((member) => (
                      <div key={member.id} className="bg-background p-6">
                        <h3 className="font-display text-base font-semibold mb-1">{member.name}</h3>
                        <p className="font-body text-xs text-muted-foreground">
                          Deposit: ${(member.deposit_amount_cents / 100).toFixed(0)}
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          Book link:{" "}
                          <Link to={`/book/${member.id}`} className="underline hover:text-foreground">
                            /book/{member.id.slice(0, 8)}…
                          </Link>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Bookings */}
              <section>
                <h2 className="font-display text-lg font-semibold mb-6">Recent Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="border border-border rounded-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-card">
                          <th className="font-body text-xs uppercase tracking-wider text-muted-foreground text-left px-4 py-3">Client</th>
                          <th className="font-body text-xs uppercase tracking-wider text-muted-foreground text-left px-4 py-3">Staff</th>
                          <th className="font-body text-xs uppercase tracking-wider text-muted-foreground text-left px-4 py-3">Date</th>
                          <th className="font-body text-xs uppercase tracking-wider text-muted-foreground text-left px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-t border-border">
                            <td className="font-body text-sm px-4 py-3">{b.client_email}</td>
                            <td className="font-body text-sm px-4 py-3">{b.staff?.name || "—"}</td>
                            <td className="font-body text-sm px-4 py-3">
                              {new Date(b.start_time).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-body text-xs uppercase tracking-wider px-2 py-1 rounded-sm ${
                                b.status === "confirmed" ? "bg-accent/10 text-accent" :
                                b.status === "paid" ? "bg-green-500/10 text-green-600" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
