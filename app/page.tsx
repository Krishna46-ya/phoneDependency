"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue
} from "motion/react";

/* ─── tokens ─── */
const YELLOW = "#e8c547";
const BG = "#0a0a08";
const FG = "#f0ede6";
const MUTED = "#6a6a60";
const BORDER = "#2a2a24";

/* ─── reusable variant ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 },
  }),
};

/* ─── data ─── */
const stats = [
  { number: "4.8", unit: "hrs", label: "avg daily screen time" },
  { number: "96",  unit: "×",   label: "phone checks per day"  },
  { number: "10",  unit: "yrs", label: "lost by age 70"        },
];

const steps = [
  { num: "01", title: "Log Your Time",       desc: "Enter your daily screen time from your phone's built-in tracker. No account needed."         },
  { num: "02", title: "See the Truth",        desc: "We convert your numbers into visceral lifetime stats — years, not minutes."                  },
  { num: "03", title: "Take Back Control",    desc: "Get your personalized detox plan and analog alternatives to reclaim your attention."         },
];

/* ════════════════════════════════════════
   CURSOR
════════════════════════════════════════ */
function Cursor() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const x  = useSpring(mx, { stiffness: 500, damping: 35 });
  const y  = useSpring(my, { stiffness: 500, damping: 35 });

  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return (
    <motion.div
      style={{
        position: "fixed", left: x, top: y,
        x: "-50%", y: "-50%",
        width: 24, height: 24,
        border: `2px solid ${YELLOW}`, borderRadius: "50%",
        pointerEvents: "none", zIndex: 9999, mixBlendMode: "difference",
      }}
    />
  );
}

/* ════════════════════════════════════════
   NAV
════════════════════════════════════════ */
function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 50)), [scrollY]);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.5rem 3rem",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        background:   scrolled ? "rgba(10,10,8,0.95)"  : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background 0.35s, border-color 0.35s",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <motion.span
        whileHover={{ letterSpacing: "0.42em" }}
        transition={{ duration: 0.3 }}
        style={{ fontSize: "1.1rem", letterSpacing: "0.3em", color: YELLOW, fontWeight: 700 }}
      >
        SCROLLAUDIT
      </motion.span>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        <Link href="/visualize" style={{
          color: BG, background: YELLOW,
          padding: "0.6rem 1.5rem", textDecoration: "none",
          fontSize: "0.75rem", letterSpacing: "0.15em", fontWeight: 700, display: "inline-block",
          fontFamily: "'Courier New', monospace",
        }}>
          START AUDIT →
        </Link>
      </motion.div>
    </motion.nav>
  );
}

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const gridY      = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const lines = [
    { text: "Your Phone",          style: {} },
    { text: "is costing you",      style: { color: YELLOW, fontStyle: "italic" as const } },
    { text: "years of your life.", style: {} },
  ];

  return (
    <section ref={ref} style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "8rem 3rem 4rem",
      position: "relative", overflow: "hidden",
    }}>
      {/* parallax grid */}
      <motion.div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(232,197,71,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,197,71,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px", y: gridY,
      }} />

      {/* ambient glow */}
      <motion.div style={{
        position: "absolute", top: "10%", right: "-15%",
        width: 700, height: 700,
        background: `radial-gradient(circle, rgba(232,197,71,0.1) 0%, transparent 65%)`,
        pointerEvents: "none", opacity: glowOpacity,
      }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* badge */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{
            display: "inline-block",
            border: `1px solid ${YELLOW}`, color: YELLOW,
            fontSize: "0.65rem", letterSpacing: "0.3em",
            padding: "0.4rem 1rem", marginBottom: "3rem",
            fontFamily: "'Courier New', monospace",
          }}
        >
          DESIGN THINKING PROJECT — 2025
        </motion.div>

        {/* headline */}
        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(3.5rem, 9vw, 8rem)",
          fontWeight: 400, lineHeight: 0.95,
          margin: "0 0 2rem", letterSpacing: "-0.02em",
        }}>
          {lines.map((l, i) => (
            <motion.span
              key={i} variants={fadeUp} initial="hidden" animate="show" custom={i + 1}
              style={{ display: "block", ...l.style }}
            >
              {l.text}
            </motion.span>
          ))}
        </h1>

        {/* subtext */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={4}
          style={{
            maxWidth: 480, fontSize: "1rem", lineHeight: 1.8,
            color: "#a8a49a", marginBottom: "3rem",
            fontFamily: "'Courier New', monospace",
          }}
        >
          Enter your screen time. We'll show you exactly how much of your
          life you're trading away — in hours, days, and years you'll never get back.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={5}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
        >
          <motion.div
            whileHover={{ y: -3, boxShadow: `0 12px 40px rgba(232,197,71,0.3)` }}
            whileTap={{ scale: 0.97 }}
          >
            <Link href="/visualize" style={{
              background: YELLOW, color: BG,
              padding: "1rem 2.5rem", textDecoration: "none",
              fontSize: "0.85rem", letterSpacing: "0.15em", fontWeight: 700,
              display: "inline-block", fontFamily: "'Courier New', monospace",
            }}>
              AUDIT MY SCREEN TIME
            </Link>
          </motion.div>

          <motion.a
            href="#how"
            whileHover={{ borderColor: YELLOW }}
            style={{
              border: `1px solid ${BORDER}`, color: FG,
              padding: "1rem 2.5rem", textDecoration: "none",
              fontSize: "0.85rem", letterSpacing: "0.15em",
              display: "inline-block", fontFamily: "'Courier New', monospace",
            }}
          >
            SEE HOW IT WORKS
          </motion.a>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          color: "#4a4a44", fontSize: "0.65rem", letterSpacing: "0.2em",
          fontFamily: "'Courier New', monospace",
        }}
      >
        <span>SCROLL</span>
        <motion.div
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 40, background: "#4a4a44", transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════
   STATS BAR
