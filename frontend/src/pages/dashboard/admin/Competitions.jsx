import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Users, ArrowRight } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await api.get("/events");
        // Filter only team registration events from raw response
        setCompetitions(res.data.filter(e => e.registrationType === 'team'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 space-y-8">
      <div>
        <h1 className="text-[36px] font-bold text-[var(--ev-text)]">Sports & Competitions</h1>
        <p className="mt-2 text-[var(--ev-muted)]">Form your squad and conquer the challenges at UniFest 2026.</p>
      </div>

      {loading ? <div className="text-[var(--ev-muted)]">Loading competitions...</div> : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((comp) => (
            <div key={comp._id} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-5 hover:border-[var(--ev-accent-border)] transition-colors flex flex-col">
              <span className="self-start rounded-full bg-[var(--ev-accent-bg)] px-3 py-1 text-[11px] font-medium text-[var(--ev-accent)] mb-3">Team Event</span>
              <h3 className="text-[20px] font-bold text-[var(--ev-text)]">{comp.title}</h3>
              <p className="mt-2 text-[14px] text-[var(--ev-muted)] flex items-center gap-2"><Users className="h-4 w-4" /> Team Size: {comp.teamSize?.min} – {comp.teamSize?.max} players</p>
              <p className="mt-1 text-[14px] text-[var(--ev-muted)] flex items-center gap-2"><Trophy className="h-4 w-4" /> {comp.feeType === 'per_team' ? `PKR ${comp.fee} / Team` : `PKR ${comp.fee} / Member`}</p>
              
              <Button asChild className="mt-6 w-full rounded-[10px] bg-[var(--ev-accent)] text-white hover:bg-[var(--ev-accent-hover)]">
                <Link to={`/competitions/${comp._id}`}>Register Your Team <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}