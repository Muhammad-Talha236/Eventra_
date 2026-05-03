import { Calendar, Heart, Trophy, Users } from "lucide-react";

const stats = [
  { icon: Calendar, value: "3", label: "Days of action" },
  { icon: Trophy, value: "40+", label: "Events" },
  { icon: Users, value: "28K+", label: "Attendees" },
  { icon: Heart, value: "500+", label: "Volunteers" },
];

export default function About() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[var(--ev-accent)]">About UniFest 2026</p>
        <h1 className="mt-4 text-[40px] font-bold text-[var(--ev-text)] lg:text-[56px] leading-tight">
          A festival built by students, <span className="text-[var(--ev-accent)]">for students.</span>
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-[var(--ev-muted)]">
          UniFest 2026 is the country's largest 3-day university mega event. From e-sports arenas to concert
          grounds, we host 40+ simultaneous events serving 28,000+ attendees from 15 universities.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6 hover:border-[var(--ev-accent-border)] transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ev-accent)]">
              <stat.icon className="h-6 w-6 text-[var(--ev-text)]" />
            </div>
            <p className="mt-4 text-[28px] font-bold text-[var(--ev-text)]">{stat.value}</p>
            <p className="mt-1 text-[13px] text-[var(--ev-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="text-[22px] font-bold text-[var(--ev-text)]">Our Mission</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--ev-muted)]">
            To create a unified, joyful, and unforgettable celebration of student life across art, sport, music and
            tech — all powered by a modern operations platform.
          </p>
        </div>
        <div className="rounded-[14px] border border-[var(--ev-border)] bg-[var(--ev-surface)] p-6">
          <h3 className="text-[22px] font-bold text-[var(--ev-text)]">Our Story</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--ev-muted)]">
            What started as a single inter-university match has grown into the largest student festival in the region
            — driven entirely by student leaders, volunteers and a passionate ops team.
          </p>
        </div>
      </div>
    </div>
  );
}
