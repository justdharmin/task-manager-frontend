import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

const API = "https://flowmind-backend-h2aw.onrender.com";

// ─── SVG Icons ────────────────────────────────────────────────────────────
const IconTasks    = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconToday    = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 6.5h13M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IconPriority = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 14V7l5-5 5 5v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 14V10h3v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconProjects = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 4.5h5l2-2.5h6V14H1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconSearch   = () => (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>);
const IconCheck    = () => (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconEdit     = () => (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconTrash    = () => (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M5 4V2.5h3V4M4.5 4v6.5h4V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconLogout   = () => (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 2.5H2.5v10h3M10 4.5l3 3-3 3M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconPlus     = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>);
const IconCal      = () => (<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="1.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M0.5 4.5h10M3.5 0.5v2M7.5 0.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>);
const IconSun      = () => (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12M2.8 2.8l1.1 1.1M9.1 9.1l1.1 1.1M9.1 3.9l1.1-1.1M2.8 10.2l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IconMoon     = () => (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 8A5 5 0 015 2a5 5 0 100 9A5 5 0 0011 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IconSparkle  = () => (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 4.5L15 8l-4.5 1.5L9 14l-1.5-4.5L3 8l4.5-1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>);
const IconZap      = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 1L2 8h5l-1 5 6-7H7L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconTrend    = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 10l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3h3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconActivity = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h2l2-5 3 9 2-6 1 2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconTarget   = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="0.8" fill="currentColor"/></svg>);

// ─── Themes ──────────────────────────────────────────────────────────────
const THEMES = {
  warm: {
    bg:"#0a0806",bg2:"#100d0a",surface:"#16110e",surface2:"#1d1713",surface3:"#251e19",
    border:"rgba(255,220,180,0.06)",border2:"rgba(255,220,180,0.1)",border3:"rgba(255,220,180,0.17)",
    ink:"#f7eede",inkMid:"rgba(247,238,222,0.62)",inkMuted:"rgba(247,238,222,0.36)",inkFaint:"rgba(247,238,222,0.14)",
    accent:"#e8956a",accent2:"#f5bb94",accentDim:"rgba(232,149,106,0.12)",accentDim2:"rgba(232,149,106,0.22)",accentDim3:"rgba(232,149,106,0.07)",
    red:"#e07070",redDim:"rgba(224,112,112,0.12)",amber:"#d4943a",amberDim:"rgba(212,148,58,0.12)",green:"#5db88a",greenDim:"rgba(93,184,138,0.12)",
    glow1:"rgba(232,149,106,0.15)",glow2:"rgba(180,80,40,0.08)",meshA:"232,149,106",meshB:"180,90,60",
  },
  deep: {
    bg:"#07070f",bg2:"#0a0a16",surface:"#0f0f1c",surface2:"#151526",surface3:"#1c1c30",
    border:"rgba(160,150,255,0.06)",border2:"rgba(160,150,255,0.1)",border3:"rgba(160,150,255,0.17)",
    ink:"#ebe8ff",inkMid:"rgba(235,232,255,0.6)",inkMuted:"rgba(235,232,255,0.34)",inkFaint:"rgba(235,232,255,0.13)",
    accent:"#7c6ee8",accent2:"#a99ef5",accentDim:"rgba(124,110,232,0.13)",accentDim2:"rgba(124,110,232,0.23)",accentDim3:"rgba(124,110,232,0.07)",
    red:"#e07070",redDim:"rgba(224,112,112,0.12)",amber:"#d4943a",amberDim:"rgba(212,148,58,0.12)",green:"#5db88a",greenDim:"rgba(93,184,138,0.12)",
    glow1:"rgba(124,110,232,0.15)",glow2:"rgba(80,60,180,0.08)",meshA:"124,110,232",meshB:"80,60,180",
  },
};

// ─── Animated mesh/orb background ───────────────────────────────────────
function MeshBackground({ t }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none" }}>
      {/* Base gradient */}
      <div style={{ position:"absolute",inset:0, background:`radial-gradient(ellipse 90% 60% at 20% 10%, rgba(${t.meshA},0.09) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(${t.meshB},0.07) 0%, transparent 55%), radial-gradient(ellipse 100% 80% at 50% 100%, rgba(${t.meshA},0.04) 0%, transparent 50%)` }} />
      {/* Animated orbs */}
      {[
        { size:480, x:"5%",  y:"8%",  dur:22, delay:0   },
        { size:360, x:"70%", y:"5%",  dur:28, delay:4   },
        { size:520, x:"60%", y:"55%", dur:18, delay:2   },
        { size:300, x:"15%", y:"65%", dur:32, delay:7   },
        { size:240, x:"88%", y:"35%", dur:20, delay:11  },
      ].map((o,i) => (
        <motion.div key={i}
          style={{ position:"absolute", left:o.x, top:o.y, width:o.size, height:o.size, borderRadius:"50%",
            background:`radial-gradient(circle at 40% 35%, rgba(${i%2===0?t.meshA:t.meshB},0.08) 0%, rgba(${t.meshA},0.02) 40%, transparent 70%)`,
            filter:"blur(60px)", willChange:"transform" }}
          animate={{ x:[0,-30,20,-15,0], y:[0,20,-30,15,0], scale:[1,1.08,0.94,1.05,1] }}
          transition={{ duration:o.dur, delay:o.delay, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
      {/* Subtle grid */}
      <div style={{ position:"absolute",inset:0,
        backgroundImage:`linear-gradient(rgba(${t.meshA},0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(${t.meshA},0.025) 1px, transparent 1px)`,
        backgroundSize:"64px 64px",
        maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />
      {/* Grain */}
      <div style={{ position:"absolute",inset:0, opacity:0.35,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }} />
    </div>
  );
}

// ─── Mouse-tracked spotlight ─────────────────────────────────────────────
function MouseSpotlight({ t }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness:80, damping:30 });
  const sy = useSpring(my, { stiffness:80, damping:30 });
  const bgX = useTransform(sx, v => `${v*100}%`);
  const bgY = useTransform(sy, v => `${v*100}%`);

  useEffect(() => {
    const h = (e) => { mx.set(e.clientX/window.innerWidth); my.set(e.clientY/window.innerHeight); };
    window.addEventListener("mousemove", h, { passive:true });
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return (
    <motion.div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
      background:`radial-gradient(600px circle at ${bgX} ${bgY}, rgba(${t.meshA},0.055) 0%, transparent 60%)` }} />
  );
}

// ─── Floating Auth shapes ────────────────────────────────────────────────
function FloatingShapes({ accent }) {
  return (
    <div style={{ position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
      {[
        { x:"8%",  y:"12%", size:200, delay:0,   dur:18 },
        { x:"62%", y:"6%",  size:140, delay:3,   dur:22 },
        { x:"78%", y:"58%", size:170, delay:1.5, dur:20 },
        { x:"18%", y:"68%", size:100, delay:4,   dur:16 },
        { x:"48%", y:"48%", size:250, delay:2,   dur:25 },
      ].map((s,i) => (
        <motion.div key={i}
          style={{ position:"absolute",left:s.x,top:s.y,width:s.size,height:s.size,
            borderRadius:"30% 70% 70% 30%/30% 30% 70% 70%",
            background:`radial-gradient(circle at 40% 40%, ${accent}22 0%, ${accent}06 60%, transparent 100%)`,
            border:`1px solid ${accent}14`, backdropFilter:"blur(1px)" }}
          animate={{ y:[0,-30,10,-20,0], rotate:[0,15,-10,20,0],
            borderRadius:["30% 70% 70% 30%/30% 30% 70% 70%","60% 40% 30% 70%/60% 30% 70% 40%","40% 60% 60% 40%/50% 60% 40% 50%","30% 70% 70% 30%/30% 30% 70% 70%"] }}
          transition={{ duration:s.dur,delay:s.delay,repeat:Infinity,ease:"easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Global CSS ──────────────────────────────────────────────────────────
function GlobalStyles({ t }) {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;scroll-behavior:smooth;}
body{background:${t.bg};color:${t.ink};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;font-size:13.5px;line-height:1.55;transition:background 0.5s,color 0.5s;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${t.border3};border-radius:4px;}
input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.3;cursor:pointer;filter:invert(1);}

/* Auth */
.auth-root{min-height:100vh;position:relative;overflow:hidden;background:${t.bg};}
.auth-grid-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(${t.border} 1px,transparent 1px),linear-gradient(90deg,${t.border} 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 100%);}
.auth-inner{position:relative;z-index:2;min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:stretch;}
@media(max-width:820px){.auth-inner{grid-template-columns:1fr;}.auth-brand-col{display:none;}}
.auth-brand-col{padding:52px 56px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid ${t.border};position:relative;overflow:hidden;}
.auth-brand-col::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 60%);pointer-events:none;}
.brand-wordmark{font-family:'Instrument Serif',serif;font-size:22px;color:${t.ink};letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;}
.brand-wordmark-dot{width:7px;height:7px;border-radius:50%;background:${t.accent};box-shadow:0 0 10px ${t.accentDim2};}
.brand-headline{font-family:'Instrument Serif',serif;font-size:clamp(36px,4vw,56px);line-height:1.05;letter-spacing:-0.03em;color:${t.ink};}
.brand-headline em{font-style:italic;color:${t.accent};}
.brand-desc{font-size:14px;color:${t.inkMuted};line-height:1.8;max-width:320px;margin-top:16px;}
.brand-features{display:flex;flex-direction:column;gap:12px;}
.brand-feature{display:flex;align-items:center;gap:12px;font-size:12.5px;color:${t.inkMid};padding:10px 14px;background:${t.surface};border:1px solid ${t.border};border-radius:10px;}
.brand-feature-icon{width:28px;height:28px;border-radius:8px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};flex-shrink:0;font-size:13px;}
.auth-form-col{display:flex;align-items:center;justify-content:center;padding:52px 48px;background:${t.bg2};}
@media(max-width:820px){.auth-form-col{padding:40px 24px;background:${t.bg};}}
.auth-box{width:100%;max-width:380px;}
.auth-eyebrow{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${t.accent};font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.auth-eyebrow::before{content:'';width:18px;height:1px;background:${t.accent};}
.auth-title{font-family:'Instrument Serif',serif;font-size:34px;letter-spacing:-0.03em;color:${t.ink};margin-bottom:6px;line-height:1.1;}
.auth-sub{font-size:13px;color:${t.inkMuted};margin-bottom:28px;line-height:1.6;}
.field-wrap{margin-bottom:14px;}
.field-label{display:block;font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:${t.inkMuted};margin-bottom:7px;}
.field-input{width:100%;background:${t.surface};border:1px solid ${t.border2};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 16px;outline:none;border-radius:10px;transition:all 0.22s;letter-spacing:0.01em;}
.field-input::placeholder{color:${t.inkFaint};}
.field-input:focus{border-color:${t.accent};background:${t.surface2};box-shadow:0 0 0 4px ${t.accentDim},0 1px 3px rgba(0,0,0,0.3);}
.auth-btn{width:100%;background:${t.accent};border:none;color:#0d0b09;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.01em;padding:13px;cursor:pointer;border-radius:10px;margin-top:8px;transition:all 0.2s;position:relative;overflow:hidden;}
.auth-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);pointer-events:none;}
.auth-btn:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 6px 24px ${t.accentDim2};transform:translateY(-1px);}
.auth-btn:disabled{opacity:0.45;cursor:not-allowed;}
.auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
.auth-divider-line{flex:1;height:1px;background:${t.border};}
.auth-divider-text{font-size:11px;color:${t.inkMuted};letter-spacing:0.05em;}
.auth-switch{text-align:center;font-size:12.5px;color:${t.inkMuted};}
.auth-switch button{background:none;border:none;color:${t.accent};font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.toast{padding:10px 14px;border-radius:10px;font-size:12.5px;font-weight:500;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.toast.error{background:${t.redDim};color:${t.red};border:1px solid rgba(224,112,112,0.18);}
.toast.success{background:${t.greenDim};color:${t.green};border:1px solid rgba(93,184,138,0.18);}
.toast.error .toast-dot{background:${t.red};}
.toast.success .toast-dot{background:${t.green};}

/* ─── Dashboard Layout ─── */
.dash-root{min-height:100vh;display:grid;grid-template-columns:248px 1fr;background:${t.bg};position:relative;}
@media(max-width:900px){.dash-root{grid-template-columns:1fr;}.sidebar{display:none;}}

/* ─── Sidebar ─── */
.sidebar{background:${t.surface};border-right:1px solid ${t.border};display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow-y:auto;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);}
.sidebar-logo{padding:24px 20px;border-bottom:1px solid ${t.border};font-family:'Instrument Serif',serif;font-size:20px;color:${t.ink};letter-spacing:-0.01em;display:flex;align-items:center;gap:9px;}
.sidebar-logo-dot{width:7px;height:7px;border-radius:50%;background:${t.accent};box-shadow:0 0 12px ${t.accentDim2};}
.sidebar-section-label{font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:${t.inkMuted};font-weight:600;padding:18px 18px 8px;}
.nav-list{list-style:none;display:flex;flex-direction:column;gap:2px;padding:0 10px;}
.nav-btn{width:100%;display:flex;align-items:center;gap:10px;background:none;border:none;color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:9px 12px;cursor:pointer;border-radius:10px;transition:all 0.15s;text-align:left;letter-spacing:0.01em;position:relative;}
.nav-btn:hover{background:${t.surface2};color:${t.ink};}
.nav-btn.active{background:${t.accentDim2};color:${t.accent};font-weight:600;}
.nav-icon{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.nav-badge{margin-left:auto;background:${t.surface3};border:1px solid ${t.border2};color:${t.inkMid};font-size:10px;font-weight:700;padding:1px 7px;border-radius:20px;font-family:'Geist Mono',monospace;}
.nav-btn.active .nav-badge{background:${t.accentDim};border-color:${t.accentDim2};color:${t.accent};}
.sidebar-bottom{margin-top:auto;padding:16px 14px;border-top:1px solid ${t.border};}
.progress-card{background:${t.surface2};border:1px solid ${t.border};border-radius:12px;padding:14px 16px;margin-bottom:12px;position:relative;overflow:hidden;}
.progress-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 70%);pointer-events:none;}
.progress-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.progress-label{font-size:11px;font-weight:600;color:${t.inkMuted};letter-spacing:0.05em;text-transform:uppercase;}
.progress-pct{font-family:'Geist Mono',monospace;font-size:16px;font-weight:700;color:${t.accent};}
.progress-track{height:3px;background:${t.border2};border-radius:3px;overflow:hidden;}
.progress-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:3px;transition:width 0.8s cubic-bezier(0.4,0,0.2,1);}
.logout-btn{width:100%;display:flex;align-items:center;gap:9px;background:none;border:1px solid ${t.border};color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;padding:9px 12px;cursor:pointer;border-radius:10px;transition:all 0.18s;letter-spacing:0.02em;}
.logout-btn:hover{background:${t.redDim};color:${t.red};border-color:rgba(224,112,112,0.2);}

/* ─── Topbar ─── */
.dash-main{display:flex;flex-direction:column;overflow-y:auto;position:relative;z-index:1;}
.topbar{background:rgba(${t.meshA},0.03);border-bottom:1px solid ${t.border};padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);}
@media(max-width:900px){.topbar{padding:12px 18px;}}
.topbar-left h1{font-family:'Instrument Serif',serif;font-size:19px;letter-spacing:-0.02em;color:${t.ink};}
.topbar-left p{font-size:11.5px;color:${t.inkMuted};margin-top:1px;}
.topbar-right{display:flex;align-items:center;gap:10px;}
.theme-toggle{display:flex;align-items:center;background:${t.surface2};border:1px solid ${t.border2};border-radius:24px;padding:3px;gap:1px;}
.theme-opt{background:none;border:none;color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;padding:5px 11px;border-radius:20px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;}
.theme-opt.active{background:${t.accentDim2};color:${t.accent};}
.avatar{width:32px;height:32px;background:linear-gradient(135deg,${t.accent},${t.accent2});border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0d0b09;font-family:'Instrument Serif',serif;font-size:14px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px ${t.accentDim2};}

/* ─── Content ─── */
.content{padding:24px 28px;flex:1;}
@media(max-width:900px){.content{padding:16px 18px;}}

/* ─── Search ─── */
.search-wrap{position:relative;margin-bottom:22px;}
.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:${t.inkMuted};display:flex;}
.search-input{width:100%;background:${t.surface};border:1px solid ${t.border};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:11px 14px 11px 40px;outline:none;border-radius:12px;transition:all 0.2s;backdrop-filter:blur(8px);}
.search-input::placeholder{color:${t.inkMuted};}
.search-input:focus{border-color:${t.border3};box-shadow:0 0 0 4px ${t.accentDim};background:${t.surface2};}

/* ─── Stats grid ─── */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr 1fr;gap:8px;}}
.stat-card{background:${t.surface};border:1px solid ${t.border};padding:20px 20px 18px;border-radius:16px;position:relative;overflow:hidden;cursor:default;transition:border-color 0.25s,box-shadow 0.25s,transform 0.25s;will-change:transform;}
.stat-card:hover{border-color:${t.border2};box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 0 1px ${t.accentDim};transform:translateY(-2px);}
.stat-card-bg{position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 55%);pointer-events:none;}
.stat-card-glow{position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,${t.glow1} 0%,transparent 70%);pointer-events:none;transition:opacity 0.3s;}
.stat-card:hover .stat-card-glow{opacity:1.5;}
.stat-icon-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.stat-icon-badge{width:30px;height:30px;border-radius:9px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};}
.stat-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${t.inkMuted};}
.stat-val{font-family:'Geist Mono',monospace;font-size:32px;font-weight:500;color:${t.ink};letter-spacing:-0.04em;line-height:1;margin-bottom:6px;}
.stat-sub{font-size:11.5px;color:${t.inkMuted};}
.stat-sub b{color:${t.accent};font-weight:700;}
.stat-bar{height:2px;background:${t.border2};border-radius:2px;overflow:hidden;margin-top:12px;}
.stat-bar-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:2px;}

/* ─── Insight strip ─── */
.insight-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
@media(max-width:900px){.insight-strip{grid-template-columns:1fr 1fr;}}
@media(max-width:600px){.insight-strip{grid-template-columns:1fr;gap:8px;}}
.insight-card{background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;transition:all 0.2s;position:relative;overflow:hidden;}
.insight-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3},transparent 60%);opacity:0;transition:opacity 0.25s;pointer-events:none;}
.insight-card:hover{border-color:${t.border2};transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.2);}
.insight-card:hover::after{opacity:1;}
.insight-icon{width:38px;height:38px;border-radius:11px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};flex-shrink:0;}
.insight-body{}
.insight-val{font-family:'Geist Mono',monospace;font-size:18px;font-weight:600;color:${t.ink};letter-spacing:-0.03em;line-height:1.2;}
.insight-label{font-size:11px;color:${t.inkMuted};margin-top:2px;font-weight:500;}

