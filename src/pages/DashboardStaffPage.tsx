import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "@/hooks/use-toast";

const DashboardStaffPage = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDeposit, setNewDeposit] = useState("50");
  const [submitting, setSubmitting] = useState(false);

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
      setSalon(salons[0]);

      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .eq("salon_id", salons[0].id)
        .order("created_at", { ascending: true });

      setStaff(staffData || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon || !newName.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("staff")
      .insert({
        name: newName.trim(),
        salon_id: salon.id,
        deposit_amount_cents: Math.round(parseFloat(newDeposit) * 100),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setStaff((prev) => [...prev, data]);
      setNewName("");
      setNewDeposit("50");
      setShowForm(false);
      toast({ title: "Artist added", description: `${data.name} has been added to your studio.` });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="font-body text-sm text-muted-foreground">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!salon) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 px-6">
          <h1 className="font-display text-3xl font-bold mb-4">No Studio Yet</h1>
          <p className="font-body text-sm text-muted-foreground">
            Your studio hasn't been set up yet. Contact support to get started.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {salon.name}
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight">Staff</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="font-display text-xs uppercase tracking-wider px-5 py-2.5 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Artist
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleAddStaff}
              className="border border-border rounded-sm p-6 mb-8 space-y-4"
            >
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  required
                  className="w-full border border-border rounded-sm px-4 py-2.5 font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(e.target.value)}
                  min="1"
                  step="1"
                  required
                  className="w-full border border-border rounded-sm px-4 py-2.5 font-body text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-display text-xs uppercase tracking-wider px-5 py-2.5 bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Adding…" : "Add Artist"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border border-border rounded-sm hover:bg-card transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* Staff list */}
          {staff.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-sm">
              <p className="font-body text-sm text-muted-foreground mb-4">
                No artists yet. Add your first artist to get started.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="font-display text-xs uppercase tracking-wider px-5 py-2.5 border border-border rounded-sm hover:bg-card transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Your First Artist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border rounded-sm overflow-hidden">
              {staff.map((member) => (
                <div key={member.id} className="bg-background p-6">
                  <h3 className="font-display text-base font-semibold mb-1">{member.name}</h3>
                  <p className="font-body text-xs text-muted-foreground">
                    Deposit: ${(member.deposit_amount_cents / 100).toFixed(0)}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Link
                      to={`/book/${member.id}`}
                      className="underline hover:text-foreground inline-flex items-center gap-1"
                    >
                      Booking page <ExternalLink className="w-3 h-3" />
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStaffPage;
