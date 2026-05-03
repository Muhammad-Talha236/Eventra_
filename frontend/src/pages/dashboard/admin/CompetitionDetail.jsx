import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, X, Plus } from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CompetitionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comp, setComp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "", phone: "", role: "" }]);

  useEffect(() => {
    api.get(`/events/${id}`).then(res => setComp(res.data)).catch(() => toast.error("Failed to load"));
  }, [id]);

  const totalFee = comp?.feeType === 'per_member' ? (comp?.fee || 0) * members.length : (comp?.fee || 0);
  const isValidSize = members.length >= (comp?.teamSize?.min || 1) && members.length <= (comp?.teamSize?.max || 1);

  const handleRegister = async () => {
    if (!teamName.trim()) return toast.error("Team name is required");
    if (!isValidSize) return toast.error(`Team must be between ${comp.teamSize.min} and ${comp.teamSize.max} members.`);
    if (members.some(m => !m.name.trim())) return toast.error("All members must have a name.");
    
    try {
      // Create Team
      const teamRes = await api.post("/teams", { name: teamName, eventId: comp._id, members });
      // Register Team
      await api.post(`/teams/${teamRes.data._id}/register`);
      toast.success("Team registered successfully!");
      navigate("/dashboard/my-teams");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register team.");
    }
  };

  if (!comp) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 space-y-8">
      <div className="rounded-[20px] bg-[var(--ev-surface)] p-8 border border-[var(--ev-border)]">
        <span className="rounded-full bg-[var(--ev-accent-bg)] px-3 py-1 text-[12px] font-medium text-[var(--ev-accent)]">Team Event / {comp.category}</span>
        <h1 className="mt-4 text-[36px] font-bold text-[var(--ev-text)]">{comp.title}</h1>
        <p className="mt-4 text-[16px] text-[var(--ev-muted)] max-w-3xl">{comp.description}</p>
        
        <div className="mt-6 flex flex-wrap gap-6 text-[14px]">
          <div className="flex items-center gap-2 text-[var(--ev-text)]"><Users className="h-5 w-5 text-[var(--ev-muted)]" /> Size: {comp.teamSize?.min} – {comp.teamSize?.max} members</div>
          <div className="flex items-center gap-2 text-[var(--ev-text)]"><span className="font-medium">Fee:</span> {comp.feeType === 'per_team' ? `PKR ${comp.fee} per team` : `PKR ${comp.fee} per member`}</div>
          <div className="flex items-center gap-2 text-[var(--ev-text)]"><span className="font-medium">Registered Teams:</span> {comp.registeredCount} / {comp.capacity} slots</div>
        </div>

        <div className="mt-8">
          <Button onClick={() => setShowModal(true)} size="lg" className="rounded-[10px] bg-[var(--ev-accent)] text-white">Register Your Team →</Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] bg-[var(--ev-surface)] p-8 border border-[var(--ev-border)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-bold text-[var(--ev-text)]">Create Team for {comp.title}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-6 w-6 text-[var(--ev-muted)]" /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[14px] font-medium text-[var(--ev-text)]">Team Name</label>
                <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Phoenix E-Sports" className="mt-1" />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-[14px] font-medium text-[var(--ev-text)]">Members</label>
                  <span className={`text-[12px] font-bold ${isValidSize ? 'text-[var(--ev-success)]' : 'text-[var(--ev-danger)]'}`}>
                    {members.length} / {comp.teamSize.min}–{comp.teamSize.max} players
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {members.map((m, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Input placeholder="Name" value={m.name} onChange={e => { const nm = [...members]; nm[i].name = e.target.value; setMembers(nm); }} />
                      <Input placeholder="Role" value={m.role} onChange={e => { const nm = [...members]; nm[i].role = e.target.value; setMembers(nm); }} />
                      <Button variant="ghost" size="icon" className="shrink-0 text-[var(--ev-danger)]" onClick={() => setMembers(members.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {members.length < comp.teamSize.max && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setMembers([...members, { name: "", email: "", phone: "", role: "" }])}><Plus className="h-4 w-4 mr-2"/> Add Member</Button>
                  )}
                </div>
              </div>
              
              <div className="rounded-[10px] bg-[var(--ev-elevated)] p-4 flex justify-between items-center border border-[var(--ev-border)]">
                <span className="text-[14px] font-medium text-[var(--ev-muted)]">Total Amount to Pay</span>
                <span className="text-[18px] font-bold text-[var(--ev-text)]">PKR {totalFee.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-[var(--ev-accent)] text-white" onClick={handleRegister}>Create Team & Register →</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}