/* ─── Quick actions ─── */
.quick-actions{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
.qa-btn{display:flex;align-items:center;gap:7px;background:${t.surface};border:1px solid ${t.border};color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;padding:8px 14px;border-radius:20px;cursor:pointer;transition:all 0.18s;letter-spacing:0.02em;}
.qa-btn:hover{background:${t.accentDim2};border-color:${t.accent};color:${t.accent};}
.qa-btn.active{background:${t.accentDim2};border-color:${t.accent};color:${t.accent};}

/* ─── Add card ─── */
.add-card{background:${t.surface};border:1px solid ${t.border};border-radius:16px;padding:20px 22px;margin-bottom:20px;position:relative;overflow:hidden;}
.add-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 60%);pointer-events:none;}
.add-card-head{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.add-card-icon{width:24px;height:24px;border-radius:7px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};}
.add-card-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${t.inkMuted};}
.add-row{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;}
@media(max-width:700px){.add-row{flex-direction:column;}}
.add-input{flex:1;min-width:160px;background:${t.bg2};border:1px solid ${t.border2};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:10px 14px;outline:none;border-radius:10px;transition:all 0.2s;}
.add-input::placeholder{color:${t.inkMuted};}
.add-input:focus{border-color:${t.accent};box-shadow:0 0 0 3px ${t.accentDim};background:${t.surface2};}
.add-select{background:${t.bg2};border:1px solid ${t.border2};color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;padding:10px 12px;outline:none;border-radius:10px;cursor:pointer;transition:border-color 0.2s;}
.add-select:focus{border-color:${t.accent};}
.add-select option{background:${t.surface2};}
.add-btn{background:${t.accent};border:none;color:#0d0b09;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;padding:10px 20px;cursor:pointer;border-radius:10px;display:flex;align-items:center;gap:7px;white-space:nowrap;transition:all 0.2s;position:relative;overflow:hidden;}
.add-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 60%);pointer-events:none;}
.add-btn:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 4px 20px ${t.accentDim2};transform:translateY(-1px);}
.add-btn:disabled{opacity:0.45;cursor:not-allowed;}
@media(max-width:700px){.add-select,.add-input,.add-btn{width:100%;}.add-btn{justify-content:center;}}

