// FlowMind V3 — Drag & Drop + Bulk Actions + View Toggle + Custom Accent
// New deps: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
// All existing code preserved; only additive changes made.

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform
} from "framer-motion";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API = "https://flowmind-backend-h2aw.onrender.com";

// ─── Icons ────────────────────────────────────────────────────────────────
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
const IconKanban   = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="4" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="6" y="2" width="4" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="2" width="4" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>);
const IconChart    = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 13h14M3 13V8M7 13V5M11 13V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IconSub      = () => (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2v7h9M5 9l3 2.5L11 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconTrophy   = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 1h6v5a3 3 0 01-6 0V1z" stroke="currentColor" strokeWidth="1.2"/><path d="M4 3H2a1 1 0 000 2h2M10 3h2a1 1 0 010 2h-2M7 9v3M5 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IconFlame    = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 13c-2.8 0-5-2-5-4.5 0-2 1.5-3.5 2-5 .5 1.5 1 2 2 2.5C6 4 7 2 7 1c2 1.5 3 3 3 4.5 0 .8-.3 1.5-.8 2C10 8 10 9 9 10c0-1-1-1.5-1.5-1C7 10 7 11.5 7 13z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconCmd      = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3a2 2 0 00-2 2v1h2V5a1 1 0 011-1h0a1 1 0 011 1v1h2V5a2 2 0 00-2-2H5zM3 8v1a2 2 0 002 2h0a1 1 0 001-1V9H4a1 1 0 01-1-1zM9 8v2a1 1 0 001 1h0a2 2 0 002-2V8H9z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>);
const IconChevron  = ({ open }) => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform:open?"rotate(90deg)":"none", transition:"transform 0.2s" }}><path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
// NEW icons
const IconGrip     = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="1" fill="currentColor"/><circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="5" cy="10" r="1" fill="currentColor"/><circle cx="9" cy="4" r="1" fill="currentColor"/><circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="10" r="1" fill="currentColor"/></svg>);
const IconCompact  = () => (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 3.5h11M2 7.5h11M2 11.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IconComfort  = () => (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="11" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>);
const IconPalette  = () => (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="10" cy="6" r="1" fill="currentColor"/><circle cx="7.5" cy="10" r="1" fill="currentColor"/></svg>);
const IconSelect   = () => (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>);

// ─── Theme base ───────────────────────────────────────────────────────────
const THEMES = {
  warm: {
    bg:"#0a0806",bg2:"#100d0a",surface:"#16110e",surface2:"#1d1713",surface3:"#251e19",
    border:"rgba(255,220,180,0.06)",border2:"rgba(255,220,180,0.1)",border3:"rgba(255,220,180,0.17)",
    ink:"#f7eede",inkMid:"rgba(247,238,222,0.62)",inkMuted:"rgba(247,238,222,0.36)",inkFaint:"rgba(247,238,222,0.14)",
    accent:"#e8956a",accent2:"#f5bb94",accentDim:"rgba(232,149,106,0.12)",accentDim2:"rgba(232,149,106,0.22)",accentDim3:"rgba(232,149,106,0.07)",
    red:"#e07070",redDim:"rgba(224,112,112,0.12)",amber:"#d4943a",amberDim:"rgba(212,148,58,0.12)",green:"#5db88a",greenDim:"rgba(93,184,138,0.12)",
    glow1:"rgba(232,149,106,0.15)",meshA:"232,149,106",meshB:"180,90,60",
  },
  deep: {
    bg:"#07070f",bg2:"#0a0a16",surface:"#0f0f1c",surface2:"#151526",surface3:"#1c1c30",
    border:"rgba(160,150,255,0.06)",border2:"rgba(160,150,255,0.1)",border3:"rgba(160,150,255,0.17)",
    ink:"#ebe8ff",inkMid:"rgba(235,232,255,0.6)",inkMuted:"rgba(235,232,255,0.34)",inkFaint:"rgba(235,232,255,0.13)",
    accent:"#7c6ee8",accent2:"#a99ef5",accentDim:"rgba(124,110,232,0.13)",accentDim2:"rgba(124,110,232,0.23)",accentDim3:"rgba(124,110,232,0.07)",
    red:"#e07070",redDim:"rgba(224,112,112,0.12)",amber:"#d4943a",amberDim:"rgba(212,148,58,0.12)",green:"#5db88a",greenDim:"rgba(93,184,138,0.12)",
    glow1:"rgba(124,110,232,0.15)",meshA:"124,110,232",meshB:"80,60,180",
  },
};

// Derive full accent palette from a hex color
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function lighten(hex, pct) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + Math.round(255*pct));
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + Math.round(255*pct));
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + Math.round(255*pct));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function applyAccent(base, hex) {
  const rgb = hexToRgb(hex);
  const light = lighten(hex, 0.18);
  return {
    ...base,
    accent:     hex,
    accent2:    light,
    accentDim:  `rgba(${rgb},0.13)`,
    accentDim2: `rgba(${rgb},0.22)`,
    accentDim3: `rgba(${rgb},0.07)`,
    glow1:      `rgba(${rgb},0.15)`,
    meshA:      rgb,
  };
}

// ─── Confetti ─────────────────────────────────────────────────────────────
function useConfetti() {
  const canvasRef = useRef(null);
  const fire = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const pieces = Array.from({ length:70 }, () => ({
      x:Math.random()*canvas.width, y:-10, r:Math.random()*5+3,
      d:Math.random()*80+10, tilt:Math.random()*10-10, tiltAngle:0,
      tiltSpeed:Math.random()*0.1+0.05,
      color:["#e8956a","#7c6ee8","#5db88a","#d4943a","#e07070","#a99ef5"][Math.floor(Math.random()*6)],
    }));
    let angle = 0, frame;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      angle += 0.01;
      pieces.forEach(p => {
        p.tiltAngle += p.tiltSpeed; p.y += (Math.cos(angle+p.d)+2)*1.5;
        p.x += Math.sin(angle)*0.8; p.tilt = Math.sin(p.tiltAngle)*12;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x+p.tilt+p.r/4,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/4); ctx.stroke();
      });
      if (pieces.some(p => p.y < canvas.height+20)) { frame = requestAnimationFrame(draw); }
      else { ctx.clearRect(0,0,canvas.width,canvas.height); }
    };
    frame = requestAnimationFrame(draw);
    setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0,0,canvas.width,canvas.height); }, 3200);
  }, []);
  return { canvasRef, fire };
}

// ─── XP / Badges ──────────────────────────────────────────────────────────
const BADGES = [
  { id:"first",   label:"First Task",    icon:"🎯", xp:0,  desc:"Complete your first task" },
  { id:"five",    label:"Getting Going",  icon:"⚡", xp:50, desc:"Earn 50 XP" },
  { id:"streak3", label:"On a Roll",      icon:"🔥", xp:0,  desc:"3-day streak", streak:3 },
  { id:"hundred", label:"Century Club",   icon:"💯", xp:100,desc:"Earn 100 XP" },
  { id:"pro",     label:"Power User",     icon:"🚀", xp:200,desc:"Earn 200 XP" },
];
function useGamification(completedCount) {
  const [xp,setXp]         = useState(() => parseInt(localStorage.getItem("fm_xp")||"0"));
  const [streak,setStreak] = useState(() => parseInt(localStorage.getItem("fm_streak")||"0"));
  const [badges,setBadges] = useState(() => JSON.parse(localStorage.getItem("fm_badges")||"[]"));
  const [newBadge,setNewBadge] = useState(null);
  const prevCompleted = useRef(completedCount);
  const addXp = useCallback(n => { setXp(p => { const nx=p+n; localStorage.setItem("fm_xp",nx); return nx; }); }, []);
  useEffect(() => {
    if (completedCount > prevCompleted.current) {
      addXp(10); prevCompleted.current = completedCount;
      const today = new Date().toDateString(), lastDay = localStorage.getItem("fm_lastday");
      const yest = new Date(Date.now()-86400000).toDateString();
      let ns = streak; if (lastDay===yest) ns=streak+1; else if (lastDay!==today) ns=1;
      setStreak(ns); localStorage.setItem("fm_streak",ns); localStorage.setItem("fm_lastday",today);
    }
  }, [completedCount, addXp, streak]);
  useEffect(() => {
    BADGES.forEach(b => {
      if (badges.includes(b.id)) return;
      let earned = false;
      if (b.id==="first" && completedCount>=1) earned=true;
      if (b.xp && xp>=b.xp) earned=true;
      if (b.streak && streak>=b.streak) earned=true;
      if (earned) {
        const next=[...badges,b.id]; setBadges(next); localStorage.setItem("fm_badges",JSON.stringify(next));
        setNewBadge(b); setTimeout(()=>setNewBadge(null),3000);
      }
    });
  }, [xp,streak,completedCount,badges]);
  return { xp, streak, badges, newBadge, level:Math.floor(xp/50)+1, xpToNext:50-(xp%50) };
}

