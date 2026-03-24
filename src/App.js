import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = "https://flowmind-backend-h2aw.onrender.com";

// ─── Styles ────────────────────────────────────────────────────────────────
// mode: "warm" (default) | "deep" (toggle)
const makeStyles = (mode) => {
  const warm = mode === "warm";
  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg:         ${warm ? "#18161d" : "#0c0c10"};
  --bg2:        ${warm ? "#1f1c27" : "#111116"};
  --surface:    ${warm ? "#252230" : "#16161c"};
  --surface2:   ${warm ? "#2c2939" : "#1c1c24"};
  --surface3:   ${warm ? "#343041" : "#222230"};
  --border:     ${warm ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.06)"};
  --border2:    ${warm ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.10)"};
  --ink:        ${warm ? "#ede9e1" : "#e2dff8"};
  --ink-mid:    ${warm ? "rgba(237,233,225,0.58)" : "rgba(226,223,248,0.52)"};
  --ink-muted:  ${warm ? "rgba(237,233,225,0.30)" : "rgba(226,223,248,0.28)"};
  --accent:     ${warm ? "#c9975a" : "#7c6af7"};
  --accent2:    ${warm ? "#e0b278" : "#9d8ff9"};
  --accent-dim: ${warm ? "rgba(201,151,90,0.13)" : "rgba(124,106,247,0.13)"};
  --accent-dim2:${warm ? "rgba(201,151,90,0.22)" : "rgba(124,106,247,0.22)"};
  --red:        #e06060;
  --red-dim:    rgba(224,96,96,0.13);
  --amber:      #e8b44c;
  --amber-dim:  rgba(232,180,76,0.15);
  --green:      #56cc82;
  --green-dim:  rgba(86,204,130,0.13);
  --shadow:     0 1px 3px rgba(0,0,0,0.35),0 4px 16px rgba(0,0,0,0.25);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.45);
}

html{height:100%;}
body{background:var(--bg);color:var(--ink);font-family:'DM Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;transition:background 0.35s,color 0.35s;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}
@keyframes spin{to{transform:rotate(360deg);}}

/* ── Auth ── */
.auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
@media(max-width:768px){.auth-shell{grid-template-columns:1fr;}.auth-panel{display:none;}}

.auth-panel{
  background:${warm
    ? "linear-gradient(145deg,#1a1520 0%,#0f0c14 100%)"
    : "linear-gradient(145deg,#13101e 0%,#0a0812 100%)"};
  display:flex;flex-direction:column;justify-content:space-between;
  padding:48px;position:relative;overflow:hidden;
}
.auth-panel::before{
  content:'';position:absolute;inset:0;
  background:${warm
    ? "radial-gradient(circle at 30% 70%,rgba(201,151,90,0.1) 0%,transparent 55%),radial-gradient(circle at 75% 20%,rgba(201,151,90,0.05) 0%,transparent 45%)"
    : "radial-gradient(circle at 30% 70%,rgba(124,106,247,0.12) 0%,transparent 55%),radial-gradient(circle at 75% 20%,rgba(86,204,130,0.05) 0%,transparent 45%)"};
}
.panel-logo{font-family:'DM Serif Display',serif;font-size:24px;color:rgba(255,255,255,0.88);letter-spacing:-0.02em;position:relative;z-index:1;}
.panel-logo span{font-style:italic;color:var(--accent);opacity:0.8;}
.panel-content{position:relative;z-index:1;}
.panel-quote{font-family:'DM Serif Display',serif;font-size:clamp(26px,3.2vw,44px);font-weight:400;color:rgba(255,255,255,0.88);line-height:1.2;letter-spacing:-0.02em;margin-bottom:18px;}
.panel-quote em{font-style:italic;color:var(--accent);}
.panel-sub{font-size:13px;color:rgba(255,255,255,0.32);line-height:1.7;}
.panel-dots{display:flex;gap:7px;position:relative;z-index:1;}
.panel-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.18);}
.panel-dot.active{background:var(--accent);width:22px;border-radius:4px;}

.auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px 40px;background:var(--surface);}
.auth-form-box{width:100%;max-width:380px;animation:fadeUp 0.5s ease;}
.form-eyebrow{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:10px;opacity:0.85;}
.form-title{font-family:'DM Serif Display',serif;font-size:32px;font-weight:400;letter-spacing:-0.02em;color:var(--ink);margin-bottom:6px;line-height:1.1;}
.form-title em{font-style:italic;color:var(--accent);}
.form-sub{font-size:13px;color:var(--ink-muted);margin-bottom:32px;line-height:1.6;}
.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-mid);margin-bottom:7px;}
.form-input{width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:15px;padding:12px 15px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;border-radius:6px;}
.form-input::placeholder{color:var(--ink-muted);}
.form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);}
.form-btn{width:100%;background:var(--accent);border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.04em;padding:13px;cursor:pointer;transition:background 0.2s,box-shadow 0.2s,transform 0.1s;margin-top:8px;border-radius:6px;}
.form-btn:hover{background:var(--accent2);box-shadow:0 4px 20px var(--accent-dim2);}
.form-btn:active{transform:scale(0.99);}
.form-btn:disabled{opacity:0.5;cursor:not-allowed;}
.form-divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
.form-divider-line{flex:1;height:1px;background:var(--border);}
.form-divider-text{font-size:11px;color:var(--ink-muted);}
.form-switch{text-align:center;margin-top:22px;font-size:14px;color:var(--ink-muted);}
.form-switch button{background:none;border:none;color:var(--accent);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.toast{padding:10px 14px;border-radius:6px;font-size:13px;font-weight:500;margin-bottom:14px;animation:fadeIn 0.3s ease;}
.toast.error{background:var(--red-dim);color:var(--red);border-left:3px solid var(--red);}
.toast.success{background:var(--green-dim);color:var(--green);border-left:3px solid var(--green);}

/* ── Dashboard ── */
.dashboard{min-height:100vh;display:grid;grid-template-columns:240px 1fr;}
@media(max-width:900px){.dashboard{grid-template-columns:1fr;}.sidebar{display:none;}}

/* ── Sidebar ── */
.sidebar{background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sidebar-logo{font-family:'DM Serif Display',serif;font-size:20px;color:var(--ink);letter-spacing:-0.02em;padding:26px 22px 22px;border-bottom:1px solid var(--border);}
.sidebar-logo span{font-style:italic;color:var(--accent);}
.sidebar-section{padding:18px 14px 8px;}
.sidebar-section-label{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--ink-muted);font-weight:600;margin-bottom:8px;padding:0 8px;}
.sidebar-nav{list-style:none;display:flex;flex-direction:column;gap:1px;}
.sidebar-nav li button{width:100%;display:flex;align-items:center;gap:9px;background:none;border:none;color:var(--ink-mid);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:9px 10px;cursor:pointer;border-radius:8px;transition:all 0.15s;text-align:left;}
.sidebar-nav li button:hover{background:var(--surface2);color:var(--ink);}
.sidebar-nav li button.active{background:var(--accent-dim);color:var(--accent);font-weight:600;}
.nav-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.nav-badge{margin-left:auto;background:var(--accent-dim2);color:var(--accent);font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;}

.sidebar-bottom{margin-top:auto;padding:16px 14px;border-top:1px solid var(--border);}
.progress-row{display:flex;justify-content:space-between;margin-bottom:7px;}
.progress-label{font-size:11px;color:var(--ink-muted);}
.progress-val{font-size:11px;font-weight:600;color:var(--ink);}
.progress-bar{height:3px;background:var(--bg2);border-radius:2px;overflow:hidden;margin-bottom:14px;}
.progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width 0.6s ease;}
.sidebar-logout{width:100%;display:flex;align-items:center;gap:9px;background:none;border:1px solid var(--border);color:var(--ink-muted);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;padding:9px 12px;cursor:pointer;border-radius:8px;transition:all 0.15s;}
.sidebar-logout:hover{background:var(--red-dim);color:var(--red);border-color:transparent;}

/* ── Main ── */
.main{background:var(--bg);overflow-y:auto;display:flex;flex-direction:column;}

/* ── Topbar ── */
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:17px 30px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;backdrop-filter:blur(12px);}
.topbar-left h1{font-family:'DM Serif Display',serif;font-size:21px;font-weight:400;letter-spacing:-0.02em;color:var(--ink);}
.topbar-left p{font-size:11px;color:var(--ink-muted);margin-top:2px;}
.topbar-right{display:flex;align-items:center;gap:8px;}
.icon-btn{background:var(--surface2);border:1px solid var(--border);color:var(--ink-mid);width:33px;height:33px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all 0.15s;}
.icon-btn:hover{background:var(--surface3);color:var(--ink);}
.avatar{width:33px;height:33px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;}