/* ─── Section head ─── */
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.section-title{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${t.inkMuted};font-weight:700;}
.section-badge{font-size:10.5px;font-family:'Geist Mono',monospace;background:${t.surface};border:1px solid ${t.border};color:${t.inkMid};padding:2px 10px;border-radius:20px;}
.filter-tabs{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap;}
.filter-tab{background:none;border:1px solid transparent;color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:600;padding:5px 14px;cursor:pointer;border-radius:20px;transition:all 0.15s;letter-spacing:0.02em;}
.filter-tab:hover{border-color:${t.border2};color:${t.ink};}
.filter-tab.active{background:${t.accent};border-color:${t.accent};color:#0d0b09;}

/* ─── Task items ─── */
.task-list{display:flex;flex-direction:column;gap:4px;}
.task-item{background:${t.surface};border:1px solid ${t.border};border-radius:12px;display:flex;align-items:center;gap:11px;padding:13px 16px;transition:all 0.2s;position:relative;overflow:hidden;}
.task-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:transparent;border-radius:12px 0 0 12px;transition:background 0.2s;}
.task-item:hover{border-color:${t.border2};background:${t.surface2};box-shadow:0 4px 16px rgba(0,0,0,0.18);}
.task-item:hover::before{background:${t.accentDim2};}
.task-item.done{opacity:0.38;}
.task-item.done::before{background:${t.greenDim}!important;}
.task-check{width:19px;height:19px;border:1.5px solid ${t.border3};border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:none;color:transparent;transition:all 0.18s;}
.task-check:hover{border-color:${t.accent};background:${t.accentDim};}
.task-check.checked{background:${t.accent};border-color:${t.accent};color:#0d0b09;}
.task-body{flex:1;min-width:0;}
.task-title-row{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.task-text{font-size:13.5px;color:${t.ink};line-height:1.35;font-weight:400;}
.task-item.done .task-text{text-decoration:line-through;color:${t.inkMuted};}
.p-badge{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 7px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;gap:4px;}
.p-dot{width:5px;height:5px;border-radius:50%;}
.p-high{background:${t.redDim};color:${t.red};}
.p-medium{background:${t.amberDim};color:${t.amber};}
.p-low{background:${t.greenDim};color:${t.green};}
.task-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.task-project{font-size:10px;color:${t.accent};background:${t.accentDim3};border:1px solid ${t.accentDim};padding:1px 8px;border-radius:5px;font-weight:700;}
.task-due{font-size:10.5px;color:${t.inkMuted};display:flex;align-items:center;gap:4px;}
.task-due.overdue{color:${t.red};}
.task-age{font-size:10px;color:${t.inkMuted};flex-shrink:0;font-family:'Geist Mono',monospace;}
.task-actions{display:flex;gap:2px;opacity:0;transition:opacity 0.15s;flex-shrink:0;}
.task-item:hover .task-actions{opacity:1;}
.task-action{background:none;border:none;color:${t.inkMuted};cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:7px;transition:all 0.15s;}
.task-action:hover{background:${t.surface3};color:${t.ink};}
.task-action.del:hover{background:${t.redDim};color:${t.red};}
.task-action.active{background:${t.accentDim};color:${t.accent};}
.task-edit-input{flex:1;background:${t.bg2};border:1px solid ${t.accent};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:4px 10px;outline:none;border-radius:7px;box-shadow:0 0 0 3px ${t.accentDim};}

/* ─── Empty ─── */
.empty{text-align:center;padding:56px 20px;background:${t.surface};border:1px dashed ${t.border2};border-radius:16px;}
.empty-icon{width:44px;height:44px;border-radius:12px;background:${t.surface2};border:1px solid ${t.border2};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:${t.inkMuted};}
.empty-title{font-family:'Instrument Serif',serif;font-size:18px;color:${t.inkMid};margin-bottom:6px;}
.empty-sub{font-size:12.5px;color:${t.inkMuted};}

/* ─── Projects ─── */
.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:18px;}
@media(max-width:600px){.projects-grid{grid-template-columns:1fr 1fr;gap:8px;}}
.project-card{background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:18px 16px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
.project-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 60%);opacity:0;transition:opacity 0.25s;pointer-events:none;}
.project-card:hover{border-color:${t.border2};box-shadow:0 6px 24px rgba(0,0,0,0.22);transform:translateY(-2px);}
.project-card:hover::before{opacity:1;}
.project-card.selected{border-color:${t.accent};background:${t.accentDim3};}
.project-card-name{font-family:'Instrument Serif',serif;font-size:16px;color:${t.ink};margin-bottom:3px;}
.project-card-count{font-size:11.5px;color:${t.inkMuted};margin-bottom:14px;}
.proj-bar-track{height:2.5px;background:${t.border2};border-radius:2px;overflow:hidden;}
.proj-bar-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:2px;transition:width 0.6s ease;}