// ─── Background ───────────────────────────────────────────────────────────
function MeshBackground({ t }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none" }}>
      <div style={{ position:"absolute",inset:0,
        background:`radial-gradient(ellipse 90% 60% at 20% 10%, rgba(${t.meshA},0.09) 0%, transparent 60%),
                    radial-gradient(ellipse 70% 50% at 80% 80%, rgba(${t.meshB},0.07) 0%, transparent 55%)` }} />
      {[{size:480,x:"5%",y:"8%",dur:22,delay:0},{size:360,x:"70%",y:"5%",dur:28,delay:4},{size:520,x:"60%",y:"55%",dur:18,delay:2}].map((o,i) => (
        <motion.div key={i}
          style={{ position:"absolute",left:o.x,top:o.y,width:o.size,height:o.size,borderRadius:"50%",
            background:`radial-gradient(circle at 40% 35%, rgba(${i%2===0?t.meshA:t.meshB},0.07) 0%, transparent 70%)`,
            filter:"blur(60px)",willChange:"transform" }}
          animate={{ x:[0,-30,20,-15,0],y:[0,20,-30,15,0],scale:[1,1.08,0.94,1.05,1] }}
          transition={{ duration:o.dur,delay:o.delay,repeat:Infinity,ease:"easeInOut" }} />
      ))}
      <div style={{ position:"absolute",inset:0,
        backgroundImage:`linear-gradient(rgba(${t.meshA},0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(${t.meshA},0.02) 1px,transparent 1px)`,
        backgroundSize:"64px 64px",
        maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }} />
    </div>
  );
}
function MouseSpotlight({ t }) {
  const mx=useMotionValue(0.5),my=useMotionValue(0.5);
  const sx=useSpring(mx,{stiffness:80,damping:30}),sy=useSpring(my,{stiffness:80,damping:30});
  const bgX=useTransform(sx,v=>`${v*100}%`),bgY=useTransform(sy,v=>`${v*100}%`);
  useEffect(() => {
    const h=e=>{mx.set(e.clientX/window.innerWidth);my.set(e.clientY/window.innerHeight);};
    window.addEventListener("mousemove",h,{passive:true});
    return ()=>window.removeEventListener("mousemove",h);
  },[mx,my]);
  return <motion.div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
    background:`radial-gradient(600px circle at ${bgX} ${bgY},rgba(${t.meshA},0.05) 0%,transparent 60%)` }} />;
}
function FloatingShapes({ accent }) {
  return (
    <div style={{ position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0 }}>
      {[{x:"8%",y:"12%",size:200,delay:0,dur:18},{x:"62%",y:"6%",size:140,delay:3,dur:22},{x:"78%",y:"58%",size:170,delay:1.5,dur:20}].map((s,i) => (
        <motion.div key={i}
          style={{ position:"absolute",left:s.x,top:s.y,width:s.size,height:s.size,
            borderRadius:"30% 70% 70% 30%/30% 30% 70% 70%",
            background:`radial-gradient(circle at 40% 40%,${accent}22 0%,${accent}06 60%,transparent 100%)`,
            border:`1px solid ${accent}14` }}
          animate={{ y:[0,-30,10,-20,0],rotate:[0,15,-10,20,0] }}
          transition={{ duration:s.dur,delay:s.delay,repeat:Infinity,ease:"easeInOut" }} />
      ))}
    </div>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────────────
function GlobalStyles({ t }) {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;scroll-behavior:smooth;}
body{background:${t.bg};color:${t.ink};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;font-size:13.5px;line-height:1.55;transition:background 0.5s,color 0.5s;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${t.border3};border-radius:4px;}
input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.3;cursor:pointer;filter:invert(1);}
input[type="color"]{-webkit-appearance:none;border:none;padding:0;cursor:pointer;}
input[type="color"]::-webkit-color-swatch-wrapper{padding:0;}
input[type="color"]::-webkit-color-swatch{border:none;border-radius:4px;}

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
.field-input{width:100%;background:${t.surface};border:1px solid ${t.border2};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 16px;outline:none;border-radius:10px;transition:all 0.22s;}
.field-input::placeholder{color:${t.inkFaint};}
.field-input:focus{border-color:${t.accent};background:${t.surface2};box-shadow:0 0 0 4px ${t.accentDim};}
.auth-btn{width:100%;background:${t.accent};border:none;color:#0d0b09;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;padding:13px;cursor:pointer;border-radius:10px;margin-top:8px;transition:all 0.2s;position:relative;overflow:hidden;}
.auth-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);pointer-events:none;}
.auth-btn:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 6px 24px ${t.accentDim2};transform:translateY(-1px);}
.auth-btn:disabled{opacity:0.45;cursor:not-allowed;}
.auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
.auth-divider-line{flex:1;height:1px;background:${t.border};}
.auth-divider-text{font-size:11px;color:${t.inkMuted};}
.auth-switch{text-align:center;font-size:12.5px;color:${t.inkMuted};}
.auth-switch button{background:none;border:none;color:${t.accent};font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.toast{padding:10px 14px;border-radius:10px;font-size:12.5px;font-weight:500;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.toast.error{background:${t.redDim};color:${t.red};border:1px solid rgba(224,112,112,0.18);}
.toast.success{background:${t.greenDim};color:${t.green};border:1px solid rgba(93,184,138,0.18);}
.toast.error .toast-dot{background:${t.red};}
.toast.success .toast-dot{background:${t.green};}

/* Dashboard */
.dash-root{min-height:100vh;display:grid;grid-template-columns:248px 1fr;background:${t.bg};position:relative;}
@media(max-width:900px){.dash-root{grid-template-columns:1fr;}.sidebar{display:none;}}

/* Sidebar */
.sidebar{background:${t.surface};border-right:1px solid ${t.border};display:flex;flex-direction:column;height:100vh;position:sticky;top:0;overflow-y:auto;backdrop-filter:blur(24px);}
.sidebar-logo{padding:22px 20px;border-bottom:1px solid ${t.border};font-family:'Instrument Serif',serif;font-size:20px;color:${t.ink};letter-spacing:-0.01em;display:flex;align-items:center;gap:9px;}
.sidebar-logo-dot{width:7px;height:7px;border-radius:50%;background:${t.accent};box-shadow:0 0 12px ${t.accentDim2};}
.sidebar-section-label{font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:${t.inkMuted};font-weight:600;padding:18px 18px 8px;}
.nav-list{list-style:none;display:flex;flex-direction:column;gap:2px;padding:0 10px;}
.nav-btn{width:100%;display:flex;align-items:center;gap:10px;background:none;border:none;color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:9px 12px;cursor:pointer;border-radius:10px;transition:all 0.15s;text-align:left;}
.nav-btn:hover{background:${t.surface2};color:${t.ink};}
.nav-btn.active{background:${t.accentDim2};color:${t.accent};font-weight:600;}
.nav-icon{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.nav-badge{margin-left:auto;background:${t.surface3};border:1px solid ${t.border2};color:${t.inkMid};font-size:10px;font-weight:700;padding:1px 7px;border-radius:20px;font-family:'Geist Mono',monospace;}
.nav-btn.active .nav-badge{background:${t.accentDim};border-color:${t.accentDim2};color:${t.accent};}
.sidebar-bottom{margin-top:auto;padding:14px;border-top:1px solid ${t.border};}
.logout-btn{width:100%;display:flex;align-items:center;gap:9px;background:none;border:1px solid ${t.border};color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;padding:9px 12px;cursor:pointer;border-radius:10px;transition:all 0.18s;}
.logout-btn:hover{background:${t.redDim};color:${t.red};border-color:rgba(224,112,112,0.2);}

/* Topbar */
.dash-main{display:flex;flex-direction:column;overflow-y:auto;position:relative;z-index:1;}
.topbar{background:rgba(${t.meshA},0.03);border-bottom:1px solid ${t.border};padding:12px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;backdrop-filter:blur(28px);}
@media(max-width:600px){.topbar{padding:10px 14px;}}
.topbar-left h1{font-family:'Instrument Serif',serif;font-size:18px;letter-spacing:-0.02em;color:${t.ink};}
.topbar-left p{font-size:11px;color:${t.inkMuted};margin-top:1px;}
.topbar-right{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.theme-toggle{display:flex;align-items:center;background:${t.surface2};border:1px solid ${t.border2};border-radius:24px;padding:3px;gap:1px;}
.theme-opt{background:none;border:none;color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;padding:5px 10px;border-radius:20px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:4px;}
.theme-opt.active{background:${t.accentDim2};color:${t.accent};}
.avatar{width:30px;height:30px;background:linear-gradient(135deg,${t.accent},${t.accent2});border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0d0b09;font-family:'Instrument Serif',serif;font-size:13px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px ${t.accentDim2};}
.cmd-btn{display:flex;align-items:center;gap:7px;background:${t.surface2};border:1px solid ${t.border2};color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;padding:5px 10px;border-radius:8px;cursor:pointer;transition:all 0.15s;}
.cmd-btn:hover{border-color:${t.accent};color:${t.accent};}
.cmd-key{background:${t.surface3};border:1px solid ${t.border2};border-radius:4px;padding:1px 5px;font-size:10px;font-family:'Geist Mono',monospace;}

/* ── NEW: Icon toolbar buttons ── */
.icon-btn{display:flex;align-items:center;justify-content:center;gap:5px;background:${t.surface2};border:1px solid ${t.border2};color:${t.inkMuted};padding:5px 10px;border-radius:8px;cursor:pointer;transition:all 0.18s;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;}
.icon-btn:hover{border-color:${t.border3};color:${t.ink};}
.icon-btn.active{background:${t.accentDim2};border-color:${t.accentDim2};color:${t.accent};}

/* Content */
.content{padding:22px 24px;flex:1;}
@media(max-width:600px){.content{padding:14px 14px;}}

/* Search */
.search-wrap{position:relative;margin-bottom:20px;}
.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:${t.inkMuted};display:flex;}
.search-input{width:100%;background:${t.surface};border:1px solid ${t.border};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:11px 14px 11px 40px;outline:none;border-radius:12px;transition:all 0.2s;}
.search-input::placeholder{color:${t.inkMuted};}
.search-input:focus{border-color:${t.border3};box-shadow:0 0 0 4px ${t.accentDim};background:${t.surface2};}

/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:500px){.stats-grid{grid-template-columns:1fr 1fr;gap:8px;}}
.stat-card{background:${t.surface};border:1px solid ${t.border};padding:18px 18px 16px;border-radius:16px;position:relative;overflow:hidden;transition:all 0.25s;}
.stat-card:hover{border-color:${t.border2};box-shadow:0 8px 28px rgba(0,0,0,0.28);transform:translateY(-2px);}
.stat-card-bg{position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 55%);pointer-events:none;}
.stat-card-glow{position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,${t.glow1} 0%,transparent 70%);pointer-events:none;}
.stat-icon-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.stat-icon-badge{width:28px;height:28px;border-radius:9px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};}
.stat-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${t.inkMuted};margin-bottom:10px;}
.stat-val{font-family:'Geist Mono',monospace;font-size:30px;font-weight:500;color:${t.ink};letter-spacing:-0.04em;line-height:1;margin-bottom:5px;}
.stat-sub{font-size:11px;color:${t.inkMuted};}
.stat-sub b{color:${t.accent};font-weight:700;}
.stat-bar{height:2px;background:${t.border2};border-radius:2px;overflow:hidden;margin-top:10px;}
.stat-bar-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:2px;}

/* Insight strip */
.insight-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
@media(max-width:900px){.insight-strip{grid-template-columns:1fr 1fr;}}
@media(max-width:500px){.insight-strip{grid-template-columns:1fr;gap:8px;}}
.insight-card{background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all 0.2s;}
.insight-card:hover{border-color:${t.border2};transform:translateY(-1px);box-shadow:0 4px 18px rgba(0,0,0,0.18);}
.insight-icon{width:36px;height:36px;border-radius:10px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};flex-shrink:0;}
.insight-val{font-family:'Geist Mono',monospace;font-size:17px;font-weight:600;color:${t.ink};letter-spacing:-0.03em;line-height:1.2;}
.insight-label{font-size:11px;color:${t.inkMuted};margin-top:2px;}

/* XP bar */
.xp-bar-wrap{background:${t.surface2};border:1px solid ${t.border};border-radius:12px;padding:12px 14px;margin-bottom:10px;}
.xp-bar-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;}
.xp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${t.inkMuted};}
.xp-val{font-family:'Geist Mono',monospace;font-size:13px;font-weight:700;color:${t.accent};}
.xp-track{height:4px;background:${t.border2};border-radius:4px;overflow:hidden;}
.xp-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:4px;}
.xp-meta{display:flex;align-items:center;gap:10px;margin-top:6px;}
.xp-streak{font-size:11px;color:${t.inkMuted};display:flex;align-items:center;gap:4px;}