/* ── Content ── */
.content{padding:26px 30px;flex:1;}

/* ── Search ── */
.search-wrap{position:relative;margin-bottom:22px;}
.search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--ink-muted);}
.search-input{width:100%;background:var(--surface);border:1px solid var(--border);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 16px 11px 38px;outline:none;border-radius:8px;transition:border-color 0.2s,box-shadow 0.2s;}
.search-input::placeholder{color:var(--ink-muted);}
.search-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);}

/* ── Stats ── */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.stat-card{background:var(--surface);border:1px solid var(--border);padding:18px 20px;border-radius:10px;box-shadow:var(--shadow);animation:scaleIn 0.4s ease both;}
.stat-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.stat-card-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-muted);}
.stat-card-icon{font-size:17px;}
.stat-card-val{font-family:'DM Serif Display',serif;font-size:34px;font-weight:400;color:var(--ink);letter-spacing:-0.02em;line-height:1;}
.stat-card-sub{font-size:11px;color:var(--ink-muted);margin-top:4px;}
.stat-card-sub b{color:var(--accent);}

/* ── Add task ── */
.add-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:18px;box-shadow:var(--shadow);animation:fadeUp 0.4s ease 0.1s both;}
.add-card-label{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:12px;opacity:0.85;}
.add-row{display:flex;gap:8px;flex-wrap:wrap;}
.add-input{flex:1;min-width:200px;background:var(--bg2);border:1px solid var(--border2);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;border-radius:7px;}
.add-input::placeholder{color:var(--ink-muted);}
.add-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);}
.add-select{background:var(--bg2);border:1px solid var(--border2);color:var(--ink-mid);font-family:'DM Sans',sans-serif;font-size:13px;padding:11px 12px;outline:none;border-radius:7px;cursor:pointer;transition:border-color 0.2s;}
.add-select:focus{border-color:var(--accent);}
.add-btn{background:var(--accent);border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;padding:11px 20px;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;white-space:nowrap;border-radius:7px;}
.add-btn:hover{background:var(--accent2);box-shadow:0 4px 14px var(--accent-dim2);}
.add-btn:disabled{opacity:0.5;cursor:not-allowed;}

/* ── Task section ── */
.task-section{animation:fadeUp 0.4s ease 0.15s both;}
.task-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.task-section-title{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink-muted);font-weight:600;}
.task-count-badge{font-size:11px;background:var(--surface2);border:1px solid var(--border);color:var(--ink-mid);padding:2px 10px;border-radius:20px;}