/* ─── Spinner ─── */
.spinner{width:20px;height:20px;border:2px solid ${t.border2};border-top-color:${t.accent};border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}
@keyframes spin{to{transform:rotate(360deg);}}

/* ─── Topbar toast ─── */
.topbar-toast{position:fixed;top:70px;right:24px;z-index:100;pointer-events:none;}
@media(max-width:600px){.topbar-toast{right:12px;left:12px;top:68px;}}
.mobile-logo{display:none;font-family:'Instrument Serif',serif;font-size:17px;color:${t.ink};align-items:center;gap:6px;}
.mobile-logo-dot{width:5px;height:5px;border-radius:50%;background:${t.accent};}
@media(max-width:900px){.mobile-logo{display:flex;}}
`}</style>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function timeAgo(d) {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function isDueOverdue(due) { return due && new Date(due) < new Date(); }
function formatDue(due) {
  if (!due) return null;
  return new Date(due).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
const PROJECTS = ["Personal", "Work", "Study", "Health", "Other"];

// ─── Animation variants ──────────────────────────────────────────────────
const fadeUp  = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } } };
const fadeIn  = { hidden:{ opacity:0 },       show:{ opacity:1, transition:{ duration:0.3 } } };
const scaleIn = { hidden:{ opacity:0, scale:0.96 }, show:{ opacity:1, scale:1, transition:{ duration:0.32, ease:[0.22,1,0.36,1] } } };
const stagger = { show:{ transition:{ staggerChildren:0.06 } } };

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-40px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={fadeUp} transition={{ delay }} style={{ width:"100%" }}>
      {children}
    </motion.div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <motion.div className={`toast ${type}`} initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8 }}>
      <div className="toast-dot" />{msg}
    </motion.div>
  );
}

// ─── Circular progress widget ────────────────────────────────────────────
function CircularProgress({ pct, size = 64, stroke = 4, t }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.border2} strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.accent} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration:1.2, ease:[0.22,1,0.36,1] }}
      />
    </svg>
  );
}

// ─── Mini sparkline ──────────────────────────────────────────────────────
function Sparkline({ data, color, height = 28 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 60;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={w} height={height} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

// ─── Auth Page ───────────────────────────────────────────────────────────
function AuthPage({ mode, onLogin, onSwitch, t }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const isLogin = mode === "login";

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handle = async () => {
    if (!email || !password) return showToast("Please fill in all fields.");
    if (!isLogin && password.length < 6) return showToast("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        onLogin(res.data.token, email);
      } else {
        await axios.post(`${API}/api/auth/register`, { email, password });
        showToast("Account created — signing you in.", "success");
        setTimeout(async () => {
          const res = await axios.post(`${API}/api/auth/login`, { email, password });
          onLogin(res.data.token, email);
        }, 900);
      }
    } catch (err) {
      showToast(err.response?.data?.message || (isLogin ? "Login failed." : "Registration failed."));
    }
    setLoading(false);
  };

  const features = [
    { icon: "✦", text: "Priority-based task management" },
    { icon: "◈", text: "Project organisation" },
    { icon: "⟳", text: "Due date tracking" },
    { icon: "◉", text: "Real-time progress" },
  ];

  return (
    <div className="auth-root">
      <div className="auth-grid-overlay" />
      <FloatingShapes accent={t.accent} />
      <div className="auth-inner">
        <motion.div className="auth-brand-col" initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>
          <div className="brand-wordmark"><div className="brand-wordmark-dot" />FlowMind</div>
          <div>
            <div className="brand-headline">{isLogin ? <>Where focus<br />meets <em>clarity.</em></> : <>Your work,<br /><em>elevated.</em></>}</div>
            <div className="brand-desc">{isLogin ? "Sign back in to your workspace and continue where you left off." : "Create your account and build a workspace that actually works for you."}</div>
          </div>
          <div className="brand-features">
            {features.map((f) => (
              <div key={f.text} className="brand-feature">
                <div className="brand-feature-icon">{f.icon}</div>{f.text}
              </div>
            ))}
          </div>
        </motion.div>
        <div className="auth-form-col">
          <AnimatePresence mode="wait">
            <motion.div key={mode} className="auth-box" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}>
              <div className="auth-eyebrow">{isLogin ? "Sign in" : "Get started"}</div>
              <div className="auth-title">{isLogin ? "Welcome back" : "Create account"}</div>
              <div className="auth-sub">{isLogin ? "Enter your credentials to continue." : "Free to use. No credit card required."}</div>
              <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
              <div className="field-wrap">
                <label className="field-label">Email</label>
                <input className="field-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handle()} />
              </div>
              <div className="field-wrap">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handle()} />
              </div>
              <motion.button className="auth-btn" onClick={handle} disabled={loading} whileTap={{ scale:0.98 }}>
                {loading ? (isLogin ? "Signing in…" : "Creating…") : (isLogin ? "Sign in" : "Create account")}
              </motion.button>
              <div className="auth-divider">
                <div className="auth-divider-line" /><span className="auth-divider-text">or</span><div className="auth-divider-line" />
              </div>
              <div className="auth-switch">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={onSwitch}>{isLogin ? "Create one" : "Sign in"}</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Task Item ───────────────────────────────────────────────────────────
function TaskItem({ task, onDelete, onToggle, onEdit, done, delay }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.title);
  const saveEdit = () => {
    if (editVal.trim() && editVal !== task.title) onEdit(task._id, editVal.trim());
    setEditing(false);
  };
  return (
    <motion.div className={`task-item ${done ? "done" : ""}`}
      layout initial={{ opacity:0, x:-12 }} animate={{ opacity:done ? 0.38 : 1, x:0 }}
      exit={{ opacity:0, x:12, height:0, marginBottom:0, padding:0 }}
      transition={{ duration:0.28, delay, ease:[0.22,1,0.36,1] }} whileHover={{ scale:1.002 }}>
      <motion.button className={`task-check ${done ? "checked" : ""}`}
        onClick={() => onToggle(task._id)} whileTap={{ scale:0.82 }}>
        {done && <IconCheck />}
      </motion.button>
      <div className="task-body">
        <div className="task-title-row">
          {editing
            ? <input className="task-edit-input" value={editVal}
                onChange={e => setEditVal(e.target.value)} onBlur={saveEdit}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                autoFocus />
            : <span className="task-text">{task.title}</span>}
          {task.priority && task.priority !== "none" && (
            <span className={`p-badge p-${task.priority}`}>
              <span className="p-dot" style={{ background: task.priority === "high" ? "#e07070" : task.priority === "medium" ? "#d4943a" : "#5db88a" }} />
              {task.priority}
            </span>
          )}
        </div>
        <div className="task-meta">
          {task.project && <span className="task-project">{task.project}</span>}
          {task.dueDate && (
            <span className={`task-due ${isDueOverdue(task.dueDate) && !done ? "overdue" : ""}`}>
              <IconCal /> {formatDue(task.dueDate)}{isDueOverdue(task.dueDate) && !done && " · overdue"}
            </span>
          )}
        </div>
      </div>
      <span className="task-age">{timeAgo(task.createdAt)}</span>
      <div className="task-actions">
        <button className={`task-action ${editing ? "active" : ""}`} onClick={() => setEditing(e => !e)}><IconEdit /></button>
        <button className="task-action del" onClick={() => onDelete(task._id)}><IconTrash /></button>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────
function Dashboard({ token, email, onLogout, theme, setTheme, t }) {
  const [tasks, setTasks]       = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState("none");
  const [project, setProject]   = useState("");
  const [dueDate, setDueDate]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [done, setDone]         = useState({});
  const [filter, setFilter]     = useState("all");
  const [page, setPage]         = useState("tasks");
  const [search, setSearch]     = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/tasks`, { headers: { authorization: token } });
      setTasks(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!taskInput.trim()) return;
    setAdding(true);
    try {
      await axios.post(`${API}/api/tasks/add`, { title:taskInput, priority, project, dueDate }, { headers:{ authorization:token } });
      setTaskInput(""); setPriority("none"); setProject(""); setDueDate("");
      fetchTasks(); showToast("Task added.");
    } catch (e) { showToast(e.response?.data?.message || "Failed to add task.", "error"); }
    setAdding(false);
  };

  const deleteTask = async (id) => {
    try { await axios.delete(`${API}/api/tasks/${id}`, { headers:{ authorization:token } }); fetchTasks(); showToast("Task removed.", "error"); } catch (e) { console.error(e); }
  };

  const editTask = async (id, title) => {
    try { await axios.put(`${API}/api/tasks/${id}`, { title }, { headers:{ authorization:token } }); fetchTasks(); } catch (e) { setTasks(prev => prev.map(tk => tk._id === id ? { ...tk, title } : tk)); }
    showToast("Task updated.");
  };

  const toggleDone = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const completedCount = Object.values(done).filter(Boolean).length;
  const total          = tasks.length;
  const pct            = total ? Math.round((completedCount / total) * 100) : 0;
  const avatarLetter   = email ? email[0].toUpperCase() : "U";
  const todayStr       = new Date().toISOString().split("T")[0];
  const hr             = new Date().getHours();
  const greeting       = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const todayLabel     = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  const overdueCount   = tasks.filter(tk => isDueOverdue(tk.dueDate) && !done[tk._id]).length;
  const highPrio       = tasks.filter(tk => tk.priority === "high" && !done[tk._id]).length;

  // Fake sparkline data based on tasks count
  const sparkData = useMemo(() => {
    const base = Math.max(1, total);
    return [0, Math.round(base*0.2), Math.round(base*0.5), Math.round(base*0.4), Math.round(base*0.7), Math.round(base*0.6), completedCount];
  }, [total, completedCount]);

  const displayTasks = useMemo(() => {
    let list = tasks;
    if (page === "today")    list = tasks.filter(tk => tk.dueDate?.startsWith(todayStr) || tk.createdAt?.startsWith(todayStr));
    if (page === "priority") list = tasks.filter(tk => tk.priority && tk.priority !== "none");
    if (page === "projects") list = selectedProject ? tasks.filter(tk => tk.project === selectedProject) : tasks;
    if (search) list = list.filter(tk => tk.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === "done")    list = list.filter(tk => done[tk._id]);
    if (filter === "pending") list = list.filter(tk => !done[tk._id]);
    return list;
  }, [tasks, page, filter, search, selectedProject, done, todayStr]);

  const projectStats = useMemo(() =>
    PROJECTS.map(p => ({
      name: p,
      count: tasks.filter(tk => tk.project === p).length,
      done: tasks.filter(tk => tk.project === p && done[tk._id]).length,
    })).filter(p => p.count > 0),
  [tasks, done]);

  const pageTitle = { tasks:greeting, today:"Today", priority:"Priority", projects:"Projects" }[page];
  const navItems = [
    { id:"tasks",    icon:<IconTasks />,    label:"My Tasks", count:tasks.length },
    { id:"today",    icon:<IconToday />,    label:"Today",    count:tasks.filter(tk => tk.dueDate?.startsWith(todayStr)).length || null },
    { id:"priority", icon:<IconPriority />, label:"Priority", count:tasks.filter(tk => tk.priority === "high").length || null },
    { id:"projects", icon:<IconProjects />, label:"Projects", count:projectStats.length || null },
  ];
  const pageTitleMap = { tasks:"All Tasks", today:"Today's Tasks", priority:"Priority Tasks", projects: selectedProject || "All Projects" };

  return (
    <div className="dash-root">
      {/* Premium background */}
      <MeshBackground t={t} />
      <MouseSpotlight t={t} />

      {/* Sidebar */}
      <motion.aside className="sidebar" initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }}
        transition={{ duration:0.45, ease:[0.22,1,0.36,1] }} style={{ position:"relative", zIndex:10 }}>
        <div className="sidebar-logo"><div className="sidebar-logo-dot" />FlowMind</div>

        {/* Circular progress widget */}
        <div style={{ padding:"16px 14px 4px", borderBottom:`1px solid ${t.border}` }}>
          <div style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
            <CircularProgress pct={pct} t={t} />
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:t.inkMuted, marginBottom:3 }}>Progress</div>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:20, fontWeight:600, color:t.ink, letterSpacing:"-0.03em", lineHeight:1 }}>{pct}<span style={{ fontSize:12, color:t.inkMuted }}>%</span></div>
              <div style={{ fontSize:10.5, color:t.inkMuted, marginTop:3 }}>{completedCount} of {total} done</div>
            </div>
          </div>
        </div>

        <div>
          <div className="sidebar-section-label">Workspace</div>
          <ul className="nav-list">
            {navItems.map((n, i) => (
              <motion.li key={n.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.05*i, duration:0.3 }}>
                <button className={`nav-btn ${page === n.id ? "active" : ""}`}
                  onClick={() => { setPage(n.id); setSelectedProject(null); }}>
                  <span className="nav-icon">{n.icon}</span>
                  {n.label}
                  {n.count > 0 && <span className="nav-badge">{n.count}</span>}
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Mini insight cards in sidebar */}
        <div style={{ padding:"12px 14px 0" }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.22em", textTransform:"uppercase", color:t.inkMuted, fontWeight:600, marginBottom:8, paddingLeft:4 }}>Quick Glance</div>
          {[
            { label:"Overdue", val:overdueCount, color:t.red },
            { label:"High prio", val:highPrio, color:t.amber },
            { label:"Projects", val:projectStats.length, color:t.accent },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              background:t.surface2, border:`1px solid ${t.border}`, borderRadius:9, padding:"8px 12px", marginBottom:5 }}>
              <span style={{ fontSize:11.5, color:t.inkMid, fontWeight:500 }}>{item.label}</span>
              <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:13, fontWeight:700, color:item.val > 0 ? item.color : t.inkMuted }}>{item.val}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={onLogout}><IconLogout /> Sign out</button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="dash-main" style={{ position:"relative", zIndex:5 }}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="mobile-logo"><div className="mobile-logo-dot" />FlowMind</div>
            <h1>{pageTitle}</h1>
            <p>{todayLabel}</p>
          </div>
          <div className="topbar-right">
            <div className="theme-toggle">
              <button className={`theme-opt ${theme === "warm" ? "active" : ""}`} onClick={() => setTheme("warm")}><IconSun /> Warm</button>
              <button className={`theme-opt ${theme === "deep" ? "active" : ""}`} onClick={() => setTheme("deep")}><IconMoon /> Deep</button>
            </div>
            <div className="avatar">{avatarLetter}</div>
          </div>
        </div>

        {/* Toast */}
        <div className="topbar-toast">
          <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>
        </div>

        <div className="content">
          {/* Search */}
          <Reveal>
            <div className="search-wrap">
              <span className="search-icon"><IconSearch /></span>
              <input className="search-input" placeholder="Search tasks…" value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </Reveal>

          {/* Stats row */}
          {page === "tasks" && (
            <>
              <motion.div className="stats-grid" variants={stagger} initial="hidden" animate="show">
                {[
                  { label:"Total",     val:total,                  sub:"tasks in workspace", icon:<IconTasks />,    barPct:100 },
                  { label:"Completed", val:completedCount,         sub:<><b>{pct}%</b> done</>,       icon:<IconCheck />,    barPct:pct },
                  { label:"Pending",   val:total - completedCount, sub:"remaining",           icon:<IconZap />,      barPct:total ? ((total-completedCount)/total*100) : 0 },
                  { label:"Overdue",   val:overdueCount,           sub:"need attention",      icon:<IconTarget />,   barPct:total ? (overdueCount/total*100) : 0 },
                ].map((s) => (
                  <motion.div className="stat-card" key={s.label} variants={scaleIn}>
                    <div className="stat-card-bg" />
                    <div className="stat-card-glow" />
                    <div className="stat-icon-row">
                      <div className="stat-icon-badge">{s.icon}</div>
                      <Sparkline data={sparkData} color={t.accent} />
                    </div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-sub">{s.sub}</div>
                    <div className="stat-bar">
                      <motion.div className="stat-bar-fill" initial={{ width:0 }}
                        animate={{ width:`${s.barPct}%` }}
                        transition={{ duration:1.1, ease:[0.22,1,0.36,1] }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Insight strip */}
              <Reveal delay={0.04}>
                <div className="insight-strip">
                  {[
                    { icon:<IconTrend />,    val:`${pct}%`,       label:"Completion rate this session" },
                    { icon:<IconActivity />, val:`${highPrio}`,   label:"High priority tasks pending" },
                    { icon:<IconZap />,      val:`${tasks.filter(tk => tk.dueDate?.startsWith(todayStr)).length}`, label:"Tasks due today" },
                  ].map((item, i) => (
                    <motion.div key={i} className="insight-card" variants={scaleIn} initial="hidden" animate="show"
                      transition={{ delay:i*0.07 }}>
                      <div className="insight-icon">{item.icon}</div>
                      <div className="insight-body">
                        <div className="insight-val">{item.val}</div>
                        <div className="insight-label">{item.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </>
          )}

          {/* Projects grid */}
          {page === "projects" && (
            <Reveal>
              <div className="projects-grid">
                {projectStats.length === 0
                  ? <p style={{ color:t.inkMuted, fontSize:13, gridColumn:"1/-1" }}>No projects yet — create a task and assign a project.</p>
                  : projectStats.map((p) => (
                    <motion.div key={p.name} variants={scaleIn} initial="hidden" animate="show"
                      className={`project-card ${selectedProject === p.name ? "selected" : ""}`}
                      onClick={() => setSelectedProject(prev => prev === p.name ? null : p.name)}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
                      <div className="project-card-name">{p.name}</div>
                      <div className="project-card-count">{p.count} tasks · {p.done} done</div>
                      <div className="proj-bar-track">
                        <div className="proj-bar-fill" style={{ width:p.count ? `${Math.round((p.done/p.count)*100)}%` : "0%" }} />
                      </div>
                    </motion.div>
                  ))}
              </div>
              {selectedProject && (
                <div style={{ marginBottom:14, fontSize:12, color:t.inkMuted, display:"flex", alignItems:"center", gap:8 }}>
                  Showing: <span style={{ color:t.accent, fontWeight:700 }}>{selectedProject}</span>
                  <button onClick={() => setSelectedProject(null)} style={{ background:"none", border:"none", color:t.red, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"DM Sans,sans-serif" }}>Clear</button>
                </div>
              )}
            </Reveal>
          )}

          {/* Add task */}
          <Reveal delay={0.06}>
            <div className="add-card">
              <div className="add-card-head">
                <div className="add-card-icon"><IconSparkle /></div>
                <span className="add-card-label">New Task</span>
              </div>
              <div className="add-row">
                <input className="add-input" placeholder="What needs to be done?" value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()} />
                <select className="add-select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="none">No priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select className="add-select" value={project} onChange={e => setProject(e.target.value)}>
                  <option value="">No project</option>
                  {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="add-select" type="date" value={dueDate}
                  onChange={e => setDueDate(e.target.value)} style={{ cursor:"pointer" }} />
                <motion.button className="add-btn" onClick={addTask} disabled={adding} whileTap={{ scale:0.97 }}>
                  <IconPlus />{adding ? "Adding…" : "Add task"}
                </motion.button>
              </div>
            </div>
          </Reveal>

          {/* Task list */}
          <Reveal delay={0.09}>
            <div className="section-head">
              <span className="section-title">{pageTitleMap[page]}</span>
              <span className="section-badge">{displayTasks.length}</span>
            </div>
            <div className="filter-tabs">
              {["all","pending","done"].map(f => (
                <motion.button key={f} className={`filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)} whileTap={{ scale:0.96 }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </motion.button>
              ))}
            </div>
            {loading
              ? <div className="spinner" />
              : displayTasks.length === 0
                ? (
                  <motion.div className="empty" variants={fadeIn} initial="hidden" animate="show">
                    <div className="empty-icon">
                      {page === "today" ? <IconToday /> : page === "priority" ? <IconPriority /> : <IconTasks />}
                    </div>
                    <div className="empty-title">{search ? "No results found" : page === "today" ? "Nothing due today" : page === "priority" ? "No priority tasks" : "No tasks yet"}</div>
                    <div className="empty-sub">{search ? "Try a different keyword" : "Add a task above to get started"}</div>
                  </motion.div>
                )
                : (
                  <motion.div className="task-list" layout>
                    <AnimatePresence>
                      {displayTasks.map((task, i) => (
                        <TaskItem key={task._id} task={task} done={!!done[task._id]}
                          onToggle={toggleDone} onDelete={deleteTask} onEdit={editTask}
                          delay={i*0.03} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
          </Reveal>
        </div>
      </main>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [authPage, setAuthPage] = useState("login");
  const [token, setToken]       = useState(() => localStorage.getItem("fm_token") || "");
  const [email, setEmail]       = useState(() => localStorage.getItem("fm_email") || "");
  const [theme, setTheme]       = useState(() => localStorage.getItem("fm_theme") || "warm");
  const t = THEMES[theme];

  useEffect(() => { localStorage.setItem("fm_theme", theme); }, [theme]);

  const handleLogin = (tok, em) => {
    setToken(tok); setEmail(em);
    localStorage.setItem("fm_token", tok);
    localStorage.setItem("fm_email", em);
  };
  const handleLogout = () => {
    setToken(""); setEmail("");
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_email");
    setAuthPage("login");
  };

  return (
    <>
      <GlobalStyles t={t} />
      <AnimatePresence mode="wait">
        {!token
          ? <AuthPage key="auth" mode={authPage} onLogin={handleLogin}
              onSwitch={() => setAuthPage(p => p === "login" ? "register" : "login")} t={t} />
          : <Dashboard key="dash" token={token} email={email} onLogout={handleLogout}
              theme={theme} setTheme={setTheme} t={t} />}
      </AnimatePresence>
    </>
  );
}