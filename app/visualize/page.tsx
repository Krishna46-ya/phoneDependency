"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "motion/react";
import CountUp from "react-countup";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];


const YELLOW = "#e8c547";
const BG = "#0a0a08";
const FG = "#f0ede6";
const MUTED = "#6a6a60";
const BORDER = "#2a2a24";
const RED = "#e85447";
const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

/* ─── types ─── */
interface Inputs {
  dailyHours: number;
  age: number;
  lifeExpectancy: number;
  mainUse: string;
}

interface Stats {
  dailyMins: number;
  weeklyHours: number;
  yearlyDays: number;
  lifetimeYears: number;
  lifetimeMonths: number;
  checksPerDay: number;
  yearlyChecks: number;
  percentAwake: number;
  yearsLeft: number;
  screenYearsLeft: number;
  lifetimeScrollMeters: number;
  score: number;
}

/* ─── calculations ─── */
function calcStats(inputs: Inputs): Stats {
  const { dailyHours, age, lifeExpectancy } = inputs;
  const yearsLeft = Math.max(lifeExpectancy - age, 1);
  const dailyMins = dailyHours * 60;
  const weeklyHours = dailyHours * 7;
  const yearlyDays = (dailyHours * 365) / 24;
  const lifetimeYears = (dailyHours * 365 * yearsLeft) / (24 * 365);
  const lifetimeMonths = lifetimeYears * 12;
  const checksPerDay = Math.round(dailyHours * 20);
  const yearlyChecks = checksPerDay * 365;
  const percentAwake = (dailyHours / 16) * 100;
  const screenYearsLeft = dailyHours * yearsLeft * 365 / (24 * 365);
  // avg scroll speed ~90m/hr
  const lifetimeScrollMeters = dailyHours * 90 * 365 * yearsLeft;
  // score 0-100 (lower is better)
  const score = Math.min(100, Math.round((dailyHours / 12) * 100));
  return {
    dailyMins, weeklyHours, yearlyDays, lifetimeYears, lifetimeMonths,
    checksPerDay, yearlyChecks, percentAwake, yearsLeft, screenYearsLeft,
    lifetimeScrollMeters, score,
  };
}

function getVerdict(hours: number) {
  if (hours <= 1) return { label: "MINIMAL", color: "#4ade80", desc: "You're one of the rare ones. Keep it up." };
  if (hours <= 2) return { label: "MODERATE", color: "#a3e635", desc: "Better than average — but room to improve." };
  if (hours <= 4) return { label: "CONCERNING", color: YELLOW, desc: "You're spending a significant chunk of your life on screens." };
  if (hours <= 6) return { label: "SERIOUS", color: "#f97316", desc: "Your phone is your most used object. That should worry you." };
  return { label: "CRITICAL", color: RED, desc: "You're essentially living a second life inside your phone." };
}

/* ─── cursor ─── */
function Cursor() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const x = useSpring(mx, { stiffness: 500, damping: 35 });
  const y = useSpring(my, { stiffness: 500, damping: 35 });
  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);
  return (
    <motion.div style={{
      position: "fixed", left: x, top: y, x: "-50%", y: "-50%",
      width: 22, height: 22, border: `2px solid ${YELLOW}`, borderRadius: "50%",
      pointerEvents: "none", zIndex: 9999, mixBlendMode: "difference",
    }} />
  );
}