.filter-tabs{display:flex;gap:6px;margin-bottom:12px;}
.filter-tab{background:none;border:1px solid var(--border);color:var(--ink-muted);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;padding:5px 13px;cursor:pointer;border-radius:20px;transition:all 0.15s;}
.filter-tab:hover{border-color:var(--border2);color:var(--ink);}
.filter-tab.active{background:var(--accent);border-color:var(--accent);color:#fff;}

/* ── Task item ── */
.task-list{display:flex;flex-direction:column;gap:3px;}
.task-item{background:var(--surface);border:1px solid var(--border);border-radius:9px;display:flex;align-items:center;gap:12px;padding:14px 16px;transition:box-shadow 0.2s,border-color 0.2s,transform 0.15s;animation:slideIn 0.3s ease both;position:relative;}
.task-item:hover{box-shadow:var(--shadow);border-color:var(--border2);transform:translateX(2px);}
.task-item.done{opacity:0.38;}

.task-check{width:19px;height:19px;border:2px solid var(--border2);border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;background:none;}
.task-check:hover{border-color:var(--accent);background:var(--accent-dim);}
.task-check.checked{background:var(--accent);border-color:var(--accent);}
.task-check.checked::after{content:'✓';color:#fff;font-size:10px;font-weight:700;}

.task-body{flex:1;min-width:0;}
.task-title-row{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.task-text{font-size:14px;color:var(--ink);line-height:1.3;}
.task-item.done .task-text{text-decoration:line-through;color:var(--ink-muted);}

.priority-badge{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 7px;border-radius:10px;flex-shrink:0;}
.p-high{background:var(--red-dim);color:var(--red);}
.p-medium{background:var(--amber-dim);color:var(--amber);}
.p-low{background:var(--green-dim);color:var(--green);}

.task-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.task-due{font-size:11px;color:var(--ink-muted);}
.task-due.overdue{color:var(--red);}
.task-project-tag{font-size:10px;color:var(--accent);background:var(--accent-dim);padding:1px 8px;border-radius:10px;}
.task-time{font-size:11px;color:var(--ink-muted);white-space:nowrap;flex-shrink:0;}

.task-actions{display:flex;gap:3px;opacity:0;transition:opacity 0.15s;flex-shrink:0;}
.task-item:hover .task-actions{opacity:1;}
.task-action-btn{background:none;border:none;color:var(--ink-muted);font-size:12px;cursor:pointer;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:all 0.15s;}
.task-action-btn:hover{background:var(--surface2);color:var(--ink);}
.task-action-btn.del:hover{background:var(--red-dim);color:var(--red);}
.task-action-btn.edit-active{background:var(--accent-dim);color:var(--accent);}

.task-edit-input{flex:1;background:var(--bg2);border:1px solid var(--accent);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px;padding:4px 10px;outline:none;border-radius:6px;box-shadow:0 0 0 3px var(--accent-dim);}

/* ── Empty ── */
.empty-tasks{text-align:center;padding:56px 20px;background:var(--surface);border:1px dashed var(--border2);border-radius:10px;}
.empty-icon{font-size:36px;margin-bottom:12px;opacity:0.2;}
.empty-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--ink-mid);margin-bottom:5px;font-weight:400;}
.empty-sub{font-size:12px;color:var(--ink-muted);}

/* ── Projects ── */
.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-bottom:18px;}
.project-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px;cursor:pointer;transition:all 0.2s;animation:scaleIn 0.35s ease both;}
.project-card:hover{box-shadow:var(--shadow);border-color:var(--border2);transform:translateY(-2px);}
.project-card.selected{border-color:var(--accent);background:var(--accent-dim);}
.project-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;}
.project-name{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:3px;}
.project-count{font-size:11px;color:var(--ink-muted);}
.project-bar{height:3px;background:var(--bg2);border-radius:2px;overflow:hidden;}
.project-bar-fill{height:100%;background:var(--accent);border-radius:2px;}
.project-icon{font-size:18px;opacity:0.6;}

/* ── Spinner ── */
.spinner{width:20px;height:20px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;margin:40px auto;}