/* Add card */
.add-card{background:${t.surface};border:1px solid ${t.border};border-radius:16px;padding:18px 20px;margin-bottom:18px;position:relative;overflow:hidden;}
.add-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${t.accentDim3} 0%,transparent 60%);pointer-events:none;}
.add-card-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.add-card-icon{width:22px;height:22px;border-radius:7px;background:${t.accentDim};border:1px solid ${t.accentDim2};display:flex;align-items:center;justify-content:center;color:${t.accent};}
.add-card-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${t.inkMuted};}
.add-row{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch;}
@media(max-width:700px){.add-row{flex-direction:column;}}
.add-input{flex:1;min-width:140px;background:${t.bg2};border:1px solid ${t.border2};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:10px 13px;outline:none;border-radius:10px;transition:all 0.2s;}
.add-input::placeholder{color:${t.inkMuted};}
.add-input:focus{border-color:${t.accent};box-shadow:0 0 0 3px ${t.accentDim};background:${t.surface2};}
.add-select{background:${t.bg2};border:1px solid ${t.border2};color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;padding:10px 10px;outline:none;border-radius:10px;cursor:pointer;transition:border-color 0.2s;}
.add-select:focus{border-color:${t.accent};}
.add-select option{background:${t.surface2};}
@media(max-width:700px){.add-select,.add-input{width:100%;}}
.add-btn{background:${t.accent};border:none;color:#0d0b09;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;padding:10px 18px;cursor:pointer;border-radius:10px;display:flex;align-items:center;gap:7px;white-space:nowrap;transition:all 0.2s;position:relative;overflow:hidden;}
.add-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 60%);pointer-events:none;}
.add-btn:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 4px 18px ${t.accentDim2};transform:translateY(-1px);}
.add-btn:disabled{opacity:0.45;cursor:not-allowed;}
@media(max-width:700px){.add-btn{width:100%;justify-content:center;}}

/* Section */
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.section-title{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${t.inkMuted};font-weight:700;}
.section-badge{font-size:10px;font-family:'Geist Mono',monospace;background:${t.surface};border:1px solid ${t.border};color:${t.inkMid};padding:2px 10px;border-radius:20px;}
.filter-tabs{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap;}
.filter-tab{background:none;border:1px solid transparent;color:${t.inkMuted};font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:600;padding:5px 13px;cursor:pointer;border-radius:20px;transition:all 0.15s;}
.filter-tab:hover{border-color:${t.border2};color:${t.ink};}
.filter-tab.active{background:${t.accent};border-color:${t.accent};color:#0d0b09;}

/* Task items */
.task-list{display:flex;flex-direction:column;gap:4px;}
.task-item{background:${t.surface};border:1px solid ${t.border};border-radius:12px;display:flex;align-items:flex-start;gap:11px;padding:13px 16px;transition:border-color 0.18s,background 0.18s,box-shadow 0.18s;position:relative;overflow:hidden;}
.task-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:transparent;border-radius:12px 0 0 12px;transition:background 0.2s;}
.task-item:hover{border-color:${t.border2};background:${t.surface2};box-shadow:0 4px 14px rgba(0,0,0,0.16);}
.task-item:hover::before{background:${t.accentDim2};}
.task-item.done{opacity:0.38;}
.task-item.done::before{background:${t.greenDim}!important;}
.task-item.selected-task{border-color:${t.accentDim2};background:${t.accentDim3};box-shadow:0 0 0 2px ${t.accentDim};}
.task-item.selected-task::before{background:${t.accent};}
/* Compact view */
.task-item.compact{padding:8px 12px;gap:9px;border-radius:9px;}
.task-item.compact .task-text{font-size:13px;}
.task-item.compact .task-meta{margin-bottom:0;}

.task-check{width:19px;height:19px;border:1.5px solid ${t.border3};border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:none;color:transparent;transition:all 0.18s;margin-top:1px;}
.task-check:hover{border-color:${t.accent};background:${t.accentDim};}
.task-check.checked{background:${t.accent};border-color:${t.accent};color:#0d0b09;}
/* Bulk select checkbox */
.task-select-check{width:16px;height:16px;border:1.5px solid ${t.border3};border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;background:none;color:transparent;transition:all 0.18s;margin-top:2px;}
.task-select-check:hover{border-color:${t.accent};background:${t.accentDim};}
.task-select-check.selected{background:${t.accent};border-color:${t.accent};color:#0d0b09;}

.task-body{flex:1;min-width:0;}
.task-title-row{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.task-text{font-size:13.5px;color:${t.ink};line-height:1.35;font-weight:400;}
.task-item.done .task-text{text-decoration:line-through;color:${t.inkMuted};}
.p-badge{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 7px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;gap:4px;}
.p-dot{width:5px;height:5px;border-radius:50%;}
.p-high{background:${t.redDim};color:${t.red};}
.p-medium{background:${t.amberDim};color:${t.amber};}
.p-low{background:${t.greenDim};color:${t.green};}
.task-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;}
.task-project{font-size:10px;color:${t.accent};background:${t.accentDim3};border:1px solid ${t.accentDim};padding:1px 8px;border-radius:5px;font-weight:700;}
.task-due{font-size:10.5px;color:${t.inkMuted};display:flex;align-items:center;gap:4px;}
.task-due.overdue{color:${t.red};}
.task-age{font-size:10px;color:${t.inkMuted};flex-shrink:0;font-family:'Geist Mono',monospace;white-space:nowrap;}
.task-actions{display:flex;gap:2px;opacity:0;transition:opacity 0.15s;flex-shrink:0;margin-top:1px;}
.task-item:hover .task-actions{opacity:1;}
.task-action{background:none;border:none;color:${t.inkMuted};cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:7px;transition:all 0.15s;}
.task-action:hover{background:${t.surface3};color:${t.ink};}
.task-action.del:hover{background:${t.redDim};color:${t.red};}
.task-action.active{background:${t.accentDim};color:${t.accent};}
.task-edit-input{flex:1;background:${t.bg2};border:1px solid ${t.accent};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:13.5px;padding:4px 10px;outline:none;border-radius:7px;box-shadow:0 0 0 3px ${t.accentDim};}
/* Drag handle */
.drag-handle{color:${t.inkFaint};cursor:grab;display:flex;align-items:center;padding:1px 0;transition:color 0.15s;touch-action:none;flex-shrink:0;}
.drag-handle:hover{color:${t.inkMuted};}
.drag-handle:active{cursor:grabbing;}

/* Subtasks */
.subtask-list{margin-top:8px;padding-left:28px;display:flex;flex-direction:column;gap:3px;}
.subtask-item{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:7px;background:${t.bg2};border:1px solid ${t.border};}
.subtask-check{width:14px;height:14px;border:1.5px solid ${t.border3};border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:none;color:transparent;transition:all 0.15s;flex-shrink:0;}
.subtask-check:hover{border-color:${t.accent};}
.subtask-check.checked{background:${t.green};border-color:${t.green};color:#fff;}
.subtask-text{font-size:12px;color:${t.inkMid};flex:1;}
.subtask-text.done{text-decoration:line-through;color:${t.inkMuted};}
.subtask-del{background:none;border:none;color:transparent;cursor:pointer;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:4px;}
.subtask-item:hover .subtask-del{color:${t.inkMuted};}
.subtask-del:hover{background:${t.redDim}!important;color:${t.red}!important;}
.subtask-add{display:flex;gap:6px;margin-top:5px;padding-left:28px;}
.subtask-add-input{flex:1;background:${t.bg2};border:1px dashed ${t.border2};color:${t.ink};font-family:'DM Sans',sans-serif;font-size:12px;padding:5px 10px;outline:none;border-radius:7px;transition:all 0.18s;}
.subtask-add-input:focus{border-color:${t.accent};border-style:solid;box-shadow:0 0 0 2px ${t.accentDim};}
.subtask-add-input::placeholder{color:${t.inkFaint};}
.subtask-add-btn{background:${t.accentDim};border:1px solid ${t.accentDim2};color:${t.accent};cursor:pointer;width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
.subtask-add-btn:hover{background:${t.accentDim2};}
.subtask-toggle{background:none;border:none;color:${t.inkMuted};cursor:pointer;font-size:11px;display:flex;align-items:center;gap:4px;padding:2px 0;font-family:'DM Sans',sans-serif;font-weight:500;transition:color 0.15s;}
.subtask-toggle:hover{color:${t.ink};}

/* Empty */
.empty{text-align:center;padding:52px 20px;background:${t.surface};border:1px dashed ${t.border2};border-radius:16px;}
.empty-icon{width:44px;height:44px;border-radius:12px;background:${t.surface2};border:1px solid ${t.border2};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:${t.inkMuted};}
.empty-title{font-family:'Instrument Serif',serif;font-size:18px;color:${t.inkMid};margin-bottom:6px;}
.empty-sub{font-size:12.5px;color:${t.inkMuted};}

/* Projects */
.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:18px;}
@media(max-width:500px){.projects-grid{grid-template-columns:1fr 1fr;gap:8px;}}
.project-card{background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:16px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
.project-card:hover{border-color:${t.border2};box-shadow:0 6px 22px rgba(0,0,0,0.2);transform:translateY(-2px);}
.project-card.selected{border-color:${t.accent};background:${t.accentDim3};}
.project-card-name{font-family:'Instrument Serif',serif;font-size:16px;color:${t.ink};margin-bottom:3px;}
.project-card-count{font-size:11px;color:${t.inkMuted};margin-bottom:12px;}
.proj-bar-track{height:2.5px;background:${t.border2};border-radius:2px;overflow:hidden;}
.proj-bar-fill{height:100%;background:linear-gradient(90deg,${t.accent},${t.accent2});border-radius:2px;transition:width 0.6s ease;}

/* Spinner */
.spinner{width:20px;height:20px;border:2px solid ${t.border2};border-top-color:${t.accent};border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}
@keyframes spin{to{transform:rotate(360deg);}}

/* Topbar toast */
.topbar-toast{position:fixed;top:68px;right:20px;z-index:100;pointer-events:none;min-width:220px;}
@media(max-width:600px){.topbar-toast{right:12px;left:12px;top:64px;}}
.mobile-logo{display:none;font-family:'Instrument Serif',serif;font-size:16px;color:${t.ink};align-items:center;gap:6px;}
.mobile-logo-dot{width:5px;height:5px;border-radius:50%;background:${t.accent};}
@media(max-width:900px){.mobile-logo{display:flex;}}

/* ── NEW: Bulk action bar ── */
.bulk-bar{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;
  background:${t.surface};border:1px solid ${t.border2};border-radius:16px;
  padding:12px 18px;display:flex;align-items:center;gap:10px;
  box-shadow:0 12px 48px rgba(0,0,0,0.5),0 0 0 1px ${t.accentDim2};
  white-space:nowrap;flex-wrap:wrap;justify-content:center;}
@media(max-width:600px){.bulk-bar{left:12px;right:12px;transform:none;bottom:16px;}}
.bulk-count{font-size:12px;font-weight:700;color:${t.ink};background:${t.accentDim};border:1px solid ${t.accentDim2};padding:3px 10px;border-radius:20px;font-family:'Geist Mono',monospace;}
.bulk-btn{background:${t.surface2};border:1px solid ${t.border2};color:${t.inkMid};font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;padding:7px 14px;border-radius:9px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:6px;}
.bulk-btn:hover{border-color:${t.border3};color:${t.ink};}
.bulk-btn.complete{background:${t.greenDim};border-color:rgba(93,184,138,0.25);color:${t.green};}
.bulk-btn.complete:hover{background:rgba(93,184,138,0.2);}
.bulk-btn.delete{background:${t.redDim};border-color:rgba(224,112,112,0.22);color:${t.red};}
.bulk-btn.delete:hover{background:rgba(224,112,112,0.2);}
.bulk-sep{width:1px;height:20px;background:${t.border2};}

/* ── NEW: Accent picker ── */
.accent-picker-wrap{position:relative;}
.accent-picker-popover{position:absolute;top:calc(100% + 8px);right:0;z-index:100;
  background:${t.surface};border:1px solid ${t.border2};border-radius:14px;
  padding:14px;box-shadow:0 16px 48px rgba(0,0,0,0.4);min-width:200px;}
.accent-swatches{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px;}
.accent-swatch{width:32px;height:32px;border-radius:8px;cursor:pointer;border:2px solid transparent;transition:all 0.15s;position:relative;}
.accent-swatch:hover{transform:scale(1.12);}
.accent-swatch.active::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;}
.accent-custom-row{display:flex;align-items:center;gap:8px;}
.accent-custom-label{font-size:11px;color:${t.inkMuted};font-weight:600;letter-spacing:0.04em;}
.accent-color-input{width:36px;height:28px;border-radius:7px;border:1px solid ${t.border2};overflow:hidden;cursor:pointer;}

/* Cmd+K Palette */
.palette-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding-top:15vh;}
.palette-box{width:100%;max-width:540px;background:${t.surface};border:1px solid ${t.border2};border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,0.6);overflow:hidden;}
@media(max-width:600px){.palette-box{max-width:calc(100vw - 24px);margin:0 12px;}}
.palette-input-wrap{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid ${t.border};}
.palette-input{flex:1;background:none;border:none;color:${t.ink};font-family:'DM Sans',sans-serif;font-size:15px;outline:none;}
.palette-input::placeholder{color:${t.inkMuted};}
.palette-esc{font-size:10px;background:${t.surface3};border:1px solid ${t.border2};color:${t.inkMuted};padding:2px 7px;border-radius:5px;font-family:'Geist Mono',monospace;flex-shrink:0;}
.palette-section{padding:8px 8px 4px;font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:${t.inkMuted};font-weight:700;}
.palette-item{display:flex;align-items:center;gap:11px;padding:10px 14px;cursor:pointer;border-radius:10px;margin:2px 6px;transition:all 0.12s;}
.palette-item:hover,.palette-item.selected{background:${t.accentDim2};color:${t.accent};}
.palette-item-icon{width:30px;height:30px;border-radius:9px;background:${t.surface2};border:1px solid ${t.border};display:flex;align-items:center;justify-content:center;color:${t.inkMid};flex-shrink:0;}
.palette-item:hover .palette-item-icon,.palette-item.selected .palette-item-icon{background:${t.accentDim};border-color:${t.accentDim2};color:${t.accent};}
.palette-item-label{font-size:13.5px;color:${t.ink};font-weight:500;}
.palette-item-sub{font-size:11px;color:${t.inkMuted};margin-top:1px;}
.palette-item:hover .palette-item-label,.palette-item.selected .palette-item-label{color:${t.accent};}
.palette-empty{padding:24px;text-align:center;color:${t.inkMuted};font-size:13px;}
.palette-footer{padding:10px 16px;border-top:1px solid ${t.border};display:flex;gap:14px;flex-wrap:wrap;}
.palette-hint{font-size:10px;color:${t.inkMuted};display:flex;align-items:center;gap:5px;}
.palette-hint kbd{background:${t.surface3};border:1px solid ${t.border2};border-radius:4px;padding:1px 5px;font-family:'Geist Mono',monospace;font-size:9px;}

/* Kanban */
.kanban-board{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start;}
@media(max-width:900px){.kanban-board{grid-template-columns:1fr 1fr;}}
@media(max-width:600px){.kanban-board{grid-template-columns:1fr;}}
.kanban-col{background:${t.surface};border:1px solid ${t.border};border-radius:14px;overflow:hidden;}
.kanban-col-header{padding:14px 16px;border-bottom:1px solid ${t.border};display:flex;align-items:center;justify-content:space-between;}
.kanban-col-title{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${t.inkMuted};}
.kanban-col-count{font-size:10px;font-family:'Geist Mono',monospace;background:${t.surface2};border:1px solid ${t.border};color:${t.inkMid};padding:1px 8px;border-radius:10px;}
.kanban-col-body{padding:10px;display:flex;flex-direction:column;gap:8px;min-height:120px;}
.kanban-card{background:${t.surface2};border:1px solid ${t.border2};border-radius:10px;padding:12px 14px;cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden;}
.kanban-card:hover{border-color:${t.accent};box-shadow:0 4px 16px rgba(0,0,0,0.2);transform:translateY(-1px);}
.kanban-card-title{font-size:13px;color:${t.ink};font-weight:500;margin-bottom:6px;line-height:1.3;}
.kanban-card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}