/* ─── animated number card ─── */
function StatCard({
  label, value, unit, sub, color = YELLOW, delay = 0, highlight = false,
}: {
  label: string; value: number; unit: string; sub?: string;
  color?: string; delay?: number; highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.65, ease: EASE }}
      whileHover={{ borderColor: color, backgroundColor: `${color}06` }}
      style={{
        border: `1px solid ${highlight ? color : BORDER}`,
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        background: highlight ? `${color}08` : "transparent",
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      {highlight && (
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at 50% 0%, ${color}40 0%, transparent 70%)`,
          }}
        />
      )}
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: MUTED, marginBottom: "0.75rem", fontFamily: MONO }}>
        {label}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 4vw, 3rem)", color, lineHeight: 1, position: "relative" }}>
        <CountUp end={value} duration={1.8} decimals={value % 1 !== 0 ? 1 : 0} delay={delay} />
        <span style={{ fontSize: "1rem", marginLeft: "0.3rem", color: `${color}aa` }}>{unit}</span>
      </div>
      {sub && (
        <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: "0.5rem", fontFamily: MONO, lineHeight: 1.5 }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

/* ─── score ring ─── */
function ScoreRing({ score, verdict }: { score: number; verdict: ReturnType<typeof getVerdict> }) {
  const data = [
    { value: score, fill: verdict.color },
    { value: 100 - score, fill: "#1a1a14" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.7, type: "spring", stiffness: 150 }}
      style={{ textAlign: "center", padding: "2rem" }}
    >
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: MUTED, marginBottom: "1rem", fontFamily: MONO }}>
        DEPENDENCY SCORE
      </div>
      <div style={{ width: 180, height: 180, margin: "0 auto", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            data={data} startAngle={90} endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: SERIF, fontSize: "2.5rem", color: verdict.color, lineHeight: 1 }}>
            <CountUp end={score} duration={2} />
          </div>
          <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: MUTED, fontFamily: MONO }}>/100</div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: "1rem",
          fontSize: "0.8rem", letterSpacing: "0.2em",
          color: verdict.color, fontFamily: MONO, fontWeight: 700,
        }}
      >
        {verdict.label}
      </motion.div>
      <div style={{ fontSize: "0.72rem", color: MUTED, marginTop: "0.5rem", fontFamily: MONO, maxWidth: 200, margin: "0.5rem auto 0" }}>
        {verdict.desc}
      </div>
    </motion.div>
  );
}

/* ─── projection chart ─── */
function ProjectionChart({ inputs, stats }: { inputs: Inputs; stats: Stats }) {
  const years = Array.from({ length: 11 }, (_, i) => i * 5).filter(y => y <= stats.yearsLeft);
  const data = years.map(yr => ({
    year: `+${yr}yr`,
    screen: parseFloat(((inputs.dailyHours * 365 * yr) / (24 * 365)).toFixed(1)),
    free: parseFloat(((16 * 365 * yr) / (24 * 365) - (inputs.dailyHours * 365 * yr) / (24 * 365)).toFixed(1)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.65 }}
      style={{ border: `1px solid ${BORDER}`, padding: "2rem" }}
    >
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: MUTED, marginBottom: "1.5rem", fontFamily: MONO }}>
        CUMULATIVE YEARS LOST TO SCREEN — LIFETIME PROJECTION
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={RED} stopOpacity={0.3} />
              <stop offset="95%" stopColor={RED} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="freeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={YELLOW} stopOpacity={0.15} />
              <stop offset="95%" stopColor={YELLOW} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
          <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 10, fontFamily: MONO }} />
          <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: MONO }} />
          <Tooltip
            contentStyle={{ background: "#111110", border: `1px solid ${BORDER}`, fontFamily: MONO, fontSize: 11 }}
            labelStyle={{ color: YELLOW }}
            itemStyle={{ color: FG }}
            formatter={(v, name) => [`${v ?? 0} yrs`, name === "screen" ? "Screen time" : "Free time"] as [string, string]}
          />
          <Area type="monotone" dataKey="screen" stroke={RED} strokeWidth={2} fill="url(#screenGrad)" name="screen" />
          <Area type="monotone" dataKey="free" stroke={YELLOW} strokeWidth={2} fill="url(#freeGrad)" name="free" />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
        {[{ color: RED, label: "Screen time lost" }, { color: YELLOW, label: "Waking free time" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: MONO, fontSize: "0.65rem", color: MUTED }}>
            <div style={{ width: 24, height: 2, background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── analog alternatives ─── */
const alternatives: Record<string, { icon: string; alt: string; benefit: string }[]> = {
  "Social Media":   [{ icon: "📖", alt: "Physical journal", benefit: "Deeper reflection, zero dopamine loops" }, { icon: "☕", alt: "Coffee with a friend", benefit: "Real connection vs parasocial scrolling" }, { icon: "🎨", alt: "Sketchbook / doodling", benefit: "Creative outlet, no algorithm" }],
  "Videos/YouTube": [{ icon: "📚", alt: "Library book", benefit: "40× more retention than passive video" }, { icon: "🎙️", alt: "Podcast (audio only)", benefit: "Learn while moving, no screen needed" }, { icon: "🎭", alt: "Local events / theatre", benefit: "Live experiences beat recorded ones" }],
  "Gaming":         [{ icon: "♟️", alt: "Board games / chess", benefit: "Social, tactile, zero screen addiction loops" }, { icon: "🧩", alt: "Puzzles / Rubik's cube", benefit: "Same problem-solving, zero screen" }, { icon: "🏃", alt: "Competitive sport", benefit: "Physical challenge with real stakes" }],
  "News/Browse":    [{ icon: "📰", alt: "Physical newspaper", benefit: "Curated, finite — no infinite scroll" }, { icon: "🗺️", alt: "Walk without GPS", benefit: "Builds spatial memory and presence" }, { icon: "📻", alt: "Radio", benefit: "Stay informed, hands and eyes free" }],
  "Work/Study":     [{ icon: "📓", alt: "Paper notes / notebooks", benefit: "2× better recall than typing" }, { icon: "⏱️", alt: "Pomodoro with paper timer", benefit: "Physical timer = no app distractions" }, { icon: "🖥️", alt: "Dedicated desktop only", benefit: "Phone-free work zone boundaries" }],
};

/* ════════════════════════════════════════
   INPUT FORM
════════════════════════════════════════ */
function InputForm({ onSubmit }: { onSubmit: (i: Inputs) => void }) {
  const [form, setForm] = useState<Inputs>({ dailyHours: 4, age: 22, lifeExpectancy: 78, mainUse: "Social Media" });
  const [hoveredSlider, setHoveredSlider] = useState<string | null>(null);

  const uses = ["Social Media", "Videos/YouTube", "Gaming", "News/Browse", "Work/Study"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ maxWidth: 640, margin: "0 auto" }}
    >
      {/* header */}
      <div style={{ marginBottom: "3rem" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: YELLOW, marginBottom: "1rem", fontFamily: MONO }}
        >
          STEP 01 / INPUT YOUR DATA
        </motion.div>
        <h1 style={{
          fontFamily: SERIF, fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 400, lineHeight: 1.05, margin: 0,
        }}>
          Be honest.<br />
          <em style={{ color: YELLOW }}>The numbers don't lie.</em>
        </h1>
      </div>

      {/* daily hours slider */}
      {[
        { key: "dailyHours", label: "DAILY SCREEN TIME", min: 0.5, max: 14, step: 0.5, unit: "hrs/day", display: `${form.dailyHours}h` },
        { key: "age", label: "YOUR CURRENT AGE", min: 10, max: 80, step: 1, unit: "years old", display: `${form.age}` },
        { key: "lifeExpectancy", label: "LIFE EXPECTANCY", min: 60, max: 100, step: 1, unit: "years", display: `${form.lifeExpectancy}` },
      ].map(({ key, label, min, max, step, unit, display }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 * ["dailyHours", "age", "lifeExpectancy"].indexOf(key) + 0.4, duration: 0.55 }}
          onMouseEnter={() => setHoveredSlider(key)}
          onMouseLeave={() => setHoveredSlider(null)}
          style={{ marginBottom: "2.5rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: hoveredSlider === key ? YELLOW : MUTED, fontFamily: MONO, transition: "color 0.2s" }}>
              {label}
            </span>
            <motion.span
              key={display}
              initial={{ scale: 1.3, color: YELLOW }}
              animate={{ scale: 1, color: FG }}
              style={{ fontFamily: SERIF, fontSize: "1.2rem" }}
            >
              {display}
              <span style={{ fontSize: "0.65rem", color: MUTED, marginLeft: "0.3rem", fontFamily: MONO }}>{unit}</span>
            </motion.span>
          </div>

          {/* track */}
          <div style={{ position: "relative", height: 2, background: BORDER, borderRadius: 2 }}>
            <motion.div
              style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: key === "dailyHours"
                  ? `linear-gradient(90deg, #4ade80, ${YELLOW}, ${RED})`
                  : YELLOW,
                width: `${((Number(form[key as keyof Inputs]) - min) / (max - min)) * 100}%`,
                transition: "width 0.1s",
              }}
            />
          </div>
          <input
            type="range" min={min} max={max} step={step}
            value={Number(form[key as keyof Inputs])}
            onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) }))}
            style={{ width: "100%", marginTop: "0.5rem", accentColor: YELLOW, cursor: "none", background: "transparent" }}
          />
        </motion.div>
      ))}

      {/* main use */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        style={{ marginBottom: "3rem" }}
      >
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: MUTED, marginBottom: "1rem", fontFamily: MONO }}>
          PRIMARY PHONE USE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {uses.map(u => (
            <motion.button
              key={u}
              whileHover={{ borderColor: YELLOW, color: YELLOW }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setForm(f => ({ ...f, mainUse: u }))}
              style={{
                background: form.mainUse === u ? YELLOW : "transparent",
                color: form.mainUse === u ? BG : MUTED,
                border: `1px solid ${form.mainUse === u ? YELLOW : BORDER}`,
                padding: "0.5rem 1.25rem",
                fontSize: "0.7rem", letterSpacing: "0.1em",
                fontFamily: MONO, cursor: "none",
                transition: "all 0.2s",
              }}
            >
              {u}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* live preview teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          border: `1px solid ${BORDER}`, padding: "1.25rem 1.5rem",
          marginBottom: "2rem", display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1rem",
        }}
      >
        {[
          { l: "This year alone", v: `${((form.dailyHours * 365) / 24).toFixed(0)} days` },
          { l: "Remaining lifetime", v: `${((form.dailyHours * Math.max(form.lifeExpectancy - form.age, 1) * 365) / (24 * 365)).toFixed(1)} yrs` },
          { l: "% of waking life", v: `${Math.round((form.dailyHours / 16) * 100)}%` },
        ].map(({ l, v }) => (
          <div key={l}>
            <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: MUTED, fontFamily: MONO }}>{l}</div>
            <div style={{ fontFamily: SERIF, fontSize: "1.4rem", color: YELLOW, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </motion.div>

      <motion.button
        whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(232,197,71,0.35)` }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSubmit(form)}
        style={{
          background: YELLOW, color: BG, border: "none",
          padding: "1.1rem 3rem", fontSize: "0.85rem",
          letterSpacing: "0.2em", fontWeight: 700,
          fontFamily: MONO, cursor: "none", width: "100%",
        }}
      >
        REVEAL MY AUDIT →
      </motion.button>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   RESULTS DISPLAY
════════════════════════════════════════ */
function Results({ inputs, onReset }: { inputs: Inputs; onReset: () => void }) {
  const stats = calcStats(inputs);
  const verdict = getVerdict(inputs.dailyHours);
  const alts = alternatives[inputs.mainUse] ?? alternatives["Social Media"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* verdict banner */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          background: verdict.color, padding: "1.25rem 3rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1rem", transformOrigin: "left",
          marginBottom: "3rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: `${BG}99`, fontFamily: MONO }}>YOUR STATUS</div>
          <div style={{ fontFamily: SERIF, fontSize: "1.8rem", color: BG, lineHeight: 1 }}>{verdict.label}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: "0.8rem", color: BG, maxWidth: 320 }}>
          {verdict.desc}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "3rem", color: BG, lineHeight: 1 }}>
          {inputs.dailyHours}h<span style={{ fontSize: "1rem" }}>/day</span>
        </div>
      </motion.div>

      {/* top grid: score ring + key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "start" }}>
        <ScoreRing score={stats.score} verdict={verdict} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <StatCard label="DAILY MINUTES" value={stats.dailyMins} unit="min" delay={0.1} />
          <StatCard label="WEEKLY HOURS" value={stats.weeklyHours} unit="hrs" delay={0.2} />
          <StatCard label="DAYS LOST THIS YEAR" value={parseFloat(stats.yearlyDays.toFixed(1))} unit="days" delay={0.3} highlight color={RED} />
          <StatCard label="% OF WAKING LIFE" value={parseFloat(stats.percentAwake.toFixed(1))} unit="%" delay={0.35} color={verdict.color} />
        </div>
      </div>

      {/* big lifetime stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard
          label="YEARS LOST TO PHONE" value={parseFloat(stats.lifetimeYears.toFixed(1))}
          unit="yrs" sub={`That's ${stats.lifetimeMonths.toFixed(0)} months of your remaining life`}
          highlight color={RED} delay={0.4}
        />
        <StatCard
          label="PHONE CHECKS REMAINING" value={stats.yearlyChecks}
          unit="/yr" sub={`~${stats.checksPerDay} times a day you pick it up`}
          delay={0.45} color={YELLOW}
        />
        <StatCard
          label="SCROLL DISTANCE" value={parseFloat((stats.lifetimeScrollMeters / 1000).toFixed(0))}
          unit="km" sub={`That's ${(stats.lifetimeScrollMeters / 384400000 * 100).toFixed(4)}% of the way to the moon`}
          delay={0.5}
        />
        <StatCard
          label="FREE YEARS REMAINING" value={parseFloat((stats.yearsLeft - stats.screenYearsLeft).toFixed(1))}
          unit="yrs" sub="Waking years not spent on your phone"
          delay={0.55} color="#4ade80"
        />
      </div>

      {/* projection chart */}
      <div style={{ marginBottom: "1.5rem" }}>
        <ProjectionChart inputs={inputs} stats={stats} />
      </div>

      {/* analog alternatives */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ border: `1px solid ${BORDER}`, padding: "2rem", marginBottom: "2rem" }}
      >
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: MUTED, marginBottom: "1.5rem", fontFamily: MONO }}>
          ANALOG ALTERNATIVES — FOR YOUR USE CASE: {inputs.mainUse.toUpperCase()}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {alts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.1 }}
              whileHover={{ borderColor: YELLOW, backgroundColor: `${YELLOW}06` }}
              style={{ border: `1px solid ${BORDER}`, padding: "1.25rem", transition: "all 0.25s" }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{a.icon}</div>
              <div style={{ fontFamily: SERIF, fontSize: "1rem", marginBottom: "0.4rem" }}>{a.alt}</div>
              <div style={{ fontSize: "0.68rem", color: MUTED, fontFamily: MONO, lineHeight: 1.5 }}>{a.benefit}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* action row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
      >
        <motion.button
          whileHover={{ y: -2, boxShadow: `0 8px 30px rgba(232,197,71,0.25)` }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          style={{
            background: YELLOW, color: BG, border: "none",
            padding: "0.9rem 2rem", fontSize: "0.75rem",
            letterSpacing: "0.15em", fontWeight: 700,
            fontFamily: MONO, cursor: "none",
          }}
        >
          ← RECALCULATE
        </motion.button>
        <motion.button
          whileHover={{ borderColor: YELLOW, color: YELLOW }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            const text = `I just found out I'll lose ${stats.lifetimeYears.toFixed(1)} years of my life to my phone. ${inputs.dailyHours}h/day adds up. Check your audit at ScrollAudit.`;
            navigator.clipboard.writeText(text);
          }}
          style={{
            background: "transparent", color: MUTED,
            border: `1px solid ${BORDER}`,
            padding: "0.9rem 2rem", fontSize: "0.75rem",
            letterSpacing: "0.15em", fontFamily: MONO, cursor: "none",
            transition: "all 0.2s",
          }}
        >
          COPY & SHARE RESULT
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
export default function VisualizePage() {
  const [submitted, setSubmitted] = useState(false);
  const [inputs, setInputs] = useState<Inputs | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (i: Inputs) => {
    setInputs(i);
    setSubmitted(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <main style={{ background: BG, color: FG, minHeight: "100vh", cursor: "none", overflowX: "hidden" }}>
      <Cursor />

      {/* nav */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1.5rem 3rem", borderBottom: `1px solid ${BORDER}`,
          fontFamily: MONO, position: "sticky", top: 0,
          background: "rgba(10,10,8,0.97)", backdropFilter: "blur(12px)", zIndex: 100,
        }}
      >
        <Link href="/" style={{ color: YELLOW, textDecoration: "none", fontSize: "1rem", letterSpacing: "0.3em", fontWeight: 700 }}>
          ← SCROLLAUDIT
        </Link>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: MUTED }}>
          {submitted ? "STEP 02 / YOUR RESULTS" : "STEP 01 / INPUT"}
        </span>
      </motion.nav>

      {/* background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(rgba(232,197,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,71,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "4rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <InputForm onSubmit={handleSubmit} />
            </motion.div>
          ) : (
            <motion.div key="results" ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {inputs && <Results inputs={inputs} onReset={() => { setSubmitted(false); setInputs(null); }} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a, button { cursor: none; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 2px; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${YELLOW}; cursor: none; border: 2px solid ${BG}; box-shadow: 0 0 0 1px ${YELLOW}; }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${YELLOW}; cursor: none; border: none; }
      `}</style>
    </main>
  );
}