/* ── Theme toggle pill ── */
.theme-toggle{display:flex;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:3px;gap:2px;}
.theme-opt{background:none;border:none;color:var(--ink-muted);font-size:12px;padding:4px 10px;border-radius:16px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;font-weight:500;white-space:nowrap;}
.theme-opt.active{background:var(--accent-dim2);color:var(--accent);}
.theme-opt:hover:not(.active){color:var(--ink);}
`;
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(d) {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
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

// ─── Auth Page ─────────────────────────────────────────────────────────────
function AuthPage({ mode, onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const isLogin = mode === "login";

  const showToast = (msg, type = "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

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
        showToast("Account created! Signing you in…", "success");
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
        <div className="panel-logo">Flow<span>Mind</span></div>
        <div className="panel-content">
          <div className="panel-quote">
            {isLogin ? <>Your tasks,<br /><em>beautifully</em><br />organised.</> : <>Start your<br /><em>journey</em><br />today.</>}
          </div>
          <p className="panel-sub">{isLogin ? "Stay focused. Move faster.\nAccomplish more every day." : "Join thousands of people who get things done with FlowMind."}</p>
        </div>
        <div className="panel-dots">
          <div className={`panel-dot ${isLogin ? "active" : ""}`} />
          <div className={`panel-dot ${!isLogin ? "active" : ""}`} />
          <div className="panel-dot" />
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="form-eyebrow">{isLogin ? "Welcome back" : "Get started"}</div>
          <h1 className="form-title">{isLogin ? <>Sign <em>in</em></> : <>Create an <em>account</em></>}</h1>
          <p className="form-sub">{isLogin ? "Enter your credentials to access your workspace." : "Free forever. No credit card required."}</p>
          {toast && <Toast msg={toast.msg} type={toast.type} />}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder={isLogin ? "••••••••" : "Min. 6 characters"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <button className="form-btn" onClick={handle} disabled={loading}>
            {loading ? (isLogin ? "Signing in…" : "Creating…") : (isLogin ? "Sign in →" : "Create account →")}
          </button>
          <div className="form-divider"><div className="form-divider-line" /><span className="form-divider-text">or</span><div className="form-divider-line" /></div>
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

  return (
    <div className={`task-item ${done ? "done" : ""}`} style={{ animationDelay: `${delay}ms` }}>
      <button className={`task-check ${done ? "checked" : ""}`} onClick={() => onToggle(task._id)} />
      <div className="task-body">
        <div className="task-title-row">
          {editing
            ? <input className="task-edit-input" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }} autoFocus />
            : <span className="task-text">{task.title}</span>}
          {task.priority && task.priority !== "none" && (
            <span className={`priority-badge p-${task.priority}`}>{task.priority}</span>
          )}
        </div>
        <div className="task-meta">
          {task.project && <span className="task-project-tag">📁 {task.project}</span>}
          {task.dueDate && (
            <span className={`task-due ${isDueOverdue(task.dueDate) && !done ? "overdue" : ""}`}>
              📅 {formatDue(task.dueDate)}{isDueOverdue(task.dueDate) && !done ? " · Overdue" : ""}
            </span>
          )}
        </div>
      </div>
      <span className="task-time">{timeAgo(task.createdAt)}</span>
      <div className="task-actions">
        <button className={`task-action-btn ${editing ? "edit-active" : ""}`} onClick={() => setEditing(e => !e)} title="Edit">✏️</button>
        <button className="task-action-btn del" onClick={() => onDelete(task._id)} title="Delete">✕</button>
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

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

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
      await axios.post(`${API}/api/tasks/add`, { title: taskInput, priority, project, dueDate }, { headers: { authorization: token } });
      setTaskInput(""); setPriority("none"); setProject(""); setDueDate("");
      fetchTasks(); showToast("Task added!");
    } catch (e) { showToast(e.response?.data?.message || "Failed to add task", "error"); }
    setAdding(false);
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, { headers: { authorization: token } });
      fetchTasks(); showToast("Task deleted.", "error");
    } catch (e) { console.error(e); }
  };

  const editTask = async (id, title) => {
    try {
      await axios.put(`${API}/api/tasks/${id}`, { title }, { headers: { authorization: token } });
      fetchTasks();
    } catch (e) {
      setTasks(prev => prev.map(t => t._id === id ? { ...t, title } : t));
    }
    showToast("Task updated!");
  };

  const toggleDone = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const completedCount = Object.values(done).filter(Boolean).length;
  const total = tasks.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const avatarLetter = email ? email[0].toUpperCase() : "U";
  const todayStr = new Date().toISOString().split("T")[0];
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const getDisplayTasks = useMemo(() => {
    let list = tasks;
    if (page === "today") list = tasks.filter(t => t.dueDate?.startsWith(todayStr) || t.createdAt?.startsWith(todayStr));
    if (page === "priority") list = tasks.filter(t => t.priority && t.priority !== "none");
    if (page === "projects") list = selectedProject ? tasks.filter(t => t.project === selectedProject) : tasks;
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === "done") list = list.filter(t => done[t._id]);
    if (filter === "pending") list = list.filter(t => !done[t._id]);
    return list;
  }, [tasks, page, filter, search, selectedProject, done]);

  // eslint-disable-next-line
  const projectStats = useMemo(() => {
    return PROJECTS.map(p => ({
      name: p,
      count: tasks.filter(t => t.project === p).length,
      done: tasks.filter(t => t.project === p && done[t._id]).length,
    })).filter(p => p.count > 0);
  }, [tasks, done]);

  const pageTitle = { tasks: "My Tasks", today: "Today", priority: "Priority", projects: "Projects" }[page];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">Flow<span>Mind</span></div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Workspace</div>
          <ul className="sidebar-nav">
            {[
              { id: "tasks", icon: "📋", label: "My Tasks", count: tasks.length },
              { id: "today", icon: "📅", label: "Today", count: tasks.filter(t => t.dueDate?.startsWith(todayStr)).length || null },
              { id: "priority", icon: "⭐", label: "Priority", count: tasks.filter(t => t.priority === "high").length || null },
              { id: "projects", icon: "📁", label: "Projects", count: projectStats.length || null },
            ].map(n => (
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
          <div className="progress-row">
            <span className="progress-label">Completion</span>
            <span className="progress-val">{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <button className="sidebar-logout" onClick={onLogout}>⬅ Sign out</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{page === "tasks" ? `${greeting} 👋` : pageTitle}</h1>
            <p>{today}</p>
          </div>
          <div className="topbar-right">
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            {/* Theme toggle */}
            <div className="theme-toggle">
              <button className={`theme-opt ${theme === "warm" ? "active" : ""}`} onClick={() => setTheme("warm")}>🌅 Warm</button>
              <button className={`theme-opt ${theme === "deep" ? "active" : ""}`} onClick={() => setTheme("deep")}>🌌 Deep</button>
            </div>
            <div className="avatar">{avatarLetter}</div>
          </div>
        </div>

        <div className="content">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {page === "tasks" && (
            <div className="stats-grid">
              {[
                { label: "Total", val: total, icon: "📋", sub: "tasks" },
                { label: "Completed", val: completedCount, icon: "✅", sub: <><b>{pct}%</b> done</> },
                { label: "Pending", val: total - completedCount, icon: "⏳", sub: "remaining" },
                { label: "Overdue", val: tasks.filter(t => isDueOverdue(t.dueDate) && !done[t._id]).length, icon: "🔴", sub: "need attention" },
              ].map((s, i) => (
                <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="stat-card-top"><span className="stat-card-label">{s.label}</span><span className="stat-card-icon">{s.icon}</span></div>
                  <div className="stat-card-val">{s.val}</div>
                  <div className="stat-card-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {page === "projects" && (
            <>
              <div className="projects-grid">
                {projectStats.length === 0
                  ? <p style={{ color: "var(--ink-muted)", fontSize: 13 }}>No projects yet. Add a task with a project assigned.</p>
                  : projectStats.map((p, i) => (
                    <div key={p.name} className={`project-card ${selectedProject === p.name ? "selected" : ""}`} style={{ animationDelay: `${i * 60}ms` }} onClick={() => setSelectedProject(prev => prev === p.name ? null : p.name)}>
                      <div className="project-card-top">
                        <div>
                          <div className="project-name">{p.name}</div>
                          <div className="project-count">{p.count} tasks · {p.done} done</div>
                        </div>
                        <div className="project-icon">📁</div>
                      </div>
                      <div className="project-bar">
                        <div className="project-bar-fill" style={{ width: p.count ? `${Math.round((p.done / p.count) * 100)}%` : "0%" }} />
                      </div>
                    </div>
                  ))}
              </div>
              {selectedProject && (
                <div style={{ marginBottom: 12, fontSize: 13, color: "var(--ink-muted)" }}>
                  Showing: <b style={{ color: "var(--accent)" }}>{selectedProject}</b>
                  <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", marginLeft: 8, fontSize: 12 }}>✕ Clear</button>
                </div>
              )}
            </>
          )}

          <div className="add-card">
            <div className="add-card-label">New Task</div>
            <div className="add-row">
              <input className="add-input" placeholder="What needs to be done?" value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
              <select className="add-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="none">No priority</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              <select className="add-select" value={project} onChange={e => setProject(e.target.value)}>
                <option value="">No project</option>
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input className="add-select" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ cursor: "pointer" }} />
              <button className="add-btn" onClick={addTask} disabled={adding}>{adding ? "Adding…" : "+ Add"}</button>
            </div>
          </div>

          <div className="task-section">
            <div className="task-section-head">
              <span className="task-section-title">{pageTitle}</span>
              <span className="task-count-badge">{getDisplayTasks.length}</span>
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
              : getDisplayTasks.length === 0
                ? <div className="empty-tasks">
                    <div className="empty-icon">{page === "today" ? "📅" : page === "priority" ? "⭐" : "🎯"}</div>
                    <div className="empty-title">{search ? "No matches found" : page === "today" ? "Nothing due today" : page === "priority" ? "No priority tasks" : "No tasks yet"}</div>
                    <div className="empty-sub">{search ? "Try a different search" : "Add a task above to get started"}</div>
                  </div>
                : <div className="task-list">
                    {getDisplayTasks.map((t, i) => (
                      <TaskItem key={t._id} task={t} done={!!done[t._id]} onToggle={toggleDone} onDelete={deleteTask} onEdit={editTask} delay={i * 35} />
                    ))}
                  </div>}
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