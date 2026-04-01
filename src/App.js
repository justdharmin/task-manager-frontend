import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = "https://flowmind-backend-h2aw.onrender.com";

// ─── SVG Icons (PascalCase to satisfy ESLint) ──────────────────────────────
const IconTasks = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconToday = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="2" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1 6h13M5 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconPriority = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 13V6l5-4 5 4v7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 13V9h3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconProjects = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M1 4h5l2-2h6v10H1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M9 2l2 2-7 7H2V9l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 4h9M5 4V2.5h3V4M4.5 4v6.5h4V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 2H2v10h3M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M10 4l1.1-1.1M2.9 11.1L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M12 8.5A5.5 5.5 0 015.5 2a5.5 5.5 0 100 10A5.5 5.5 0 0012 8.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCal = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="0.5" y="1.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M0.5 5h11M4 0.5v2M8 0.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);
const IconDot = ({ color }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <circle cx="4" cy="4" r="3" fill={color}/>
  </svg>
);

// ─── Styles ────────────────────────────────────────────────────────────────
const makeStyles = (mode) => {
  const warm = mode === "warm";
  return `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Geist+Mono:wght@300;400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg:          ${warm ? "#111010"   : "#0a0a0f"};
  --bg2:         ${warm ? "#181616"   : "#0f0f16"};
  --surface:     ${warm ? "#1e1c1c"   : "#14141e"};
  --surface2:    ${warm ? "#252222"   : "#1a1a28"};
  --surface3:    ${warm ? "#2d2929"   : "#212132"};
  --border:      ${warm ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.05)"};
  --border2:     ${warm ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.09)"};
  --border3:     ${warm ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.13)"};
  --ink:         ${warm ? "#f0ebe3"   : "#eeeaf8"};
  --ink-mid:     ${warm ? "rgba(240,235,227,0.55)" : "rgba(238,234,248,0.50)"};
  --ink-muted:   ${warm ? "rgba(240,235,227,0.28)" : "rgba(238,234,248,0.26)"};
  --ink-faint:   ${warm ? "rgba(240,235,227,0.14)" : "rgba(238,234,248,0.12)"};
  --accent:      ${warm ? "#d4956a"   : "#6f6bd4"};
  --accent2:     ${warm ? "#e8b48a"   : "#8e8ae8"};
  --accent-dim:  ${warm ? "rgba(212,149,106,0.1)"  : "rgba(111,107,212,0.1)"};
  --accent-dim2: ${warm ? "rgba(212,149,106,0.18)" : "rgba(111,107,212,0.18)"};
  --accent-dim3: ${warm ? "rgba(212,149,106,0.06)" : "rgba(111,107,212,0.06)"};
  --red:         #d95f5f;
  --red-dim:     rgba(217,95,95,0.12);
  --amber:       #d4943a;
  --amber-dim:   rgba(212,148,58,0.12);
  --green:       #4caf79;
  --green-dim:   rgba(76,175,121,0.12);
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.4);
  --shadow:      0 2px 8px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.4);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4);
  --radius:      6px;
  --radius-lg:   10px;
}

html,body{height:100%;}
body{
  background:var(--bg);color:var(--ink);
  font-family:'Manrope',sans-serif;
  min-height:100vh;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  transition:background 0.4s,color 0.4s;
  font-size:13px;line-height:1.5;
}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border3);border-radius:2px;}

@keyframes fadeUp  {from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn  {from{opacity:0;}to{opacity:1;}}
@keyframes slideIn {from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);}}
@keyframes scaleIn {from{opacity:0;transform:scale(0.98);}to{opacity:1;transform:scale(1);}}
@keyframes spin    {to{transform:rotate(360deg);}}

/* ══ AUTH ══ */
.auth-shell{min-height:100vh;display:grid;grid-template-columns:1.1fr 0.9fr;}
@media(max-width:820px){.auth-shell{grid-template-columns:1fr;}.auth-panel{display:none;}}

.auth-panel{
  background:var(--surface);border-right:1px solid var(--border);
  display:flex;flex-direction:column;justify-content:space-between;
  padding:44px 48px;position:relative;overflow:hidden;
}
.auth-panel::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:${warm
    ? "radial-gradient(ellipse 60% 50% at 30% 80%,rgba(212,149,106,0.08) 0%,transparent 65%)"
    : "radial-gradient(ellipse 60% 50% at 30% 80%,rgba(111,107,212,0.08) 0%,transparent 65%)"};
}
.auth-wordmark{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;letter-spacing:-0.03em;color:var(--ink);}
.auth-wordmark span{color:var(--accent);}
.auth-panel-body{position:relative;z-index:1;}
.auth-panel-label{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:20px;opacity:0.8;}
.auth-panel-headline{font-family:'Syne',sans-serif;font-size:clamp(28px,3vw,42px);font-weight:600;line-height:1.12;letter-spacing:-0.03em;color:var(--ink);margin-bottom:20px;}
.auth-panel-headline em{font-style:normal;color:var(--accent);}
.auth-panel-desc{font-size:13px;color:var(--ink-muted);line-height:1.75;max-width:300px;}
.auth-features{display:flex;flex-direction:column;gap:10px;position:relative;z-index:1;}
.auth-feature{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--ink-muted);}
.auth-feature-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;opacity:0.7;}

.auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px 44px;background:var(--bg);}
.auth-form-box{width:100%;max-width:360px;animation:fadeUp 0.45s ease;}
.auth-form-header{margin-bottom:28px;}
.auth-form-eyebrow{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:8px;opacity:0.75;}
.auth-form-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.03em;color:var(--ink);margin-bottom:5px;}
.auth-form-sub{font-size:13px;color:var(--ink-muted);line-height:1.5;}

.form-group{margin-bottom:12px;}
.form-label{display:block;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-mid);margin-bottom:6px;}
.form-input{width:100%;background:var(--surface);border:1px solid var(--border2);color:var(--ink);font-family:'Manrope',sans-serif;font-size:13px;padding:10px 12px;outline:none;border-radius:var(--radius);transition:border-color 0.2s,box-shadow 0.2s;letter-spacing:0.01em;}
.form-input::placeholder{color:var(--ink-faint);}
.form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);}
.form-btn{width:100%;background:var(--accent);border:none;color:#fff;font-family:'Manrope',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.02em;padding:11px;cursor:pointer;border-radius:var(--radius);transition:background 0.2s,box-shadow 0.2s,transform 0.1s;margin-top:6px;}
.form-btn:hover{background:var(--accent2);box-shadow:0 4px 18px var(--accent-dim2);}
.form-btn:active{transform:scale(0.99);}
.form-btn:disabled{opacity:0.45;cursor:not-allowed;}
.form-divider{display:flex;align-items:center;gap:10px;margin:18px 0;}
.form-divider-line{flex:1;height:1px;background:var(--border);}
.form-divider-text{font-size:11px;color:var(--ink-muted);letter-spacing:0.04em;}
.form-switch{text-align:center;margin-top:18px;font-size:12px;color:var(--ink-muted);}
.form-switch button{background:none;border:none;color:var(--accent);font-family:'Manrope',sans-serif;font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:2px;}

.toast{padding:9px 12px;border-radius:var(--radius);font-size:12px;font-weight:500;margin-bottom:12px;animation:fadeIn 0.25s ease;}
.toast.error{background:var(--red-dim);color:var(--red);border:1px solid rgba(217,95,95,0.15);}
.toast.success{background:var(--green-dim);color:var(--green);border:1px solid rgba(76,175,121,0.15);}

/* ══ DASHBOARD ══ */
.dashboard{min-height:100vh;display:grid;grid-template-columns:220px 1fr;}
@media(max-width:900px){.dashboard{grid-template-columns:1fr;}.sidebar{display:none;}}

.sidebar{background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sidebar-top{padding:20px 16px 16px;border-bottom:1px solid var(--border);}
.sidebar-wordmark{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;color:var(--ink);}
.sidebar-wordmark span{color:var(--accent);}
.sidebar-section{padding:16px 10px 6px;}
.sidebar-section-label{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink-muted);font-weight:600;margin-bottom:4px;padding:0 8px;}
.sidebar-nav{list-style:none;display:flex;flex-direction:column;gap:1px;}
.sidebar-nav li button{width:100%;display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--ink-mid);font-family:'Manrope',sans-serif;font-size:12px;font-weight:500;padding:7px 9px;cursor:pointer;border-radius:var(--radius);transition:all 0.12s;text-align:left;letter-spacing:0.01em;}
.sidebar-nav li button:hover{background:var(--surface2);color:var(--ink);}
.sidebar-nav li button.active{background:var(--accent-dim2);color:var(--accent);font-weight:600;}
.nav-icon{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0.8;}
.sidebar-nav li button.active .nav-icon{opacity:1;}
.nav-badge{margin-left:auto;background:var(--accent-dim3);border:1px solid var(--accent-dim2);color:var(--accent);font-size:10px;font-weight:700;padding:0 6px;border-radius:10px;font-family:'Geist Mono',monospace;}

.sidebar-bottom{margin-top:auto;padding:14px 10px;border-top:1px solid var(--border);}
.progress-wrap{margin-bottom:14px;padding:0 2px;}
.progress-header{display:flex;justify-content:space-between;margin-bottom:6px;}
.progress-label{font-size:10px;color:var(--ink-muted);letter-spacing:0.04em;font-weight:500;}
.progress-val{font-size:10px;font-weight:700;color:var(--accent);font-family:'Geist Mono',monospace;}
.progress-track{height:2px;background:var(--border2);border-radius:2px;overflow:hidden;}
.progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width 0.7s cubic-bezier(0.4,0,0.2,1);}
.sidebar-logout{width:100%;display:flex;align-items:center;gap:8px;background:none;border:1px solid var(--border);color:var(--ink-muted);font-family:'Manrope',sans-serif;font-size:11px;font-weight:600;padding:8px 10px;cursor:pointer;border-radius:var(--radius);transition:all 0.15s;letter-spacing:0.02em;}
.sidebar-logout:hover{background:var(--red-dim);color:var(--red);border-color:rgba(217,95,95,0.2);}

.main{background:var(--bg);overflow-y:auto;display:flex;flex-direction:column;}

.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;backdrop-filter:blur(16px);}
.topbar-left h1{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.02em;color:var(--ink);}
.topbar-left p{font-size:11px;color:var(--ink-muted);margin-top:1px;letter-spacing:0.01em;}
.topbar-right{display:flex;align-items:center;gap:8px;}

.theme-toggle{display:flex;align-items:center;background:var(--surface2);border:1px solid var(--border2);border-radius:20px;padding:2px;gap:1px;}
.theme-opt{background:none;border:none;color:var(--ink-muted);font-family:'Manrope',sans-serif;font-size:11px;font-weight:600;padding:4px 10px;border-radius:16px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:5px;letter-spacing:0.02em;}
.theme-opt.active{background:var(--accent-dim2);color:var(--accent);}
.theme-opt:hover:not(.active){color:var(--ink);}

.avatar{width:30px;height:30px;background:var(--accent-dim2);border:1px solid var(--accent-dim2);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--accent);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:-0.02em;}

.content{padding:24px 28px;flex:1;}

.search-wrap{position:relative;margin-bottom:20px;}
.search-icon-wrap{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink-muted);display:flex;align-items:center;}
.search-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--ink);font-family:'Manrope',sans-serif;font-size:13px;padding:9px 12px 9px 34px;outline:none;border-radius:var(--radius);transition:border-color 0.2s,box-shadow 0.2s;letter-spacing:0.01em;}
.search-input::placeholder{color:var(--ink-muted);}
.search-input:focus{border-color:var(--border3);box-shadow:0 0 0 3px var(--accent-dim);}

.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px;}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.stat-card{background:var(--surface);border:1px solid var(--border);padding:16px 18px;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);animation:scaleIn 0.35s ease both;position:relative;overflow:hidden;}
.stat-card::after{content:'';position:absolute;top:0;right:0;width:40px;height:40px;background:radial-gradient(circle,var(--accent-dim3) 0%,transparent 70%);border-radius:0 var(--radius-lg) 0 40px;}
.stat-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:10px;}
.stat-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:var(--ink);letter-spacing:-0.03em;line-height:1;margin-bottom:4px;}
.stat-sub{font-size:11px;color:var(--ink-muted);}
.stat-sub b{color:var(--accent);font-weight:700;}

.add-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px 18px;margin-bottom:16px;box-shadow:var(--shadow-sm);animation:fadeUp 0.35s ease 0.08s both;}
.add-card-label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:10px;opacity:0.75;}
.add-row{display:flex;gap:6px;flex-wrap:wrap;align-items:stretch;}
.add-input{flex:1;min-width:180px;background:var(--bg2);border:1px solid var(--border2);color:var(--ink);font-family:'Manrope',sans-serif;font-size:13px;padding:9px 12px;outline:none;border-radius:var(--radius);transition:border-color 0.2s,box-shadow 0.2s;letter-spacing:0.01em;}
.add-input::placeholder{color:var(--ink-muted);}
.add-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);}
.add-select{background:var(--bg2);border:1px solid var(--border2);color:var(--ink-mid);font-family:'Manrope',sans-serif;font-size:12px;font-weight:500;padding:9px 10px;outline:none;border-radius:var(--radius);cursor:pointer;transition:border-color 0.2s;letter-spacing:0.01em;}
.add-select:focus{border-color:var(--accent);}
.add-select option{background:var(--surface2);}
.add-btn{background:var(--accent);border:none;color:#fff;font-family:'Manrope',sans-serif;font-size:12px;font-weight:700;padding:9px 16px;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;white-space:nowrap;border-radius:var(--radius);display:flex;align-items:center;gap:6px;letter-spacing:0.02em;}
.add-btn:hover{background:var(--accent2);box-shadow:0 4px 14px var(--accent-dim2);}
.add-btn:disabled{opacity:0.45;cursor:not-allowed;}

.task-section{animation:fadeUp 0.35s ease 0.12s both;}
.task-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.task-section-title{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-muted);font-weight:600;}
.task-count-badge{font-size:10px;font-family:'Geist Mono',monospace;background:var(--surface2);border:1px solid var(--border);color:var(--ink-mid);padding:1px 8px;border-radius:10px;}

.filter-tabs{display:flex;gap:4px;margin-bottom:10px;}
.filter-tab{background:none;border:1px solid transparent;color:var(--ink-muted);font-family:'Manrope',sans-serif;font-size:11px;font-weight:600;padding:4px 12px;cursor:pointer;border-radius:20px;transition:all 0.12s;letter-spacing:0.02em;}
.filter-tab:hover{border-color:var(--border2);color:var(--ink);}
.filter-tab.active{background:var(--accent);border-color:var(--accent);color:#fff;}

.task-list{display:flex;flex-direction:column;gap:2px;}
.task-item{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);display:flex;align-items:center;gap:10px;padding:11px 14px;transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;animation:slideIn 0.25s ease both;position:relative;}
.task-item:hover{border-color:var(--border2);background:var(--surface2);}
.task-item.done{opacity:0.35;}

.task-check{width:17px;height:17px;border:1.5px solid var(--border3);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;background:none;color:transparent;}
.task-check:hover{border-color:var(--accent);background:var(--accent-dim);color:var(--accent);}
.task-check.checked{background:var(--accent);border-color:var(--accent);color:#fff;}

.task-body{flex:1;min-width:0;}
.task-title-row{display:flex;align-items:center;gap:7px;margin-bottom:2px;flex-wrap:wrap;}
.task-text{font-size:13px;color:var(--ink);line-height:1.35;font-weight:400;}
.task-item.done .task-text{text-decoration:line-through;color:var(--ink-muted);}

.p-badge{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;gap:4px;}
.p-high  {background:var(--red-dim);  color:var(--red);}
.p-medium{background:var(--amber-dim);color:var(--amber);}
.p-low   {background:var(--green-dim);color:var(--green);}

.task-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.task-project-tag{font-size:10px;color:var(--accent);background:var(--accent-dim3);border:1px solid var(--accent-dim);padding:1px 7px;border-radius:4px;font-weight:600;letter-spacing:0.02em;}
.task-due{font-size:10px;color:var(--ink-muted);display:flex;align-items:center;gap:4px;letter-spacing:0.02em;}
.task-due.overdue{color:var(--red);}
.task-time{font-size:10px;color:var(--ink-muted);white-space:nowrap;flex-shrink:0;font-family:'Geist Mono',monospace;}

.task-actions{display:flex;gap:2px;opacity:0;transition:opacity 0.12s;flex-shrink:0;}
.task-item:hover .task-actions{opacity:1;}
.task-action-btn{background:none;border:none;color:var(--ink-muted);cursor:pointer;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all 0.12s;}
.task-action-btn:hover{background:var(--surface3);color:var(--ink);}
.task-action-btn.del:hover{background:var(--red-dim);color:var(--red);}
.task-action-btn.edit-active{background:var(--accent-dim);color:var(--accent);}
.task-edit-input{flex:1;background:var(--bg2);border:1px solid var(--accent);color:var(--ink);font-family:'Manrope',sans-serif;font-size:13px;padding:3px 9px;outline:none;border-radius:4px;box-shadow:0 0 0 3px var(--accent-dim);}

.empty-tasks{text-align:center;padding:52px 20px;background:var(--surface);border:1px dashed var(--border2);border-radius:var(--radius-lg);}
.empty-icon-wrap{width:40px;height:40px;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--ink-muted);}
.empty-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--ink-mid);margin-bottom:5px;}
.empty-sub{font-size:12px;color:var(--ink-muted);}

.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-bottom:16px;}
.project-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;cursor:pointer;transition:all 0.18s;animation:scaleIn 0.3s ease both;}
.project-card:hover{border-color:var(--border2);box-shadow:var(--shadow);}
.project-card.selected{border-color:var(--accent);background:var(--accent-dim3);}
.project-card-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px;font-family:'Syne',sans-serif;letter-spacing:-0.01em;}
.project-card-count{font-size:11px;color:var(--ink-muted);margin-bottom:12px;}
.project-bar-track{height:2px;background:var(--border2);border-radius:2px;overflow:hidden;}
.project-bar-fill{height:100%;background:var(--accent);border-radius:2px;transition:width 0.5s ease;}

.spinner{width:18px;height:18px;border:1.5px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.65s linear infinite;margin:36px auto;}
`;
};