/* Analytics */
.analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
@media(max-width:700px){.analytics-grid{grid-template-columns:1fr;}}
.analytics-card{background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:18px 20px;}
.analytics-card-title{font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${t.inkMuted};margin-bottom:14px;}
.heatmap-wrap{display:flex;flex-direction:column;gap:4px;}
.heatmap-row{display:flex;gap:3px;align-items:center;}
.heatmap-label{font-size:9px;color:${t.inkMuted};font-family:'Geist Mono',monospace;width:22px;text-align:right;flex-shrink:0;}
.heatmap-cells{display:flex;gap:3px;}
.heatmap-cell{width:14px;height:14px;border-radius:3px;transition:transform 0.15s;}
.heatmap-cell:hover{transform:scale(1.3);}

/* Badge popup */
.badge-popup{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:300;background:${t.surface};border:1px solid ${t.accentDim2};border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 48px rgba(0,0,0,0.5);}
.badge-emoji{font-size:28px;}
.badge-title{font-size:13px;font-weight:700;color:${t.ink};}
.badge-sub{font-size:11px;color:${t.inkMuted};}
.badges-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:18px;}
.badge-card{background:${t.surface};border:1px solid ${t.border};border-radius:12px;padding:16px;text-align:center;transition:all 0.2s;}
.badge-card.earned{border-color:${t.accentDim2};background:${t.accentDim3};}
.badge-card:hover{transform:translateY(-2px);}
.badge-card-emoji{font-size:26px;margin-bottom:8px;}
.badge-card-label{font-size:12px;font-weight:700;color:${t.ink};margin-bottom:3px;}
.badge-card-desc{font-size:10.5px;color:${t.inkMuted};}
.badge-card.locked .badge-card-emoji{filter:grayscale(1);opacity:0.4;}
.badge-card.locked .badge-card-label{color:${t.inkMuted};}
`}</style>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function timeAgo(d) {
  if (!d) return "";
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if (m<1) return "now"; if (m<60) return `${m}m`;
  const h = Math.floor(m/60); if (h<24) return `${h}h`;
  return `${Math.floor(h/24)}d`;
}
function isDueOverdue(due) { return due && new Date(due) < new Date(); }
function formatDue(due) {
  if (!due) return null;
  return new Date(due).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}
const PROJECTS = ["Personal","Work","Study","Health","Other"];
const ACCENT_PRESETS = ["#e8956a","#7c6ee8","#5db88a","#e07070","#d4943a","#4fb6d4","#c26ee8","#e8a87c"];

const fadeUp  = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.4,ease:[0.22,1,0.36,1]}} };
const fadeIn  = { hidden:{opacity:0},      show:{opacity:1,transition:{duration:0.3}} };
const scaleIn = { hidden:{opacity:0,scale:0.96}, show:{opacity:1,scale:1,transition:{duration:0.32,ease:[0.22,1,0.36,1]}} };
const stagger = { show:{transition:{staggerChildren:0.055}} };

function Reveal({ children, delay=0 }) {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-40px"});
  return (
    <motion.div ref={ref} initial="hidden" animate={inView?"show":"hidden"} variants={fadeUp} transition={{delay}} style={{width:"100%"}}>
      {children}
    </motion.div>
  );
}
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <motion.div className={`toast ${type}`} initial={{opacity:0,y:-8,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}}>
      <div className="toast-dot"/>{msg}
    </motion.div>
  );
}
function CircularProgress({ pct, size=60, stroke=4, t }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, offset=circ*(1-pct/100);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.border2} strokeWidth={stroke}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.accent} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:offset}}
        transition={{duration:1.2,ease:[0.22,1,0.36,1]}}/>
    </svg>
  );
}
function Sparkline({ data, color, height=26 }) {
  if (!data||data.length<2) return null;
  const max=Math.max(...data,1),w=56;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${height-(v/max)*height}`).join(" ");
  return (<svg width={w} height={height} style={{overflow:"visible"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/></svg>);
}

// ─── NEW: Accent Color Picker ─────────────────────────────────────────────
function AccentPicker({ accentHex, setAccentHex, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="accent-picker-wrap" ref={ref}>
      <motion.button className="icon-btn" onClick={() => setOpen(o => !o)}
        whileTap={{scale:0.95}} title="Accent color"
        style={{ borderColor: open ? t.accent : undefined, color: open ? t.accent : undefined }}>
        <IconPalette />
        <span style={{ width:12, height:12, borderRadius:3, background:accentHex, display:"inline-block", flexShrink:0, border:`1px solid rgba(255,255,255,0.2)` }} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div className="accent-picker-popover"
            initial={{opacity:0,y:-8,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-8,scale:0.97}} transition={{duration:0.18,ease:[0.22,1,0.36,1]}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:t.inkMuted,marginBottom:10}}>Accent Color</div>
            <div className="accent-swatches">
              {ACCENT_PRESETS.map(hex => (
                <motion.button key={hex} className={`accent-swatch ${accentHex===hex?"active":""}`}
                  style={{ background:hex, borderColor: accentHex===hex ? "rgba(255,255,255,0.5)" : "transparent" }}
                  onClick={() => { setAccentHex(hex); }}
                  whileHover={{scale:1.14}} whileTap={{scale:0.95}} />
              ))}
            </div>
            <div className="accent-custom-row">
              <span className="accent-custom-label">Custom</span>
              <div className="accent-color-input" style={{background:accentHex}}>
                <input type="color" value={accentHex} onChange={e => setAccentHex(e.target.value)}
                  style={{width:"100%",height:"100%",opacity:0,cursor:"pointer"}} />
              </div>
              <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:t.inkMuted}}>{accentHex}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NEW: Bulk Action Bar ─────────────────────────────────────────────────