════════════════════════════════════════ */
function StatsBar() {
  return (
    <section style={{
      borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
      padding: "3rem", display: "flex", justifyContent: "center", flexWrap: "wrap",
    }}>
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: "center", padding: "1.5rem 4rem",
            borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : "none",
          }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 + 0.2, duration: 0.5, type: "spring", stiffness: 220 }}
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 400, color: YELLOW, lineHeight: 1,
            }}
          >
            {s.number}
            <span style={{ fontSize: "1.5rem", marginLeft: "0.2rem" }}>{s.unit}</span>
          </motion.div>
          <div style={{
            fontSize: "0.7rem", letterSpacing: "0.2em", color: MUTED,
            marginTop: "0.5rem", textTransform: "uppercase",
            fontFamily: "'Courier New', monospace",
          }}>
            {s.label}
          </div>
        </motion.div>
      ))}
    </section>
  );
}

/* ════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════ */
function HowItWorks() {
  return (
    <section id="how" style={{ padding: "8rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "5rem" }}
      >
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: YELLOW, fontFamily: "'Courier New', monospace" }}>
          02 /
        </span>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, margin: 0 }}>
          How it works
        </h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ backgroundColor: "rgba(232,197,71,0.04)" }}
            style={{
              padding: "3rem 2.5rem",
              borderLeft: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
              position: "relative",
            }}
          >
            {/* ghost number */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
              style={{
                fontFamily: "'Georgia', serif", fontSize: "4rem", color: "#1e1e18",
                position: "absolute", top: "1rem", right: "1.5rem",
                lineHeight: 1, fontWeight: 400,
              }}
            >
              {step.num}
            </motion.div>

            <div style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: YELLOW, marginBottom: "1.5rem", fontFamily: "'Courier New', monospace" }}>
              STEP {step.num}
            </div>
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 1rem" }}>
              {step.title}
            </h3>
            <p style={{ color: MUTED, lineHeight: 1.8, fontSize: "0.9rem", margin: 0, fontFamily: "'Courier New', monospace" }}>
              {step.desc}
            </p>

            {/* bottom accent line on hover */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 2, background: YELLOW, transformOrigin: "left",
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   CTA
════════════════════════════════════════ */
function CTA() {
  return (
    <section style={{
      padding: "8rem 3rem", textAlign: "center",
      position: "relative", overflow: "hidden",
      borderTop: `1px solid ${BORDER}`,
    }}>
      {/* stripe bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(232,197,71,0.015) 40px,rgba(232,197,71,0.015) 41px)`,
      }} />

      {/* breathing glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          background: `radial-gradient(circle, ${YELLOW} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: YELLOW, marginBottom: "2rem", fontFamily: "'Courier New', monospace" }}
        >
          — READY TO FACE THE NUMBERS? —
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 400, maxWidth: 700,
            margin: "0 auto 2.5rem", lineHeight: 1.1,
          }}
        >
          Find out how much life you've{" "}
          <em style={{ color: YELLOW }}>already scrolled away.</em>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ y: -4, boxShadow: `0 16px 50px rgba(232,197,71,0.35)` }}
          whileTap={{ scale: 0.97 }}
          style={{ display: "inline-block" }}
        >
          <Link href="/visualize" style={{
            background: YELLOW, color: BG,
            padding: "1.2rem 3rem", textDecoration: "none",
            fontSize: "0.85rem", letterSpacing: "0.2em", fontWeight: 700,
            display: "inline-block", fontFamily: "'Courier New', monospace",
          }}>
            START YOUR AUDIT →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   FOOTER
════════════════════════════════════════ */
function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "2rem 3rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: YELLOW }}>SCROLLAUDIT</span>
      <span style={{ fontSize: "0.7rem", color: "#3a3a34", letterSpacing: "0.1em" }}>
        DESIGN THINKING PROJECT — 2025
      </span>
    </motion.footer>
  );
}

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main style={{ background: BG, color: FG, overflowX: "hidden", cursor: "none" }}>
      <Cursor />
      <Nav />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <CTA />
      <Footer />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a, button { cursor: none; }
      `}</style>
    </main>
  );
}