// ─── Helpers ───────────────────────────────────────────────────────────────
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

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
function AuthPage({ mode, onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
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

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-wordmark">Flow<span>Mind</span></div>
        <div className="auth-panel-body">
          <div className="auth-panel-label">Task Management</div>
          <div className="auth-panel-headline">
            {isLogin ? <>Where focus<br />meets <em>clarity.</em></> : <>Your work,<br /><em>organised.</em></>}
          </div>
          <div className="auth-panel-desc">
            {isLogin
              ? "Sign back in to your workspace and pick up right where you left off."
              : "Create your account and start building a workspace that works for you."}
          </div>
        </div>
        <div className="auth-features">
          {["Priority-based task management", "Project organisation", "Due date tracking", "Real-time progress"].map(f => (
            <div className="auth-feature" key={f}>
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <div className="auth-form-eyebrow">{isLogin ? "Sign in" : "Get started"}</div>
            <div className="auth-form-title">{isLogin ? "Welcome back" : "Create account"}</div>
            <div className="auth-form-sub">
              {isLogin ? "Enter your credentials to continue." : "Free to use. No credit card required."}
            </div>
          </div>
          {toast && <Toast msg={toast.msg} type={toast.type} />}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder={isLogin ? "••••••••" : "Min. 6 characters"} value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <button className="form-btn" onClick={handle} disabled={loading}>
            {loading ? (isLogin ? "Signing in..." : "Creating...") : (isLogin ? "Sign in" : "Create account")}
          </button>
          <div className="form-divider">
            <div className="form-divider-line" />
            <span className="form-divider-text">or</span>
            <div className="form-divider-line" />
          </div>
          <div className="form-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onSwitch}>{isLogin ? "Create one" : "Sign in"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Item ─────────────────────────────────────────────────────────────
function TaskItem({ task, onDelete, onToggle, onEdit, done, delay }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.title);

  const saveEdit = () => {
    if (editVal.trim() && editVal !== task.title) onEdit(task._id, editVal.trim());
    setEditing(false);
  };

  const priorityColor = { high: "var(--red)", medium: "var(--amber)", low: "var(--green)" };

  return (
    <div className={`task-item ${done ? "done" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <button className={`task-check ${done ? "checked" : ""}`} onClick={() => onToggle(task._id)}>
        {done && <IconCheck />}
      </button>
      <div className="task-body">
        <div className="task-title-row">
          {editing
            ? <input className="task-edit-input" value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                autoFocus />
            : <span className="task-text">{task.title}</span>}
          {task.priority && task.priority !== "none" && (
            <span className={`p-badge p-${task.priority}`}>
              <IconDot color={priorityColor[task.priority]} />
              {task.priority}
            </span>
          )}
        </div>
        <div className="task-meta">
          {task.project && <span className="task-project-tag">{task.project}</span>}
          {task.dueDate && (
            <span className={`task-due ${isDueOverdue(task.dueDate) && !done ? "overdue" : ""}`}>
              <IconCal />
              {formatDue(task.dueDate)}
              {isDueOverdue(task.dueDate) && !done && " · overdue"}
            </span>
          )}
        </div>
      </div>
      <span className="task-time">{timeAgo(task.createdAt)}</span>
      <div className="task-actions">
        <button className={`task-action-btn ${editing ? "edit-active" : ""}`} onClick={() => setEditing(e => !e)} title="Edit">
          <IconEdit />
        </button>
        <button className="task-action-btn del" onClick={() => onDelete(task._id)} title="Delete">
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ token, email, onLogout, theme, setTheme }) {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState("none");
  const [project, setProject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState({});
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState("tasks");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/tasks`, { headers: { authorization: token } });
      setTasks(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // eslint-disable-next-line
  useEffect(() => { fetchTasks(); }, []);

  const addTask = async () => {
    if (!taskInput.trim()) return;
    setAdding(true);
    try {
      await axios.post(`${API}/api/tasks/add`,
        { title: taskInput, priority, project, dueDate },
        { headers: { authorization: token } });
      setTaskInput(""); setPriority("none"); setProject(""); setDueDate("");
      fetchTasks();
      showToast("Task added.");
    } catch (e) { showToast(e.response?.data?.message || "Failed to add task.", "error"); }
    setAdding(false);
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, { headers: { authorization: token } });
      fetchTasks();
      showToast("Task removed.", "error");
    } catch (e) { console.error(e); }
  };

  const editTask = async (id, title) => {
    try {
      await axios.put(`${API}/api/tasks/${id}`, { title }, { headers: { authorization: token } });
      fetchTasks();
    } catch (e) {
      setTasks(prev => prev.map(t => t._id === id ? { ...t, title } : t));
    }
    showToast("Task updated.");
  };

  const toggleDone = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const completedCount = Object.values(done).filter(Boolean).length;
  const total = tasks.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const avatarLetter = email ? email[0].toUpperCase() : "U";
  const todayStr = new Date().toISOString().split("T")[0];
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const overdueCount = tasks.filter(t => isDueOverdue(t.dueDate) && !done[t._id]).length;

  // eslint-disable-next-line
  const displayTasks = useMemo(() => {
    let list = tasks;
    if (page === "today") list = tasks.filter(t => t.dueDate?.startsWith(todayStr) || t.createdAt?.startsWith(todayStr));
    if (page === "priority") list = tasks.filter(t => t.priority && t.priority !== "none");
    if (page === "projects") list = selectedProject ? tasks.filter(t => t.project === selectedProject) : tasks;
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === "done") list = list.filter(t => done[t._id]);
    if (filter === "pending") list = list.filter(t => !done[t._id]);
    return list;
  }, [tasks, page, filter, search, selectedProject, done, todayStr]);

  // eslint-disable-next-line
  const projectStats = useMemo(() => {
    return PROJECTS.map(p => ({
      name: p,
      count: tasks.filter(t => t.project === p).length,
      done: tasks.filter(t => t.project === p && done[t._id]).length,
    })).filter(p => p.count > 0);
  }, [tasks, done]);

  const pageTitle = { tasks: greeting, today: "Today", priority: "Priority", projects: "Projects" }[page];

  const navItems = [
    { id: "tasks",    icon: <IconTasks />,    label: "My Tasks", count: tasks.length },
    { id: "today",    icon: <IconToday />,    label: "Today",    count: tasks.filter(t => t.dueDate?.startsWith(todayStr)).length || null },
    { id: "priority", icon: <IconPriority />, label: "Priority", count: tasks.filter(t => t.priority === "high").length || null },
    { id: "projects", icon: <IconProjects />, label: "Projects", count: projectStats.length || null },
  ];

  const pageTitleMap = {
    tasks: "All Tasks",
    today: "Today's Tasks",
    priority: "Priority Tasks",
    projects: selectedProject || "All Projects",
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-wordmark">Flow<span>Mind</span></div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Workspace</div>
          <ul className="sidebar-nav">
            {navItems.map(n => (
              <li key={n.id}>
                <button className={page === n.id ? "active" : ""} onClick={() => { setPage(n.id); setSelectedProject(null); }}>
                  <span className="nav-icon">{n.icon}</span>
                  {n.label}
                  {n.count > 0 && <span className="nav-badge">{n.count}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-bottom">
          <div className="progress-wrap">
            <div className="progress-header">
              <span className="progress-label">Completion</span>
              <span className="progress-val">{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <IconLogout /> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{pageTitle}</h1>
            <p>{todayLabel}</p>
          </div>
          <div className="topbar-right">
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            <div className="theme-toggle">
              <button className={`theme-opt ${theme === "warm" ? "active" : ""}`} onClick={() => setTheme("warm")}>
                <IconSun /> Warm
              </button>
              <button className={`theme-opt ${theme === "deep" ? "active" : ""}`} onClick={() => setTheme("deep")}>
                <IconMoon /> Deep
              </button>
            </div>
            <div className="avatar">{avatarLetter}</div>
          </div>
        </div>

        <div className="content">
          <div className="search-wrap">
            <span className="search-icon-wrap"><IconSearch /></span>
            <input className="search-input" placeholder="Search tasks..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>

          {page === "tasks" && (
            <div className="stats-grid">
              {[
                { label: "Total",     val: total,                    sub: "tasks in workspace" },
                { label: "Completed", val: completedCount,           sub: <><b>{pct}%</b> completion rate</> },
                { label: "Pending",   val: total - completedCount,   sub: "tasks remaining" },
                { label: "Overdue",   val: overdueCount,             sub: "need attention" },
              ].map((s, i) => (
                <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {page === "projects" && (
            <>
              <div className="projects-grid">
                {projectStats.length === 0
                  ? <p style={{ color: "var(--ink-muted)", fontSize: 12, gridColumn: "1/-1" }}>
                      No projects yet. Create a task and assign a project.
                    </p>
                  : projectStats.map((p, i) => (
                    <div key={p.name}
                      className={`project-card ${selectedProject === p.name ? "selected" : ""}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => setSelectedProject(prev => prev === p.name ? null : p.name)}>
                      <div className="project-card-name">{p.name}</div>
                      <div className="project-card-count">{p.count} tasks · {p.done} done</div>
                      <div className="project-bar-track">
                        <div className="project-bar-fill"
                          style={{ width: p.count ? `${Math.round((p.done / p.count) * 100)}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
              </div>
              {selectedProject && (
                <div style={{ marginBottom: 12, fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                  Showing: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{selectedProject}</span>
                  <button onClick={() => setSelectedProject(null)}
                    style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "Manrope, sans-serif" }}>
                    Clear
                  </button>
                </div>
              )}
            </>
          )}

          <div className="add-card">
            <div className="add-card-label">New Task</div>
            <div className="add-row">
              <input className="add-input" placeholder="What needs to be done?" value={taskInput}
                onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
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
                onChange={e => setDueDate(e.target.value)} style={{ cursor: "pointer" }} />
              <button className="add-btn" onClick={addTask} disabled={adding}>
                <IconPlus />
                {adding ? "Adding..." : "Add task"}
              </button>
            </div>
          </div>

          <div className="task-section">
            <div className="task-section-head">
              <span className="task-section-title">{pageTitleMap[page]}</span>
              <span className="task-count-badge">{displayTasks.length}</span>
            </div>
            <div className="filter-tabs">
              {["all", "pending", "done"].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {loading
              ? <div className="spinner" />
              : displayTasks.length === 0
                ? (
                  <div className="empty-tasks">
                    <div className="empty-icon-wrap">
                      {page === "today" ? <IconToday /> : page === "priority" ? <IconPriority /> : <IconTasks />}
                    </div>
                    <div className="empty-title">
                      {search ? "No results" : page === "today" ? "Nothing due today" : page === "priority" ? "No priority tasks" : "No tasks yet"}
                    </div>
                    <div className="empty-sub">
                      {search ? "Try a different keyword" : "Add a task above to get started"}
                    </div>
                  </div>
                )
                : (
                  <div className="task-list">
                    {displayTasks.map((t, i) => (
                      <TaskItem key={t._id} task={t} done={!!done[t._id]}
                        onToggle={toggleDone} onDelete={deleteTask} onEdit={editTask} delay={i * 30} />
                    ))}
                  </div>
                )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authPage, setAuthPage] = useState("login");
  const [token, setToken] = useState(() => localStorage.getItem("fm_token") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("fm_email") || "");
  const [theme, setTheme] = useState(() => localStorage.getItem("fm_theme") || "warm");

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
      <style>{makeStyles(theme)}</style>
      {!token
        ? <AuthPage mode={authPage} onLogin={handleLogin} onSwitch={() => setAuthPage(p => p === "login" ? "register" : "login")} />
        : <Dashboard token={token} email={email} onLogout={handleLogout} theme={theme} setTheme={setTheme} />}
    </>
  );
}