function BulkBar({ selected, onComplete, onDelete, onClear, t }) {
  const count = selected.size;
  if (count === 0) return null;
  return (
    <AnimatePresence>
      <motion.div className="bulk-bar"
        initial={{opacity:0,y:32,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
        exit={{opacity:0,y:24,scale:0.96}} transition={{type:"spring",stiffness:420,damping:32}}>
        <span className="bulk-count">{count} selected</span>
        <div className="bulk-sep"/>
        <button className="bulk-btn complete" onClick={onComplete}>
          <IconCheck /> Mark done
        </button>
        <button className="bulk-btn delete" onClick={onDelete}>
          <IconTrash /> Delete
        </button>
        <div className="bulk-sep"/>
        <button className="bulk-btn" onClick={onClear} style={{fontSize:11}}>
          Clear
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Cmd+K Palette ────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, tasks, setPage, setSearch, t }) {
  const [query, setQuery] = useState("");
  const [sel, setSel]     = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if(open){setQuery("");setSel(0);setTimeout(()=>inputRef.current?.focus(),80);} },[open]);
  const navItems = [
    {icon:<IconTasks />,    label:"My Tasks",    sub:"Go to all tasks",      action:()=>{setPage("tasks");onClose();}},
    {icon:<IconToday />,    label:"Today",       sub:"View today's tasks",   action:()=>{setPage("today");onClose();}},
    {icon:<IconPriority />, label:"Priority",    sub:"High priority tasks",  action:()=>{setPage("priority");onClose();}},
    {icon:<IconProjects />, label:"Projects",    sub:"Browse projects",      action:()=>{setPage("projects");onClose();}},
    {icon:<IconKanban />,   label:"Kanban View", sub:"Switch to board view", action:()=>{setPage("kanban");onClose();}},
    {icon:<IconChart />,    label:"Analytics",   sub:"Productivity stats",   action:()=>{setPage("analytics");onClose();}},
    {icon:<IconTrophy />,   label:"Badges",      sub:"View achievements",    action:()=>{setPage("badges");onClose();}},
  ];
  const taskItems = tasks.filter(tk=>tk.title.toLowerCase().includes(query.toLowerCase())).slice(0,5).map(tk=>({
    icon:<IconTasks />, label:tk.title, sub:tk.project||"Task",
    action:()=>{setSearch(tk.title);setPage("tasks");onClose();}
  }));
  const filtered = query ? [...navItems.filter(i=>i.label.toLowerCase().includes(query.toLowerCase())),...taskItems] : navItems;
  useEffect(()=>setSel(0),[query]);
  const handleKey = e => {
    if(e.key==="ArrowDown"){e.preventDefault();setSel(s=>Math.min(s+1,filtered.length-1));}
    if(e.key==="ArrowUp"){e.preventDefault();setSel(s=>Math.max(s-1,0));}
    if(e.key==="Enter"&&filtered[sel])filtered[sel].action();
    if(e.key==="Escape")onClose();
  };
  return (
    <AnimatePresence>
      {open&&(
        <motion.div className="palette-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
          <motion.div className="palette-box" initial={{opacity:0,y:-20,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-10,scale:0.97}} transition={{duration:0.22,ease:[0.22,1,0.36,1]}} onClick={e=>e.stopPropagation()}>
            <div className="palette-input-wrap">
              <IconSearch/>
              <input ref={inputRef} className="palette-input" placeholder="Search or jump to…"
                value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKey}/>
              <span className="palette-esc">ESC</span>
            </div>
            <div style={{maxHeight:360,overflowY:"auto",padding:"6px 0"}}>
              {filtered.length===0?<div className="palette-empty">No results found</div>:<>
                {!query&&<div className="palette-section">Navigation</div>}
                {filtered.map((item,i)=>(
                  <div key={i} className={`palette-item ${i===sel?"selected":""}`}
                    onMouseEnter={()=>setSel(i)} onClick={item.action}>
                    <div className="palette-item-icon">{item.icon}</div>
                    <div><div className="palette-item-label">{item.label}</div><div className="palette-item-sub">{item.sub}</div></div>
                  </div>
                ))}
              </>}
            </div>
            <div className="palette-footer">
              <span className="palette-hint"><kbd>↑↓</kbd> Navigate</span>
              <span className="palette-hint"><kbd>↵</kbd> Select</span>
              <span className="palette-hint"><kbd>ESC</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Kanban Board ──────────────────────────────────────────────────────────
function KanbanBoard({ tasks, done, onToggle, t }) {
  return (
    <div className="kanban-board">
      {[
        {label:"To Do",       dotColor:t.inkMuted, list:tasks.filter(tk=>!done[tk._id]&&(!tk.priority||tk.priority==="none"))},
        {label:"In Progress", dotColor:t.amber,    list:tasks.filter(tk=>!done[tk._id]&&tk.priority&&tk.priority!=="none")},
        {label:"Done",        dotColor:t.green,    list:tasks.filter(tk=>done[tk._id])},
      ].map(col=>(
        <motion.div key={col.label} className="kanban-col" variants={scaleIn} initial="hidden" animate="show">
          <div className="kanban-col-header">
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:col.dotColor}}/>
              <span className="kanban-col-title">{col.label}</span>
            </div>
            <span className="kanban-col-count">{col.list.length}</span>
          </div>
          <div className="kanban-col-body">
            <AnimatePresence>
              {col.list.length===0
                ?<div style={{textAlign:"center",color:t.inkFaint,fontSize:12,padding:"20px 0"}}>Empty</div>
                :col.list.map((tk,i)=>(
                  <motion.div key={tk._id} className="kanban-card"
                    initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                    exit={{opacity:0,scale:0.95}} transition={{delay:i*0.04}}
                    whileHover={{scale:1.02}}>
                    <div className="kanban-card-title">{tk.title}</div>
                    <div className="kanban-card-meta">
                      {tk.project&&<span style={{fontSize:10,color:t.accent,background:t.accentDim3,border:`1px solid ${t.accentDim}`,padding:"1px 7px",borderRadius:5,fontWeight:700}}>{tk.project}</span>}
                      {tk.priority&&tk.priority!=="none"&&(<span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:tk.priority==="high"?t.red:tk.priority==="medium"?t.amber:t.green,background:tk.priority==="high"?t.redDim:tk.priority==="medium"?t.amberDim:t.greenDim,padding:"1px 6px",borderRadius:4}}>{tk.priority}</span>)}
                    </div>
                    <motion.button onClick={()=>onToggle(tk._id)}
                      style={{marginTop:8,background:col.label==="Done"?t.greenDim:t.accentDim,border:`1px solid ${col.label==="Done"?t.green:t.accentDim2}`,color:col.label==="Done"?t.green:t.accent,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"DM Sans,sans-serif",display:"flex",alignItems:"center",gap:5}}
                      whileTap={{scale:0.96}}>
                      {col.label==="Done"?"↩ Undo":"✓ Complete"}
                    </motion.button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────
function AnalyticsPage({ tasks, done, t }) {
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], weeks=8;
  const heatmap = useMemo(()=>{
    const now=new Date(), grid=[];
    for(let w=weeks-1;w>=0;w--){
      const row=[];
      for(let d=0;d<7;d++){
        const date=new Date(now); date.setDate(date.getDate()-(w*7+(6-d)));
        const ds=date.toISOString().split("T")[0];
        const count=tasks.filter(tk=>tk.createdAt?.startsWith(ds)).length;
        row.push({date:ds,count});
      }
      grid.push(row);
    }
    return grid;
  },[tasks,done]);
  const getHeatColor=n=>n===0?t.surface3:n===1?t.accentDim2:n===2?t.accent+"88":t.accent;
  const prioCounts={ high:tasks.filter(tk=>tk.priority==="high").length, medium:tasks.filter(tk=>tk.priority==="medium").length, low:tasks.filter(tk=>tk.priority==="low").length, none:tasks.filter(tk=>!tk.priority||tk.priority==="none").length };
  const completedCount=Object.values(done).filter(Boolean).length, total=tasks.length;
  const projectData=PROJECTS.map(p=>({name:p,total:tasks.filter(tk=>tk.project===p).length,done:tasks.filter(tk=>tk.project===p&&done[tk._id]).length})).filter(p=>p.total>0);
  return (
    <div>
      <div className="analytics-grid">
        <div className="analytics-card" style={{gridColumn:"1/-1"}}>
          <div className="analytics-card-title">Activity Heatmap — Last 8 Weeks</div>
          <div style={{overflowX:"auto"}}>
            <div className="heatmap-wrap">
              {days.map((day,di)=>(
                <div key={day} className="heatmap-row">
                  <span className="heatmap-label">{di%2===0?day:""}</span>
                  <div className="heatmap-cells">
                    {heatmap.map((week,wi)=>(
                      <div key={wi} className="heatmap-cell" title={`${week[di]?.date}: ${week[di]?.count}`}
                        style={{background:getHeatColor(week[di]?.count||0)}}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,paddingLeft:26}}>
              <span style={{fontSize:10,color:t.inkMuted}}>Less</span>
              {[0,1,2,3].map(v=><div key={v} style={{width:12,height:12,borderRadius:3,background:getHeatColor(v)}}/>)}
              <span style={{fontSize:10,color:t.inkMuted}}>More</span>
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Priority Breakdown</div>
          {[{label:"High",count:prioCounts.high,color:t.red},{label:"Medium",count:prioCounts.medium,color:t.amber},{label:"Low",count:prioCounts.low,color:t.green},{label:"None",count:prioCounts.none,color:t.inkMuted}].map(item=>(
            <div key={item.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:11,color:item.color,width:44,fontWeight:600}}>{item.label}</span>
              <div style={{flex:1,height:6,background:t.border2,borderRadius:4,overflow:"hidden"}}>
                <motion.div initial={{width:0}} animate={{width:total?`${(item.count/total)*100}%`:"0%"}}
                  transition={{duration:0.9,ease:[0.22,1,0.36,1]}} style={{height:"100%",background:item.color,borderRadius:4}}/>
              </div>
              <span style={{fontSize:11,color:t.inkMuted,fontFamily:"'Geist Mono',monospace",width:18,textAlign:"right"}}>{item.count}</span>
            </div>
          ))}
        </div>
        <div className="analytics-card" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
          <div className="analytics-card-title">Completion</div>
          <CircularProgress pct={total?Math.round((completedCount/total)*100):0} size={90} stroke={6} t={t}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Geist Mono',monospace",fontSize:24,fontWeight:600,color:t.ink}}>{completedCount}<span style={{fontSize:14,color:t.inkMuted}}>/{total}</span></div>
            <div style={{fontSize:11,color:t.inkMuted,marginTop:3}}>tasks completed</div>
          </div>
        </div>
        {projectData.length>0&&(
          <div className="analytics-card" style={{gridColumn:"1/-1"}}>
            <div className="analytics-card-title">By Project</div>
            {projectData.map(p=>(
              <div key={p.name} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:t.ink,fontWeight:500}}>{p.name}</span>
                  <span style={{fontSize:11,color:t.inkMuted,fontFamily:"'Geist Mono',monospace"}}>{p.done}/{p.total}</span>
                </div>
                <div style={{height:5,background:t.border2,borderRadius:4,overflow:"hidden"}}>
                  <motion.div initial={{width:0}} animate={{width:`${Math.round((p.done/p.total)*100)}%`}}
                    transition={{duration:0.9,ease:[0.22,1,0.36,1]}} style={{height:"100%",background:`linear-gradient(90deg,${t.accent},${t.accent2})`,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badges Page ───────────────────────────────────────────────────────────
function BadgesPage({ badges, xp, streak, level, xpToNext, t }) {
  return (
    <div>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:"20px 22px",marginBottom:18,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${t.accentDim3},transparent 60%)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Geist Mono',monospace",fontSize:36,fontWeight:600,color:t.accent,lineHeight:1}}>Lv.{level}</div>
            <div style={{fontSize:11,color:t.inkMuted,marginTop:4}}>Level</div>
          </div>
          <div style={{flex:1,minWidth:180}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <span style={{fontSize:11,fontWeight:600,color:t.inkMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>XP Progress</span>
              <span style={{fontFamily:"'Geist Mono',monospace",fontSize:13,color:t.accent}}>{xp} XP</span>
            </div>
            <div style={{height:6,background:t.border2,borderRadius:4,overflow:"hidden"}}>
              <motion.div initial={{width:0}} animate={{width:`${((xp%50)/50)*100}%`}} transition={{duration:1,ease:[0.22,1,0.36,1]}} style={{height:"100%",background:`linear-gradient(90deg,${t.accent},${t.accent2})`,borderRadius:4}}/>
            </div>
            <div style={{fontSize:10.5,color:t.inkMuted,marginTop:5}}>{xpToNext} XP to next level</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28}}>🔥</div>
            <div style={{fontFamily:"'Geist Mono',monospace",fontSize:20,fontWeight:700,color:t.amber}}>{streak}</div>
            <div style={{fontSize:10,color:t.inkMuted}}>day streak</div>
          </div>
        </div>
      </div>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:t.inkMuted,marginBottom:12}}>Achievements</div>
      <div className="badges-grid">
        {BADGES.map(b=>{
          const earned=badges.includes(b.id);
          return (<motion.div key={b.id} className={`badge-card ${earned?"earned":"locked"}`} whileHover={{scale:1.04}} transition={{duration:0.18}}>
            <div className="badge-card-emoji">{b.icon}</div>
            <div className="badge-card-label">{b.label}</div>
            <div className="badge-card-desc">{b.desc}</div>
            {earned&&<div style={{fontSize:10,color:t.green,fontWeight:700,marginTop:5}}>✓ Earned</div>}
          </motion.div>);
        })}
      </div>
    </div>
  );
}

// ─── Subtask Section ───────────────────────────────────────────────────────
function SubtaskSection({ taskId, t }) {
  const sk=`fm_sub_${taskId}`;
  const [subtasks,setSubtasks]=useState(()=>JSON.parse(localStorage.getItem(sk)||"[]"));
  const [newSub,setNewSub]=useState(""),  [expanded,setExpanded]=useState(false);
  const save=next=>{setSubtasks(next);localStorage.setItem(sk,JSON.stringify(next));};
  const addSub=()=>{if(!newSub.trim())return;save([...subtasks,{id:Date.now(),text:newSub.trim(),done:false}]);setNewSub("");};
  const doneCount=subtasks.filter(s=>s.done).length;
  return (
    <div style={{marginTop:6}}>
      <button className="subtask-toggle" onClick={()=>setExpanded(e=>!e)}>
        <IconChevron open={expanded}/><IconSub/>
        Subtasks {subtasks.length>0&&<span style={{fontFamily:"'Geist Mono',monospace",fontSize:10}}>{doneCount}/{subtasks.length}</span>}
      </button>
      <AnimatePresence>
        {expanded&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.22}} style={{overflow:"hidden"}}>
            {subtasks.length>0&&<div className="subtask-list">
              {subtasks.map(s=>(
                <div key={s.id} className="subtask-item">
                  <button className={`subtask-check ${s.done?"checked":""}`} onClick={()=>save(subtasks.map(x=>x.id===s.id?{...x,done:!x.done}:x))}>
                    {s.done&&<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <span className={`subtask-text ${s.done?"done":""}`}>{s.text}</span>
                  <button className="subtask-del" onClick={()=>save(subtasks.filter(x=>x.id!==s.id))}><IconTrash/></button>
                </div>
              ))}
            </div>}
            <div className="subtask-add">
              <input className="subtask-add-input" placeholder="Add subtask…" value={newSub}
                onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()}/>
              <button className="subtask-add-btn" onClick={addSub}><IconPlus/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NEW: Sortable Task Item (wraps dnd-kit) ──────────────────────────────
function SortableTaskItem({ task, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem task={task} {...props} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

// ─── Task Item ────────────────────────────────────────────────────────────
function TaskItem({ task, onDelete, onToggle, onEdit, done, delay, t, viewMode="comfortable",
                    selected=false, onSelect, bulkMode=false, dragListeners={}, dragAttributes={} }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.title);
  const isCompact = viewMode === "compact";
  const saveEdit = () => {
    if (editVal.trim() && editVal !== task.title) onEdit(task._id, editVal.trim());
    setEditing(false);
  };
  return (
    <motion.div
      className={`task-item ${done?"done":""} ${isCompact?"compact":""} ${selected?"selected-task":""}`}
      layout
      initial={{ opacity:0, x:-12 }}
      animate={{ opacity: done ? 0.38 : 1, x:0 }}
      exit={{ opacity:0, x:12, height:0, marginBottom:0, padding:0 }}
      transition={{ duration:0.28, delay, ease:[0.22,1,0.36,1] }}
      whileHover={{ scale:1.001 }}>

      {/* Drag handle */}
      <div className="drag-handle" {...dragListeners} {...dragAttributes} title="Drag to reorder">
        <IconGrip />
      </div>

      {/* Bulk select OR completion check */}
      {bulkMode ? (
        <button className={`task-select-check ${selected?"selected":""}`} onClick={() => onSelect(task._id)}>
          {selected && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      ) : (
        <motion.button className={`task-check ${done?"checked":""}`} onClick={() => onToggle(task._id)} whileTap={{scale:0.82}}>
          {done && <IconCheck />}
        </motion.button>
      )}

      <div className="task-body">
        <div className="task-title-row">
          {editing
            ? <input className="task-edit-input" value={editVal} onChange={e=>setEditVal(e.target.value)}
                onBlur={saveEdit} onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")setEditing(false);}} autoFocus/>
            : <span className="task-text">{task.title}</span>}
          {task.priority && task.priority !== "none" && (
            <span className={`p-badge p-${task.priority}`}>
              <span className="p-dot" style={{background:task.priority==="high"?"#e07070":task.priority==="medium"?"#d4943a":"#5db88a"}}/>
              {task.priority}
            </span>
          )}
        </div>
        {!isCompact && <div className="task-meta">
          {task.project&&<span className="task-project">{task.project}</span>}
          {task.dueDate&&<span className={`task-due ${isDueOverdue(task.dueDate)&&!done?"overdue":""}`}><IconCal/> {formatDue(task.dueDate)}{isDueOverdue(task.dueDate)&&!done&&" · overdue"}</span>}
        </div>}
        {isCompact && (task.project || task.dueDate) && (
          <div className="task-meta" style={{marginTop:1}}>
            {task.project&&<span className="task-project">{task.project}</span>}
            {task.dueDate&&<span className={`task-due ${isDueOverdue(task.dueDate)&&!done?"overdue":""}`} style={{fontSize:9.5}}><IconCal/> {formatDue(task.dueDate)}</span>}
          </div>
        )}
        {!isCompact && <SubtaskSection taskId={task._id} t={t}/>}
      </div>
      <span className="task-age">{timeAgo(task.createdAt)}</span>
      <div className="task-actions">
        <button className={`task-action ${editing?"active":""}`} onClick={()=>setEditing(e=>!e)}><IconEdit/></button>
        <button className="task-action del" onClick={()=>onDelete(task._id)}><IconTrash/></button>
      </div>
    </motion.div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────
function AuthPage({ mode, onLogin, onSwitch, t }) {
  const [email,setEmail]=useState(""), [password,setPassword]=useState(""), [loading,setLoading]=useState(false), [toast,setToast]=useState(null);
  const isLogin=mode==="login";
  const showToast=(msg,type="error")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const handle=async()=>{
    if(!email||!password) return showToast("Please fill in all fields.");
    if(!isLogin&&password.length<6) return showToast("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if(isLogin){const res=await axios.post(`${API}/api/auth/login`,{email,password});onLogin(res.data.token,email);}
      else{await axios.post(`${API}/api/auth/register`,{email,password});showToast("Account created — signing you in.","success");setTimeout(async()=>{const res=await axios.post(`${API}/api/auth/login`,{email,password});onLogin(res.data.token,email);},900);}
    }catch(err){showToast(err.response?.data?.message||(isLogin?"Login failed.":"Registration failed."));}
    setLoading(false);
  };
  return (
    <div className="auth-root">
      <div className="auth-grid-overlay"/>
      <FloatingShapes accent={t.accent}/>
      <div className="auth-inner">
        <motion.div className="auth-brand-col" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}>
          <div className="brand-wordmark"><div className="brand-wordmark-dot"/>FlowMind</div>
          <div>
            <div className="brand-headline">{isLogin?<>Where focus<br/>meets <em>clarity.</em></>:<>Your work,<br/><em>elevated.</em></>}</div>
            <div className="brand-desc">{isLogin?"Sign back in and continue where you left off.":"Create your account and build a workspace that works."}</div>
          </div>
          <div className="brand-features">
            {[{icon:"✦",text:"Priority task management"},{icon:"◈",text:"Project organisation"},{icon:"⟳",text:"Due date tracking"},{icon:"◉",text:"Real-time analytics"}].map(f=>(
              <div key={f.text} className="brand-feature"><div className="brand-feature-icon">{f.icon}</div>{f.text}</div>
            ))}
          </div>
        </motion.div>
        <div className="auth-form-col">
          <AnimatePresence mode="wait">
            <motion.div key={mode} className="auth-box" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.4,ease:[0.22,1,0.36,1]}}>
              <div className="auth-eyebrow">{isLogin?"Sign in":"Get started"}</div>
              <div className="auth-title">{isLogin?"Welcome back":"Create account"}</div>
              <div className="auth-sub">{isLogin?"Enter your credentials to continue.":"Free to use. No credit card required."}</div>
              <AnimatePresence>{toast&&<Toast msg={toast.msg} type={toast.type}/>}</AnimatePresence>
              <div className="field-wrap"><label className="field-label">Email</label><input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
              <div className="field-wrap"><label className="field-label">Password</label><input className="field-input" type="password" placeholder={isLogin?"••••••••":"Min. 6 characters"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
              <motion.button className="auth-btn" onClick={handle} disabled={loading} whileTap={{scale:0.98}}>
                {loading?(isLogin?"Signing in…":"Creating…"):(isLogin?"Sign in":"Create account")}
              </motion.button>
              <div className="auth-divider"><div className="auth-divider-line"/><span className="auth-divider-text">or</span><div className="auth-divider-line"/></div>
              <div className="auth-switch">{isLogin?"Don't have an account? ":"Already have an account? "}<button onClick={onSwitch}>{isLogin?"Create one":"Sign in"}</button></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────
function Dashboard({ token, email, onLogout, theme, setTheme, t, accentHex, setAccentHex }) {
  const [tasks,setTasks]         = useState([]);
  const [taskOrder,setTaskOrder] = useState([]); // NEW: local drag-order IDs
  const [taskInput,setTaskInput] = useState("");
  const [priority,setPriority]   = useState("none");
  const [project,setProject]     = useState("");
  const [dueDate,setDueDate]     = useState("");
  const [loading,setLoading]     = useState(false);
  const [adding,setAdding]       = useState(false);
  const [done,setDone]           = useState({});
  const [filter,setFilter]       = useState("all");
  const [page,setPage]           = useState("tasks");
  const [search,setSearch]       = useState("");
  const [selectedProject,setSelectedProject] = useState(null);
  const [toast,setToast]         = useState(null);
  const [paletteOpen,setPaletteOpen] = useState(false);
  const [viewMode,setViewMode]   = useState("comfortable"); // NEW
  const [bulkMode,setBulkMode]   = useState(false);         // NEW
  const [selected,setSelected]   = useState(new Set());     // NEW: selected IDs
  const [activeId,setActiveId]   = useState(null);          // NEW: dnd active
  const { canvasRef, fire:fireConfetti } = useConfetti();

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  const fetchTasks=useCallback(async()=>{
    setLoading(true);
    try{const res=await axios.get(`${API}/api/tasks`,{headers:{authorization:token}});setTasks(res.data);setTaskOrder(res.data.map(t=>t._id));}
    catch(e){console.error(e);}
    setLoading(false);
  },[token]);

  useEffect(()=>{fetchTasks();},[fetchTasks]);

  useEffect(()=>{
    const h=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setPaletteOpen(p=>!p);}
      if(e.key==="Escape"){setPaletteOpen(false);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[]);

  const addTask=async()=>{
    if(!taskInput.trim()) return;
    setAdding(true);
    try{await axios.post(`${API}/api/tasks/add`,{title:taskInput,priority,project,dueDate},{headers:{authorization:token}});setTaskInput("");setPriority("none");setProject("");setDueDate("");fetchTasks();showToast("Task added.");}
    catch(e){showToast(e.response?.data?.message||"Failed to add task.","error");}
    setAdding(false);
  };
  const deleteTask=async id=>{
    try{await axios.delete(`${API}/api/tasks/${id}`,{headers:{authorization:token}});fetchTasks();showToast("Task removed.","error");}catch(e){console.error(e);}
  };
  const editTask=async(id,title)=>{
    try{await axios.put(`${API}/api/tasks/${id}`,{title},{headers:{authorization:token}});fetchTasks();}catch(e){setTasks(prev=>prev.map(tk=>tk._id===id?{...tk,title}:tk));}
    showToast("Task updated.");
  };
  const toggleDone=id=>{
    const wasNotDone=!done[id];
    setDone(prev=>({...prev,[id]:!prev[id]}));
    if(wasNotDone)fireConfetti();
  };

  // ── Bulk actions ──
  const toggleSelect=id=>{
    setSelected(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  };
  const bulkComplete=()=>{
    selected.forEach(id=>{if(!done[id])toggleDone(id);});
    setSelected(new Set());
    setBulkMode(false);
  };
  const bulkDelete=async()=>{
    await Promise.all([...selected].map(id=>deleteTask(id)));
    setSelected(new Set());
    setBulkMode(false);
  };
  const clearSelection=()=>{setSelected(new Set());setBulkMode(false);};

  // ── Drag & Drop ──
  const sensors = useSensors(
    useSensor(PointerSensor,{activationConstraint:{distance:6}}),
    useSensor(TouchSensor,{activationConstraint:{delay:200,tolerance:5}})
  );
  const handleDragStart=e=>setActiveId(e.active.id);
  const handleDragEnd=e=>{
    const {active,over}=e;
    setActiveId(null);
    if(!over||active.id===over.id) return;
    setTaskOrder(prev=>{
      const oldIdx=prev.indexOf(active.id), newIdx=prev.indexOf(over.id);
      return arrayMove(prev,oldIdx,newIdx);
    });
  };

  const completedCount=Object.values(done).filter(Boolean).length;
  const total=tasks.length, pct=total?Math.round((completedCount/total)*100):0;
  const avatarLetter=email?email[0].toUpperCase():"U";
  const todayStr=new Date().toISOString().split("T")[0];
  const hr=new Date().getHours();
  const greeting=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const todayLabel=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const overdueCount=tasks.filter(tk=>isDueOverdue(tk.dueDate)&&!done[tk._id]).length;
  const highPrio=tasks.filter(tk=>tk.priority==="high"&&!done[tk._id]).length;
  const {xp,streak,badges,newBadge,level,xpToNext}=useGamification(completedCount);
  const sparkData=useMemo(()=>{const b=Math.max(1,total);return[0,Math.round(b*0.2),Math.round(b*0.5),Math.round(b*0.4),Math.round(b*0.7),Math.round(b*0.6),completedCount];},[total,completedCount]);

  // Ordered + filtered display tasks
  const displayTasks=useMemo(()=>{
    // Apply order
    const ordered=taskOrder.length>0
      ?taskOrder.map(id=>tasks.find(tk=>tk._id===id)).filter(Boolean)
      :tasks;
    let list=ordered;
    if(page==="today")    list=ordered.filter(tk=>tk.dueDate?.startsWith(todayStr)||tk.createdAt?.startsWith(todayStr));
    if(page==="priority") list=ordered.filter(tk=>tk.priority&&tk.priority!=="none");
    if(page==="projects") list=selectedProject?ordered.filter(tk=>tk.project===selectedProject):ordered;
    if(["kanban","analytics","badges"].includes(page)) list=ordered;
    if(search) list=list.filter(tk=>tk.title.toLowerCase().includes(search.toLowerCase()));
    if(filter==="done")    list=list.filter(tk=>done[tk._id]);
    if(filter==="pending") list=list.filter(tk=>!done[tk._id]);
    return list;
  },[tasks,taskOrder,page,filter,search,selectedProject,done,todayStr]);

  const projectStats=useMemo(()=>PROJECTS.map(p=>({name:p,count:tasks.filter(tk=>tk.project===p).length,done:tasks.filter(tk=>tk.project===p&&done[tk._id]).length})).filter(p=>p.count>0),[tasks,done]);

  const pageTitle={tasks:greeting,today:"Today",priority:"Priority",projects:"Projects",kanban:"Kanban",analytics:"Analytics",badges:"Achievements"}[page]||greeting;
  const navItems=[
    {id:"tasks",    icon:<IconTasks />,    label:"My Tasks",  count:tasks.length},
    {id:"today",    icon:<IconToday />,    label:"Today",     count:tasks.filter(tk=>tk.dueDate?.startsWith(todayStr)).length||null},
    {id:"priority", icon:<IconPriority />, label:"Priority",  count:tasks.filter(tk=>tk.priority==="high").length||null},
    {id:"projects", icon:<IconProjects />, label:"Projects",  count:projectStats.length||null},
    {id:"kanban",   icon:<IconKanban />,   label:"Kanban",    count:null},
    {id:"analytics",icon:<IconChart />,    label:"Analytics", count:null},
    {id:"badges",   icon:<IconTrophy />,   label:"Badges",    count:badges.length||null},
  ];
  const pageTitleMap={tasks:"All Tasks",today:"Today's Tasks",priority:"Priority Tasks",projects:selectedProject||"All Projects",kanban:"Board View",analytics:"Productivity",badges:"Achievements"};
  const isSpecialPage=["kanban","analytics","badges"].includes(page);
  const activeTask=tasks.find(tk=>tk._id===activeId);

  return (
    <div className="dash-root">
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:500,pointerEvents:"none",width:"100%",height:"100%"}}/>
      <MeshBackground t={t}/>
      <MouseSpotlight t={t}/>
      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} tasks={tasks} setPage={setPage} setSearch={setSearch} t={t}/>

      {/* Badge popup */}
      <AnimatePresence>
        {newBadge&&(
          <motion.div className="badge-popup" initial={{opacity:0,y:30,scale:0.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}} transition={{type:"spring",stiffness:400,damping:28}}>
            <span className="badge-emoji">{newBadge.icon}</span>
            <div><div className="badge-title">Badge Unlocked: {newBadge.label}!</div><div className="badge-sub">{newBadge.desc}</div></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk bar */}
      <BulkBar selected={selected} onComplete={bulkComplete} onDelete={bulkDelete} onClear={clearSelection} t={t}/>

      {/* Sidebar */}
      <motion.aside className="sidebar" initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.45,ease:[0.22,1,0.36,1]}} style={{position:"relative",zIndex:10}}>
        <div className="sidebar-logo"><div className="sidebar-logo-dot"/>FlowMind</div>
        {/* XP bar */}
        <div style={{padding:"12px 14px 0"}}>
          <div className="xp-bar-wrap">
            <div className="xp-bar-head"><span className="xp-label">Level {level}</span><span className="xp-val">{xp} XP</span></div>
            <div className="xp-track"><motion.div className="xp-fill" initial={{width:0}} animate={{width:`${((xp%50)/50)*100}%`}} transition={{duration:0.9,ease:[0.22,1,0.36,1]}}/></div>
            <div className="xp-meta"><span className="xp-streak"><IconFlame/> {streak}d</span><span style={{marginLeft:"auto",fontSize:10,color:t.inkMuted}}>{xpToNext} to Lv.{level+1}</span></div>
          </div>
        </div>
        {/* Circular progress */}
        <div style={{padding:"0 14px 4px"}}>
          <div style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
            <CircularProgress pct={pct} t={t} size={52} stroke={4}/>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:t.inkMuted,marginBottom:2}}>Completion</div>
              <div style={{fontFamily:"'Geist Mono',monospace",fontSize:18,fontWeight:600,color:t.ink,lineHeight:1}}>{pct}<span style={{fontSize:11,color:t.inkMuted}}>%</span></div>
              <div style={{fontSize:10,color:t.inkMuted,marginTop:2}}>{completedCount}/{total}</div>
            </div>
          </div>
        </div>
        <div>
          <div className="sidebar-section-label">Workspace</div>
          <ul className="nav-list">
            {navItems.map((n,i)=>(
              <motion.li key={n.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.04*i,duration:0.28}}>
                <button className={`nav-btn ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);setSelectedProject(null);}}>
                  <span className="nav-icon">{n.icon}</span>{n.label}
                  {n.count>0&&<span className="nav-badge">{n.count}</span>}
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
        <div style={{padding:"10px 14px 0"}}>
          <div style={{fontSize:"9.5px",letterSpacing:"0.22em",textTransform:"uppercase",color:t.inkMuted,fontWeight:600,marginBottom:7,paddingLeft:4}}>Quick Glance</div>
          {[{label:"Overdue",val:overdueCount,color:t.red},{label:"High prio",val:highPrio,color:t.amber}].map(item=>(
            <div key={item.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surface2,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 11px",marginBottom:5}}>
              <span style={{fontSize:11.5,color:t.inkMid,fontWeight:500}}>{item.label}</span>
              <span style={{fontFamily:"'Geist Mono',monospace",fontSize:13,fontWeight:700,color:item.val>0?item.color:t.inkMuted}}>{item.val}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-bottom"><button className="logout-btn" onClick={onLogout}><IconLogout/> Sign out</button></div>
      </motion.aside>

      {/* Main */}
      <main className="dash-main" style={{position:"relative",zIndex:5}}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="mobile-logo"><div className="mobile-logo-dot"/>FlowMind</div>
            <h1>{pageTitle}</h1>
            <p>{todayLabel}</p>
          </div>
          <div className="topbar-right">
            <button className="cmd-btn" onClick={()=>setPaletteOpen(true)}><IconCmd/><span style={{display:"flex",alignItems:"center",gap:3}}><span className="cmd-key">⌘</span><span className="cmd-key">K</span></span></button>

            {/* NEW: View toggle */}
            {!isSpecialPage && (
              <div style={{display:"flex",background:t.surface2,border:`1px solid ${t.border2}`,borderRadius:8,padding:3,gap:1}}>
                <motion.button className={`icon-btn ${viewMode==="comfortable"?"active":""}`}
                  onClick={()=>setViewMode("comfortable")} whileTap={{scale:0.93}} title="Comfortable view"
                  style={{border:"none",borderRadius:6,padding:"4px 8px"}}>
                  <IconComfort/>
                </motion.button>
                <motion.button className={`icon-btn ${viewMode==="compact"?"active":""}`}
                  onClick={()=>setViewMode("compact")} whileTap={{scale:0.93}} title="Compact view"
                  style={{border:"none",borderRadius:6,padding:"4px 8px"}}>
                  <IconCompact/>
                </motion.button>
              </div>
            )}

            {/* NEW: Bulk select toggle */}
            {!isSpecialPage && (
              <motion.button className={`icon-btn ${bulkMode?"active":""}`}
                onClick={()=>{setBulkMode(b=>!b);setSelected(new Set());}} whileTap={{scale:0.93}}
                title="Bulk select">
                <IconSelect/><span style={{fontSize:11}}>Select</span>
              </motion.button>
            )}

            {/* NEW: Accent picker */}
            <AccentPicker accentHex={accentHex} setAccentHex={setAccentHex} t={t}/>

            <div className="theme-toggle">
              <button className={`theme-opt ${theme==="warm"?"active":""}`} onClick={()=>setTheme("warm")}><IconSun/> Warm</button>
              <button className={`theme-opt ${theme==="deep"?"active":""}`} onClick={()=>setTheme("deep")}><IconMoon/> Deep</button>
            </div>
            <div className="avatar">{avatarLetter}</div>
          </div>
        </div>

        {/* Toast */}
        <div className="topbar-toast"><AnimatePresence>{toast&&<Toast msg={toast.msg} type={toast.type}/>}</AnimatePresence></div>

        <div className="content">
          {!isSpecialPage&&(
            <Reveal>
              <div className="search-wrap">
                <span className="search-icon"><IconSearch/></span>
                <input className="search-input" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            </Reveal>
          )}

          {page==="kanban"&&<Reveal><KanbanBoard tasks={tasks} done={done} onToggle={toggleDone} t={t}/></Reveal>}
          {page==="analytics"&&<Reveal><AnalyticsPage tasks={tasks} done={done} t={t}/></Reveal>}
          {page==="badges"&&<Reveal><BadgesPage badges={badges} xp={xp} streak={streak} level={level} xpToNext={xpToNext} t={t}/></Reveal>}

          {page==="tasks"&&(
            <>
              <motion.div className="stats-grid" variants={stagger} initial="hidden" animate="show">
                {[
                  {label:"Total",    val:total,              sub:"in workspace",        icon:<IconTasks/>,  barPct:100},
                  {label:"Completed",val:completedCount,     sub:<><b>{pct}%</b> done</>,icon:<IconCheck/>,  barPct:pct},
                  {label:"Pending",  val:total-completedCount,sub:"remaining",          icon:<IconZap/>,    barPct:total?((total-completedCount)/total*100):0},
                  {label:"Overdue",  val:overdueCount,       sub:"need attention",      icon:<IconTarget/>, barPct:total?(overdueCount/total*100):0},
                ].map(s=>(
                  <motion.div className="stat-card" key={s.label} variants={scaleIn}>
                    <div className="stat-card-bg"/><div className="stat-card-glow"/>
                    <div className="stat-icon-row"><div className="stat-icon-badge">{s.icon}</div><Sparkline data={sparkData} color={t.accent}/></div>
                    <div className="stat-label">{s.label}</div><div className="stat-val">{s.val}</div><div className="stat-sub">{s.sub}</div>
                    <div className="stat-bar"><motion.div className="stat-bar-fill" initial={{width:0}} animate={{width:`${s.barPct}%`}} transition={{duration:1.1,ease:[0.22,1,0.36,1]}}/></div>
                  </motion.div>
                ))}
              </motion.div>
              <Reveal delay={0.04}>
                <div className="insight-strip">
                  {[
                    {icon:<IconTrend/>,    val:`${pct}%`,                                                                                label:"Completion rate"},
                    {icon:<IconActivity/>, val:`${highPrio}`,                                                                           label:"High priority pending"},
                    {icon:<IconZap/>,      val:`${tasks.filter(tk=>tk.dueDate?.startsWith(todayStr)).length}`, label:"Due today"},
                  ].map((item,i)=>(
                    <motion.div key={i} className="insight-card" variants={scaleIn} initial="hidden" animate="show" transition={{delay:i*0.07}}>
                      <div className="insight-icon">{item.icon}</div>
                      <div><div className="insight-val">{item.val}</div><div className="insight-label">{item.label}</div></div>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </>
          )}

          {page==="projects"&&(
            <Reveal>
              <div className="projects-grid">
                {projectStats.length===0
                  ?<p style={{color:t.inkMuted,fontSize:13,gridColumn:"1/-1"}}>No projects yet.</p>
                  :projectStats.map(p=>(
                    <motion.div key={p.name} variants={scaleIn} initial="hidden" animate="show"
                      className={`project-card ${selectedProject===p.name?"selected":""}`}
                      onClick={()=>setSelectedProject(prev=>prev===p.name?null:p.name)}
                      whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                      <div className="project-card-name">{p.name}</div>
                      <div className="project-card-count">{p.count} tasks · {p.done} done</div>
                      <div className="proj-bar-track"><div className="proj-bar-fill" style={{width:p.count?`${Math.round((p.done/p.count)*100)}%`:"0%"}}/></div>
                    </motion.div>
                  ))}
              </div>
              {selectedProject&&<div style={{marginBottom:14,fontSize:12,color:t.inkMuted,display:"flex",alignItems:"center",gap:8}}>Showing: <span style={{color:t.accent,fontWeight:700}}>{selectedProject}</span><button onClick={()=>setSelectedProject(null)} style={{background:"none",border:"none",color:t.red,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"DM Sans,sans-serif"}}>Clear</button></div>}
            </Reveal>
          )}

          {!isSpecialPage&&(
            <Reveal delay={0.06}>
              <div className="add-card">
                <div className="add-card-head"><div className="add-card-icon"><IconSparkle/></div><span className="add-card-label">New Task</span></div>
                <div className="add-row">
                  <input className="add-input" placeholder="What needs to be done?" value={taskInput} onChange={e=>setTaskInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
                  <select className="add-select" value={priority} onChange={e=>setPriority(e.target.value)}><option value="none">No priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                  <select className="add-select" value={project} onChange={e=>setProject(e.target.value)}><option value="">No project</option>{PROJECTS.map(p=><option key={p} value={p}>{p}</option>)}</select>
                  <input className="add-select" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{cursor:"pointer"}}/>
                  <motion.button className="add-btn" onClick={addTask} disabled={adding} whileTap={{scale:0.97}}><IconPlus/>{adding?"Adding…":"Add task"}</motion.button>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── Task list with DnD ── */}
          {!isSpecialPage&&(
            <Reveal delay={0.09}>
              <div className="section-head">
                <span className="section-title">{pageTitleMap[page]}</span>
                <span className="section-badge">{displayTasks.length}</span>
              </div>
              <div className="filter-tabs">
                {["all","pending","done"].map(f=>(
                  <motion.button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} whileTap={{scale:0.96}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </motion.button>
                ))}
              </div>
              {loading
                ?<div className="spinner"/>
                :displayTasks.length===0
                  ?(<motion.div className="empty" variants={fadeIn} initial="hidden" animate="show">
                      <div className="empty-icon">{page==="today"?<IconToday/>:page==="priority"?<IconPriority/>:<IconTasks/>}</div>
                      <div className="empty-title">{search?"No results":page==="today"?"Nothing due today":page==="priority"?"No priority tasks":"No tasks yet"}</div>
                      <div className="empty-sub">{search?"Try a different keyword":"Add a task above to get started"}</div>
                    </motion.div>)
                  :(
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                      <SortableContext items={displayTasks.map(tk=>tk._id)} strategy={verticalListSortingStrategy}>
                        <motion.div className="task-list" layout>
                          <AnimatePresence>
                            {displayTasks.map((task,i)=>(
                              <SortableTaskItem key={task._id} task={task} done={!!done[task._id]}
                                onToggle={toggleDone} onDelete={deleteTask} onEdit={editTask}
                                delay={i*0.03} t={t} viewMode={viewMode}
                                bulkMode={bulkMode} selected={selected.has(task._id)} onSelect={toggleSelect}/>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </SortableContext>
                      {/* Drag overlay: ghost card while dragging */}
                      <DragOverlay>
                        {activeTask&&(
                          <div style={{background:t.surface2,border:`1px solid ${t.accent}`,borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",gap:11,boxShadow:`0 12px 40px rgba(0,0,0,0.4),0 0 0 2px ${t.accentDim2}`,opacity:0.95,transform:"scale(1.02)"}}>
                            <div style={{color:t.accent}}><IconGrip/></div>
                            <span style={{fontSize:13.5,color:t.ink,flex:1}}>{activeTask.title}</span>
                          </div>
                        )}
                      </DragOverlay>
                    </DndContext>
                  )}
            </Reveal>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authPage,setAuthPage] = useState("login");
  const [token,setToken]       = useState(()=>localStorage.getItem("fm_token")||"");
  const [email,setEmail]       = useState(()=>localStorage.getItem("fm_email")||"");
  const [theme,setTheme]       = useState(()=>localStorage.getItem("fm_theme")||"warm");
  const [accentHex,setAccentHexRaw] = useState(()=>localStorage.getItem("fm_accent")||"");

  // Derive full theme with custom accent
  const baseTheme = THEMES[theme];
  const t = useMemo(()=>{
    const hex = accentHex || baseTheme.accent;
    return applyAccent(baseTheme, hex);
  }, [theme, accentHex, baseTheme]);

  const setAccentHex = useCallback(hex=>{
    setAccentHexRaw(hex);
    localStorage.setItem("fm_accent", hex);
  }, []);

  useEffect(()=>{localStorage.setItem("fm_theme",theme);},[theme]);
  // Reset accent when theme changes so default makes sense
  const handleSetTheme = t => { setTheme(t); setAccentHexRaw(""); localStorage.removeItem("fm_accent"); };

  const handleLogin=(tok,em)=>{setToken(tok);setEmail(em);localStorage.setItem("fm_token",tok);localStorage.setItem("fm_email",em);};
  const handleLogout=()=>{setToken("");setEmail("");localStorage.removeItem("fm_token");localStorage.removeItem("fm_email");setAuthPage("login");};

  return (
    <>
      <GlobalStyles t={t}/>
      <AnimatePresence mode="wait">
        {!token
          ?<AuthPage key="auth" mode={authPage} onLogin={handleLogin} onSwitch={()=>setAuthPage(p=>p==="login"?"register":"login")} t={t}/>
          :<Dashboard key="dash" token={token} email={email} onLogout={handleLogout}
              theme={theme} setTheme={handleSetTheme} t={t}
              accentHex={accentHex||t.accent} setAccentHex={setAccentHex}/>}
      </AnimatePresence>
    </>
  );
}