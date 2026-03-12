import "./style.css";
import React, { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
//  AUTH SYSTEM — Login + Profil partagé entre les 3 interfaces
// ═══════════════════════════════════════════════════════

const AUTH_CSS = "";

// Comptes par défaut
const DEFAULT_ACCOUNTS = {
  admin:   { email:"admin@menuflow.app",   password:"admin123",   name:"Restaurant Mvog",  role:"Administrateur", avatar:null },
  cuisine: { email:"cuisine@menuflow.app", password:"cuisine123", name:"Chef Cuisine",     role:"Chef de cuisine", avatar:null },
  client:  { email:"client@menuflow.app",  password:"client123",  name:"Client",           role:"Client",          avatar:null },
};

// ── LOGIN SCREEN ──────────────────────────────────────
function LoginScreen({ roleKey, onLogin }) {
  const roleLabels = { admin:"Administration", cuisine:"Interface Cuisine", client:"Interface Client" };
  const roleIcons  = { admin:"🛠️", cuisine:"👨‍🍳", client:"📱" };

  const [tab,      setTab]      = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");

  const storageKey = `mf_user_${roleKey}`;

  const handleLogin = () => {
    setError("");
    const def = DEFAULT_ACCOUNTS[roleKey];
    // Check custom accounts first
    const custom = JSON.parse(localStorage.getItem(storageKey + "_accounts") || "[]");
    const found  = custom.find(a => a.email === email && a.password === password);
    if (found) { onLogin(found); return; }
    // Check default
    if (email === def.email && password === def.password) {
      onLogin({ ...def });
      return;
    }
    setError("Email ou mot de passe incorrect.");
  };

  const handleRegister = () => {
    setError("");
    if (!name || !email || !password) { setError("Tous les champs sont obligatoires."); return; }
    if (password !== confirm)          { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6)           { setError("Mot de passe trop court (6 caractères min)."); return; }
    const accounts = JSON.parse(localStorage.getItem(storageKey + "_accounts") || "[]");
    if (accounts.find(a => a.email === email)) { setError("Cet email est déjà utilisé."); return; }
    const newUser = { email, password, name, role: DEFAULT_ACCOUNTS[roleKey].role, avatar: null };
    accounts.push(newUser);
    localStorage.setItem(storageKey + "_accounts", JSON.stringify(accounts));
    onLogin(newUser);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Menu<span>Flow</span></div>
        <div className="auth-role-wrap">
          <div className="auth-role-badge">{roleIcons[roleKey]} {roleLabels[roleKey]}</div>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==="login"?"active":""}`}    onClick={()=>{setTab("login");setError("");}}>Connexion</button>
          <button className={`auth-tab ${tab==="register"?"active":""}`} onClick={()=>{setTab("register");setError("");}}>Créer un compte</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {tab === "login" ? (
          <>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder={DEFAULT_ACCOUNTS[roleKey].email}
                value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input className="auth-input" type="password" placeholder="••••••••"
                value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <button className="auth-btn" onClick={handleLogin}>Se connecter →</button>
            <div className="auth-switch">
              <span style={{fontSize:11,color:"#c8c0b8"}}>
                Compte démo : {DEFAULT_ACCOUNTS[roleKey].email} / {roleKey}123
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="auth-field">
              <label className="auth-label">Nom complet</label>
              <input className="auth-input" placeholder="Votre nom" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="vous@exemple.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <input className="auth-input" type="password" placeholder="Minimum 6 caractères" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            <div className="auth-field">
              <label className="auth-label">Confirmer le mot de passe</label>
              <input className="auth-input" type="password" placeholder="Répétez le mot de passe" value={confirm} onChange={e=>setConfirm(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>
            </div>
            <button className="auth-btn" onClick={handleRegister}>Créer mon compte →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── PROFILE MODAL ──────────────────────────────────────
function ProfileModal({ user, roleKey, onUpdate, onClose, onLogout, dark }) {
  const [name,     setName]     = useState(user.name);
  const [email,    setEmail]    = useState(user.email);
  const [password, setPassword] = useState("");
  const [avatar,   setAvatar]   = useState(user.avatar);
  const [success,  setSuccess]  = useState(false);
  const fileRef = useRef(null);

  const handleAvatar = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated = {
      ...user,
      name,
      email,
      avatar,
      ...(password ? { password } : {}),
    };
    onUpdate(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const initials = name ? name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "U";

  return (
    <div className="prof-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="prof-card">
        <div className="prof-header">
          <div className="prof-av-big">
            {avatar ? <img src={avatar} alt="avatar"/> : initials}
          </div>
          <div className="prof-header-info">
            <h3>{user.name}</h3>
            <p>{user.role} · {user.email}</p>
          </div>
        </div>
        <div className="prof-body">
          {success && <div className="prof-success">✓ Profil mis à jour avec succès !</div>}

          {/* Avatar upload */}
          <div className="prof-avatar-row">
            <div className="prof-av-preview">
              {avatar ? <img src={avatar} alt="avatar"/> : initials}
            </div>
            <div className="prof-av-upload" onClick={()=>fileRef.current.click()}>
              📷 Changer la photo de profil
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatar}/>
            </div>
            {avatar && (
              <button onClick={()=>setAvatar(null)} style={{background:"#fdecea",color:"#c0392b",border:"none",borderRadius:8,padding:"8px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>
                ✕
              </button>
            )}
          </div>

          <div className="prof-field">
            <label className="prof-label">Nom complet</label>
            <input className="prof-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Votre nom"/>
          </div>
          <div className="prof-field">
            <label className="prof-label">Email</label>
            <input className="prof-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          </div>
          <div className="prof-field">
            <label className="prof-label">Nouveau mot de passe <span style={{color:"#c8c0b8",fontWeight:400}}>(laisser vide pour garder l'actuel)</span></label>
            <input className="prof-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
        </div>
        <div className="prof-footer">
          <button className="prof-btn cancel"  onClick={onClose}>Fermer</button>
          <button className="prof-btn save"    onClick={handleSave}>Enregistrer</button>
          <button className="prof-btn logout"  onClick={onLogout}>Déconnexion</button>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE TRIGGER (bouton dans topbar) ──────────────
function ProfileTrigger({ user, onClick, dark }) {
  const initials = user.name ? user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "U";
  return (
    <button className={`prof-trigger ${dark?"dark":""}`} onClick={onClick}>
      <div className="prof-trigger-av">
        {user.avatar ? <img src={user.avatar} alt=""/> : initials}
      </div>
      <span className="prof-trigger-name">{user.name.split(" ")[0]}</span>
    </button>
  );
}





const ADMIN_STYLES = "";

// ── DATA ──────────────────────────────────────────────────────────────
const INIT_CATS = [
  { id:1, name:"Entrées",           img:null },
  { id:2, name:"Plats principaux",  img:null },
  { id:3, name:"Desserts",          img:null },
  { id:4, name:"Boissons",          img:null },
];
const INIT_DISHES = [
  { id:1, catId:1, name:"Salade César",    desc:"Laitue romaine, croûtons, parmesan, sauce César maison",         price:8500,  img:null, active:true,  stock:10 },
  { id:2, catId:1, name:"Soupe à l'oignon",desc:"Soupe traditionnelle gratinée au fromage emmental",              price:7000,  img:null, active:true,  stock:8  },
  { id:3, catId:1, name:"Carpaccio",       desc:"Fines tranches de bœuf, roquette, câpres, parmesan",             price:12000, img:null, active:false, stock:5  },
  { id:4, catId:2, name:"Poulet rôti",     desc:"Poulet fermier, pommes de terre grenaille, jus de volaille",     price:16000, img:null, active:true,  stock:12 },
  { id:5, catId:2, name:"Steak Frites",    desc:"Entrecôte 250g, frites maison, sauce poivre ou béarnaise",       price:22000, img:null, active:true,  stock:6  },
  { id:6, catId:2, name:"Saumon grillé",   desc:"Pavé de saumon, légumes de saison, sauce citronnée",             price:19500, img:null, active:true,  stock:4  },
  { id:7, catId:3, name:"Fondant chocolat",desc:"Cœur coulant chaud, boule de glace vanille",                     price:6500,  img:null, active:true,  stock:15 },
  { id:8, catId:3, name:"Tarte Tatin",     desc:"Pommes caramélisées, crème fraîche maison",                      price:5500,  img:null, active:true,  stock:7  },
  { id:9, catId:4, name:"Jus d'orange",    desc:"Pressé minute, sans sucre ajouté",                               price:3000,  img:null, active:true,  stock:20 },
  {id:10, catId:4, name:"Eau minérale",    desc:"50 cl ou 1 L — gazeuse ou plate",                                price:1500,  img:null, active:true,  stock:30 },
];
// Fake orders for dashboard stats
const FAKE_ORDERS = [
  {id:"o1", date:"2025-01-15", catId:2, dishes:[{dishId:4,qty:2},{dishId:5,qty:1}], total:54000, cancelled:false},
  {id:"o2", date:"2025-01-15", catId:1, dishes:[{dishId:1,qty:3}],                  total:25500, cancelled:false},
  {id:"o3", date:"2025-01-16", catId:3, dishes:[{dishId:7,qty:2}],                  total:13000, cancelled:true },
  {id:"o4", date:"2025-01-16", catId:2, dishes:[{dishId:6,qty:1},{dishId:4,qty:1}], total:35500, cancelled:false},
  {id:"o5", date:"2025-01-17", catId:4, dishes:[{dishId:9,qty:4},{dishId:10,qty:2}],total:15000, cancelled:false},
  {id:"o6", date:"2025-01-17", catId:2, dishes:[{dishId:5,qty:2}],                  total:44000, cancelled:true },
  {id:"o7", date:"2025-01-18", catId:1, dishes:[{dishId:2,qty:2},{dishId:3,qty:1}], total:26000, cancelled:false},
  {id:"o8", date:"2025-01-18", catId:3, dishes:[{dishId:8,qty:3}],                  total:16500, cancelled:false},
  {id:"o9", date:"2025-01-19", catId:2, dishes:[{dishId:4,qty:3}],                  total:48000, cancelled:false},
  {id:"o10",date:"2025-01-20", catId:1, dishes:[{dishId:1,qty:2},{dishId:2,qty:1}], total:24000, cancelled:true },
];
const INIT_TABLES = [
  {id:1,number:1,capacity:2},{id:2,number:2,capacity:4},
  {id:3,number:3,capacity:4},{id:4,number:4,capacity:6},
  {id:5,number:5,capacity:2},{id:6,number:6,capacity:8},
];

const fmt = p => new Intl.NumberFormat("fr-CM",{style:"currency",currency:"XAF",maximumFractionDigits:0}).format(p);

// SVG ICONS
const IcGrid  = ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcMenu  = ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const IcQR    = ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="17" x2="20" y2="17"/><line x1="17" y1="14" x2="17" y2="20"/></svg>;
const IcClock = ({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcUser  = ({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcImg   = ({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcEdit  = ({s=13})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash = ({s=13})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcEye   = ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcEyeOff=({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcPrint = ({s=13})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IcDl    = ({s=13})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// ── IMAGE UPLOAD ──────────────────────────────────────────────────────
function ImageUpload({ value, onChange, height=160, label="Ajouter une image" }) {
  const ref = useRef();
  const onFile = e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => onChange(ev.target.result);
    r.readAsDataURL(f); e.target.value="";
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={onFile}/>
      <div className={`upload-zone ${value?"filled":""}`} style={value?{height}:{minHeight:height}} onClick={()=>ref.current.click()}>
        {value ? (
          <>
            <img src={value} alt="aperçu"/>
            <div className="upload-ov">
              <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();ref.current.click();}}>Changer</button>
              <button className="btn btn-danger btn-sm"  onClick={e=>{e.stopPropagation();onChange(null);}}>Supprimer</button>
            </div>
          </>
        ) : (
          <>
            <div style={{color:"var(--grey-400)"}}><IcImg s={30}/></div>
            <span className="upload-text">{label}</span>
            <span className="upload-sub">JPG, PNG, WEBP — cliquer pour choisir</span>
          </>
        )}
      </div>
    </>
  );
}

// ── QR CODE SVG ───────────────────────────────────────────────────────
function QRCode({ table, size=190 }) {
  const n=21, cell=size/n, cells=[];
  for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    const TL=r<7&&c<7, TR=r<7&&c>=n-7, BL=r>=n-7&&c<7;
    const inBox=(r,c,r0,r1,c0,c1)=>r>=r0&&r<=r1&&c>=c0&&c<=c1;
    const border=(r,c,r0,r1,c0,c1)=>inBox(r,c,r0,r1,c0,c1)&&(r===r0||r===r1||c===c0||c===c1);
    const inner=(r,c,r0,r1,c0,c1)=>inBox(r,c,r0+2,r1-2,c0+2,c1-2);
    let f=false;
    if(TL) f=border(r,c,0,6,0,6)||inner(r,c,0,6,0,6);
    else if(TR) f=border(r,c,0,6,n-7,n-1)||inner(r,c,0,6,n-7,n-1);
    else if(BL) f=border(r,c,n-7,n-1,0,6)||inner(r,c,n-7,n-1,0,6);
    else if(r===6&&c>=8&&c<n-8) f=c%2===0;
    else if(c===6&&r>=8&&r<n-8) f=r%2===0;
    else { const h=Math.abs(Math.sin((r*n+c+1)*table*127.1+311.7)*2147483647); f=h%3<1.45; }
    if(f) cells.push([r,c]);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
      <rect width={size} height={size} fill="white" rx={8}/>
      {cells.map(([r,c])=><rect key={`${r}-${c}`} x={c*cell+0.5} y={r*cell+0.5} width={cell-1} height={cell-1} fill="#0a0a0a" rx={1}/>)}
      <rect x={size/2-22} y={size/2-11} width={44} height={22} fill="white" rx={5}/>
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={12} fontWeight="800" fill="#e8420a" fontFamily="DM Sans,sans-serif">T·{table}</text>
    </svg>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head"><h2>{title}</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
        {footer&&<div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────
function Dashboard({ dishes, cats, tables }) {
  const active = dishes.filter(d=>d.active).length;
  const today  = new Date().toISOString().slice(0,10);

  // Filter state
  const [fDate,   setFDate]   = useState("");
  const [fCat,    setFCat]    = useState("");
  const [fMin,    setFMin]    = useState("");
  const [fMax,    setFMax]    = useState("");
  const [fCancel, setFCancel] = useState("all"); // all | yes | no

  // Apply filters
  const filtered = FAKE_ORDERS.filter(o => {
    if (fDate   && o.date !== fDate)                          return false;
    if (fCat    && String(o.catId) !== fCat)                  return false;
    if (fMin    && o.total < Number(fMin))                    return false;
    if (fMax    && o.total > Number(fMax))                    return false;
    if (fCancel === "yes" && !o.cancelled)                    return false;
    if (fCancel === "no"  &&  o.cancelled)                    return false;
    return true;
  });

  const totalCA    = filtered.filter(o=>!o.cancelled).reduce((s,o)=>s+o.total,0);
  const cancelled  = filtered.filter(o=>o.cancelled).length;

  const resetFilters = () => { setFDate(""); setFCat(""); setFMin(""); setFMax(""); setFCancel("all"); };

  // Group dishes by category for aperçu
  const dishesBycat = cats.map(cat => ({
    ...cat,
    items: dishes.filter(d => d.catId === cat.id)
  })).filter(c => c.items.length > 0);

  return (
    <div>
      {/* ── Stats cards ── */}
      <div className="stats-grid">
        {[
          {label:"Plats actifs",       value:active,             sub:`sur ${dishes.length} au total`,       cls:"ca"},
          {label:"Catégories",         value:cats.length,        sub:"dans la carte",                       cls:"cg"},
          {label:"Tables",             value:tables.length,      sub:"QR codes générés",                    cls:"cy"},
          {label:"Chiffre d'affaires", value:fmt(totalCA),       sub:`${filtered.filter(o=>!o.cancelled).length} commandes`,  cls:"ca"},
          {label:"Commandes annulées", value:cancelled,          sub:`sur ${filtered.length} au total`,     cls:""},
        ].map((s,i)=>(
          <div key={i} className={`stat-card ${s.cls}`} style={i===4?{borderTop:"3px solid var(--red)"}:{}}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={i===3?{fontSize:22,paddingTop:6}:i===4?{color:"var(--red)"}:{}}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{marginBottom:24}}>
        <div className="card-head">
          <h3>Filtres</h3>
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>↺ Réinitialiser</button>
        </div>
        <div className="card-body" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          <div className="fg">
            <label className="fl">Date</label>
            <input className="fi" type="date" value={fDate} onChange={e=>setFDate(e.target.value)}/>
          </div>
          <div className="fg">
            <label className="fl">Catégorie</label>
            <select className="fi" value={fCat} onChange={e=>setFCat(e.target.value)}>
              <option value="">Toutes</option>
              {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">CA min (FCFA)</label>
            <input className="fi" type="number" placeholder="0" value={fMin} onChange={e=>setFMin(e.target.value)}/>
          </div>
          <div className="fg">
            <label className="fl">CA max (FCFA)</label>
            <input className="fi" type="number" placeholder="999999" value={fMax} onChange={e=>setFMax(e.target.value)}/>
          </div>
          <div className="fg">
            <label className="fl">Commandes annulées</label>
            <select className="fi" value={fCancel} onChange={e=>setFCancel(e.target.value)}>
              <option value="all">Toutes</option>
              <option value="no">Non annulées</option>
              <option value="yes">Annulées uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Aperçu par catégorie ── */}
      <div className="card">
        <div className="card-head"><h3>Aperçu des plats par catégorie</h3>
          <span style={{fontSize:12,color:"var(--grey-400)"}}>{dishes.length} plats · {cats.length} catégories</span>
        </div>
        {dishesBycat.map(cat => (
          <div key={cat.id}>
            {/* Category header */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 22px 8px",background:"var(--grey-50)",borderBottom:"1px solid var(--grey-100)"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"var(--grey-100)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {cat.img ? <img src={cat.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={cat.name}/> : <div style={{color:"var(--grey-400)"}}><IcImg s={16}/></div>}
              </div>
              <span style={{fontFamily:"Fraunces,serif",fontWeight:700,fontSize:15,color:"var(--black)"}}>{cat.name}</span>
              <span style={{fontSize:11,color:"var(--grey-400)",background:"var(--grey-100)",padding:"2px 8px",borderRadius:99}}>{cat.items.length} plat{cat.items.length>1?"s":""}</span>
            </div>
            {/* Dishes in this category */}
            {cat.items.map(d=>(
              <div key={d.id} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 22px 10px 42px",borderBottom:"1px solid var(--grey-100)"}}>
                <div style={{width:40,height:40,borderRadius:8,background:"var(--grey-100)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {d.img ? <img src={d.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={d.name}/> : <div style={{color:"var(--grey-300)"}}><IcImg s={18}/></div>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14}}>{d.name}</div>
                  <div style={{fontSize:11,color:"var(--grey-400)"}}>{d.desc?.slice(0,60)}{d.desc?.length>60?"…":""}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,color:"var(--accent)",fontSize:14}}>{fmt(d.price)}</div>
                  <div style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"var(--grey-100)",color:"var(--grey-600)"}}>
                    📦 {d.stock ?? 0} dispo
                  </div>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:99,background:d.active?"var(--green-light)":"var(--grey-100)",color:d.active?"var(--green)":"var(--grey-400)"}}>{d.active?"Actif":"Masqué"}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MENU MANAGER ──────────────────────────────────────────────────────
function MenuManager({ cats, setCats, dishes, setDishes, showToast }) {
  const [activeCat, setActiveCat] = useState(cats[0]?.id);
  const [showDish,  setShowDish]  = useState(false);
  const [showCat,   setShowCat]   = useState(false);
  const [editDish,  setEditDish]  = useState(null);
  const [editCat,   setEditCat]   = useState(null);
  const [form,  setForm]  = useState({name:"",desc:"",price:"",img:null,active:true,stock:10});
  const [catF,  setCatF]  = useState({name:"",img:null});
  const catImgRef = useRef({});

  const filtered = dishes.filter(d=>d.catId===activeCat);
  const openNew  = ()=>{ setEditDish(null); setForm({name:"",desc:"",price:"",img:null,active:true,stock:10}); setShowDish(true); };
  const openEdit = d=>{ setEditDish(d); setForm({name:d.name,desc:d.desc,price:d.price,img:d.img,active:d.active,stock:d.stock??10}); setShowDish(true); };

  const saveDish = ()=>{
    if(!form.name||!form.price) return;
    if(editDish){ setDishes(p=>p.map(d=>d.id===editDish.id?{...d,...form,price:Number(form.price),stock:Number(form.stock)}:d)); showToast("Plat modifié ✓"); }
    else { setDishes(p=>[...p,{id:Date.now(),catId:activeCat,...form,price:Number(form.price),stock:Number(form.stock)}]); showToast("Plat ajouté ✓"); }
    setShowDish(false);
  };
  const delDish   = id=>{ setDishes(p=>p.filter(d=>d.id!==id)); showToast("Plat supprimé"); };
  const togDish   = id=>{ setDishes(p=>p.map(d=>d.id===id?{...d,active:!d.active}:d)); };
  const adjStock  = (id, delta)=>{ setDishes(p=>p.map(d=>d.id===id?{...d,stock:Math.max(0,(d.stock??0)+delta)}:d)); };

  // Category image upload inline
  const handleCatImg = (catId, e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => { setCats(p=>p.map(c=>c.id===catId?{...c,img:ev.target.result}:c)); showToast("Image mise à jour ✓"); };
    r.readAsDataURL(f); e.target.value="";
  };

  const openEditCat = (cat,e) => { e.stopPropagation(); setEditCat(cat); setCatF({name:cat.name,img:cat.img}); setShowCat(true); };
  const openNewCat  = () => { setEditCat(null); setCatF({name:"",img:null}); setShowCat(true); };

  const saveCat = ()=>{
    if(!catF.name) return;
    if(editCat){ setCats(p=>p.map(c=>c.id===editCat.id?{...c,name:catF.name,img:catF.img}:c)); showToast("Catégorie modifiée ✓"); }
    else { setCats(p=>[...p,{id:Date.now(),name:catF.name,img:catF.img}]); showToast("Catégorie créée ✓"); }
    setShowCat(false);
  };
  const delCat = (id,e)=>{
    e.stopPropagation();
    if(dishes.find(d=>d.catId===id)) { showToast("❌ Supprimez d'abord les plats de cette catégorie"); return; }
    setCats(p=>p.filter(c=>c.id!==id));
    if(activeCat===id) setActiveCat(cats.find(c=>c.id!==id)?.id);
    showToast("Catégorie supprimée");
  };

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Menu &amp; Plats</div><div className="sec-sub">{dishes.length} plats · {cats.length} catégories</div></div>
        <button className="btn btn-primary" onClick={openNew}>+ Nouveau plat</button>
      </div>
      <div className="two-col">
        {/* ── Catégories ── */}
        <div className="card">
          <div className="card-head"><h3>Catégories</h3><button className="btn btn-ghost btn-sm" onClick={openNewCat}>+ Ajouter</button></div>
          <div className="card-body">
            {cats.map(cat=>{
              const count = dishes.filter(d=>d.catId===cat.id).length;
              return (
                <div key={cat.id} className={`cat-item ${activeCat===cat.id?"active":""}`} onClick={()=>setActiveCat(cat.id)}
                  style={{justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
                    {/* Clickable image thumbnail */}
                    <div className="cat-thumb" style={{cursor:"pointer",position:"relative",overflow:"visible"}}
                      title="Cliquer pour changer l'image"
                      onClick={e=>{e.stopPropagation();catImgRef.current[cat.id]?.click();}}>
                      {cat.img
                        ? <img src={cat.img} alt={cat.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/>
                        : <div style={{color:"var(--grey-400)",display:"flex",alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}}><IcImg s={18}/></div>
                      }
                      <div style={{
                        position:"absolute",inset:0,background:"rgba(232,66,10,0.75)",borderRadius:8,
                        display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.15s",
                      }} className="cat-img-hover">
                        <IcEdit s={12}/>
                      </div>
                      <input ref={el=>catImgRef.current[cat.id]=el} type="file" accept="image/*" style={{display:"none"}}
                        onChange={e=>handleCatImg(cat.id,e)}/>
                    </div>
                    <div>
                      <div className="cat-name">{cat.name}</div>
                      <div className="cat-count">{count} plat{count!==1?"s":""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" title="Modifier" onClick={e=>openEditCat(cat,e)}><IcEdit s={12}/></button>
                    <button className="btn btn-danger btn-sm" title="Supprimer" onClick={e=>delCat(cat.id,e)}><IcTrash s={12}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Plats ── */}
        <div>
          {filtered.length===0 ? (
            <div className="empty">
              <div style={{color:"var(--grey-300)"}}><IcImg s={44}/></div>
              <h3>Aucun plat ici</h3>
              <p>Ajoutez votre premier plat dans cette catégorie</p>
            </div>
          ) : (
            <div className="dish-grid">
              {filtered.map(dish=>(
                <div key={dish.id} className="dish-card">
                  <div className="dish-img">
                    {dish.img ? <img src={dish.img} alt={dish.name}/> : (
                      <div className="dish-img-ph">
                        <div style={{color:"var(--grey-300)"}}><IcImg s={32}/></div>
                        <span>Pas d'image</span>
                      </div>
                    )}
                    <span className={`status-pill ${dish.active?"s-on":"s-off"}`}>{dish.active?"Actif":"Masqué"}</span>
                  </div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.name}</div>
                    <div className="dish-desc">{dish.desc}</div>
                    {/* Stock control */}
                    <div style={{display:"flex",alignItems:"center",gap:8,margin:"8px 0",padding:"6px 10px",background:"var(--grey-50)",borderRadius:8}}>
                      <span style={{fontSize:11,fontWeight:700,color:"var(--grey-600)",flex:1}}>📦 Plats dispo</span>
                      <button onClick={()=>adjStock(dish.id,-1)}
                        style={{width:22,height:22,borderRadius:99,border:"1.5px solid var(--grey-200)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--grey-600)"}}>−</button>
                      <span style={{fontWeight:800,fontSize:14,minWidth:24,textAlign:"center",color:"var(--black)"}}>{dish.stock??0}</span>
                      <button onClick={()=>adjStock(dish.id,+1)}
                        style={{width:22,height:22,borderRadius:99,border:"1.5px solid var(--accent)",background:"var(--accent-light)",cursor:"pointer",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)"}}>+</button>
                    </div>
                    <div className="dish-foot">
                      <div className="dish-price">{fmt(dish.price)}</div>
                      <div className="dish-acts">
                        <button className="btn btn-ghost btn-sm" title={dish.active?"Masquer":"Activer"} onClick={()=>togDish(dish.id)}>
                          {dish.active ? <IcEye/> : <IcEyeOff/>}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(dish)}><IcEdit/></button>
                        <button className="btn btn-danger btn-sm"    onClick={()=>delDish(dish.id)}><IcTrash/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal plat */}
      {showDish && (
        <Modal title={editDish?"Modifier le plat":"Nouveau plat"} onClose={()=>setShowDish(false)}
          footer={<><button className="btn btn-ghost" onClick={()=>setShowDish(false)}>Annuler</button><button className="btn btn-primary" onClick={saveDish}>Enregistrer</button></>}>
          <div className="fg"><label className="fl">Photo du plat</label><ImageUpload value={form.img} onChange={v=>setForm(f=>({...f,img:v}))} height={160} label="Ajouter une photo du plat"/></div>
          <div className="fg"><label className="fl">Nom du plat *</label><input className="fi" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex : Poulet rôti aux herbes"/></div>
          <div className="fg"><label className="fl">Description</label><textarea className="fi" rows={3} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Ingrédients, accompagnements..." style={{resize:"vertical"}}/></div>
          <div className="f-row">
            <div className="fg"><label className="fl">Prix (FCFA) *</label><input className="fi" type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="15000"/></div>
            <div className="fg"><label className="fl">Quantité disponible</label><input className="fi" type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="10"/></div>
          </div>
          <div className="t-row">
            <span style={{fontSize:14,fontWeight:500}}>Plat disponible à la commande</span>
            <button className={`toggle ${form.active?"on":""}`} onClick={()=>setForm(f=>({...f,active:!f.active}))}/>
          </div>
        </Modal>
      )}

      {/* Modal catégorie */}
      {showCat && (
        <Modal title={editCat?"Modifier la catégorie":"Nouvelle catégorie"} onClose={()=>setShowCat(false)}
          footer={<><button className="btn btn-ghost" onClick={()=>setShowCat(false)}>Annuler</button><button className="btn btn-primary" onClick={saveCat}>{editCat?"Modifier":"Créer"}</button></>}>
          <div className="fg"><label className="fl">Image de la catégorie</label><ImageUpload value={catF.img} onChange={v=>setCatF(f=>({...f,img:v}))} height={120} label="Ajouter une image"/></div>
          <div className="fg"><label className="fl">Nom *</label><input className="fi" value={catF.name} onChange={e=>setCatF(f=>({...f,name:e.target.value}))} placeholder="Ex : Spécialités du chef"/></div>
        </Modal>
      )}
    </div>
  );
}

// ── TABLE MANAGER ─────────────────────────────────────────────────────
function TableManager({ tables, setTables, showToast }) {
  const [sel,       setSel]   = useState(null);
  const [showModal, setModal] = useState(false);
  const [editTable, setEdit]  = useState(null); // null = new, object = edit
  const [form,      setForm]  = useState({number:"",capacity:4});
  const qrRef = useRef(null);

  // ── Save (add or edit) ──
  const save = () => {
    if (!form.number) return;
    if (editTable) {
      // editing existing table
      setTables(p => p.map(t => t.id === editTable.id
        ? { ...t, number: Number(form.number), capacity: Number(form.capacity) }
        : t
      ));
      if (sel?.id === editTable.id) setSel(t => ({ ...t, number: Number(form.number), capacity: Number(form.capacity) }));
      showToast("Table modifiée ✓");
    } else {
      if (tables.find(t => t.number === Number(form.number))) { showToast("Ce numéro existe déjà"); return; }
      const t = { id: Date.now(), number: Number(form.number), capacity: Number(form.capacity) };
      setTables(p => [...p, t]); setSel(t);
      showToast("Table ajoutée — QR code généré ✓");
    }
    setModal(false); setEdit(null);
  };

  const openAdd  = () => { setEdit(null);  setForm({number:"",capacity:4}); setModal(true); };
  const openEdit = (t,e) => { e.stopPropagation(); setEdit(t); setForm({number:t.number,capacity:t.capacity}); setModal(true); };
  const del      = (id,e) => { e.stopPropagation(); setTables(p=>p.filter(t=>t.id!==id)); if(sel?.id===id) setSel(null); showToast("Table supprimée"); };

  // ── Print QR ──
  const handlePrint = () => {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgStr  = new XMLSerializer().serializeToString(svgEl);
    const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>QR Code Table ${sel.number}</title>
      <style>
        body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff;}
        img{width:260px;height:260px;}
        h2{margin:16px 0 4px;font-size:22px;}
        p{font-size:13px;color:#888;margin:0;}
      </style></head>
      <body>
        <img src="${dataUrl}"/>
        <h2>Table ${sel.number}</h2>
        <p>menuflow.app/menu?table=${sel.number}</p>
        <script>window.onload=()=>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  };

  // ── Download PNG ──
  const handleDownload = () => {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;
    const size   = 400;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const img    = new Image();
    img.onload = () => {
      const canvas  = document.createElement("canvas");
      canvas.width  = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,size,size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `QR-Table-${sel.number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
    showToast("Téléchargement en cours… ✓");
  };

  return (
    <div>
      <div className="sec-head">
        <div><div className="sec-title">Tables &amp; QR Codes</div><div className="sec-sub">{tables.length} tables configurées</div></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter une table</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"}}>
        {/* ── Grid de tables ── */}
        <div className="tables-grid">
          {[...tables].sort((a,b)=>a.number-b.number).map(t=>(
            <div key={t.id} className={`tcard ${sel?.id===t.id?"sel":""}`} onClick={()=>setSel(t)}>
              <div className="t-num">{t.number}</div>
              <div className="t-lbl">Table</div>
              <div className="t-cap">{t.capacity} pers.</div>
              <div style={{display:"flex",gap:6,marginTop:8}} onClick={e=>e.stopPropagation()}>
                <button className="btn btn-secondary btn-sm" onClick={e=>openEdit(t,e)}>
                  <IcEdit s={11}/> Modifier
                </button>
                <button className="btn btn-danger btn-sm" onClick={e=>del(t.id,e)}>
                  <IcTrash s={11}/> Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Panneau QR ── */}
        <div>
          {sel ? (
            <div className="qr-panel" style={{position:"relative"}}>
              {/* Bouton fermer */}
              <button onClick={()=>setSel(null)} style={{
                position:"absolute",top:12,right:12,width:28,height:28,borderRadius:"50%",
                border:"1.5px solid var(--grey-200)",background:"var(--white)",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,
                fontSize:14,color:"var(--grey-600)",transition:"all 0.15s",lineHeight:1,
              }} title="Fermer">✕</button>

              <div className="qr-lbl">QR Code</div>
              <div className="qr-title">Table {sel.number}</div>
              <div className="qr-wrap" ref={qrRef}>
                <QRCode table={sel.number} size={190}/>
              </div>
              <div className="qr-url">menuflow.app/menu?table={sel.number}</div>
              <div className="qr-btns">
                <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                  <IcPrint/> Imprimer
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleDownload}>
                  <IcDl/> PNG
                </button>
              </div>
              <div className="qr-meta">
                <strong>Capacité :</strong> {sel.capacity} personnes<br/>
                <strong>URL :</strong> /menu?table={sel.number}
              </div>
            </div>
          ) : (
            <div className="qr-panel" style={{gap:10}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--grey-200)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                <line x1="14" y1="17" x2="20" y2="17"/><line x1="17" y1="14" x2="17" y2="20"/>
              </svg>
              <div style={{fontFamily:"Fraunces,serif",fontSize:16,fontWeight:700,color:"var(--grey-600)",textAlign:"center"}}>Sélectionnez une table</div>
              <div style={{fontSize:13,color:"var(--grey-400)",textAlign:"center"}}>Son QR code apparaîtra ici</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ajouter / modifier ── */}
      {showModal && (
        <Modal title={editTable ? `Modifier la Table ${editTable.number}` : "Nouvelle table"}
          onClose={()=>{setModal(false);setEdit(null);}}
          footer={
            <>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setEdit(null);}}>Annuler</button>
              <button className="btn btn-primary" onClick={save}>{editTable?"Enregistrer":"Ajouter"}</button>
            </>
          }>
          <div className="f-row">
            <div className="fg">
              <label className="fl">Numéro *</label>
              <input className="fi" type="number" value={form.number}
                onChange={e=>setForm(f=>({...f,number:e.target.value}))} placeholder="7"/>
            </div>
            <div className="fg">
              <label className="fl">Capacité</label>
              <select className="fi" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}>
                {[1,2,3,4,5,6,7,8,10,12].map(n=><option key={n} value={n}>{n} personnes</option>)}
              </select>
            </div>
          </div>
          {!editTable && (
            <div style={{background:"var(--accent-light)",borderRadius:"var(--radius-sm)",padding:"12px 16px",fontSize:13,color:"var(--accent)",display:"flex",gap:8}}>
              <span>🔗</span><span>Un QR code unique sera automatiquement généré pour cette table.</span>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}


export { LoginScreen, ProfileModal, ProfileTrigger, ImageUpload, QRCode, Modal, Dashboard, MenuManager, TableManager, AUTH_CSS, DEFAULT_ACCOUNTS, ADMIN_STYLES, INIT_CATS, INIT_DISHES, FAKE_ORDERS, INIT_TABLES, fmt, IcGrid, IcMenu, IcQR, IcClock, IcUser, IcImg, IcEdit, IcTrash, IcEye, IcEyeOff, IcPrint, IcDl };
