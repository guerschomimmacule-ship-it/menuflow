import React, { useState, useEffect, useRef } from "react";
import "./style.css";


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





function AdminApp() {
  const [user, setUser] = useState(()=>{
    try { const s=localStorage.getItem("mf_session_admin"); return s?JSON.parse(s):null; } catch{ return null; }
  });
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = u => { localStorage.setItem("mf_session_admin", JSON.stringify(u)); setUser(u); };
  const handleUpdate = u => { localStorage.setItem("mf_session_admin", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("mf_session_admin"); setUser(null); };

  if (!user) return <LoginScreen roleKey="admin" onLogin={handleLogin}/>;

  return <AdminMain user={user} onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={handleUpdate} onLogout={handleLogout}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}

function AdminMain({ user, onShowProfile, onUpdateUser, onLogout, showProfile, onCloseProfile }) {
  const [page,setPage]       = useState("dashboard");
  const [cats,setCats]       = useState(INIT_CATS);
  const [dishes,setDishes]   = useState(INIT_DISHES);
  const [tables,setTables]   = useState(INIT_TABLES);
  const [toast,setToast]     = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),2800); };

  const nav = [
    { id:"dashboard", label:"Tableau de bord", icon:<IcGrid/> },
    { id:"menu",      label:"Menu & Plats",    icon:<IcMenu/> },
    { id:"tables",    label:"Tables & QR",     icon:<IcQR/>   },
  ];
  const titles = { dashboard:"Tableau de bord", menu:"Menu & Plats", tables:"Tables & QR Codes" };
  const initials = user.name ? user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "R";

  return (
    <>
      {showProfile && (
        <ProfileModal user={user} roleKey="admin"
          onUpdate={onUpdateUser} onClose={onCloseProfile} onLogout={onLogout}/>
      )}
      <div className="app">
        <aside className="sidebar">
          <div className="s-logo">
            <h1>Menu<span>Flow</span></h1>
            <p>Administration</p>
          </div>
          <nav className="s-nav">
            <div className="s-section">
              <div className="s-lbl">Navigation</div>
              {nav.map(n=>(
                <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                  <span className="nav-icon">{n.icon}</span>{n.label}
                </div>
              ))}
            </div>
            <div className="s-section">
              <div className="s-lbl">Interfaces</div>
              {[{label:"Vue Cuisine",icon:<IcClock/>},{label:"Vue Client",icon:<IcUser/>}].map(n=>(
                <div key={n.label} className="nav-item" onClick={()=>showToast(`${n.label} — prochainement`)}>
                  <span className="nav-icon">{n.icon}</span>{n.label}
                </div>
              ))}
            </div>
          </nav>
          <div className="s-foot">
            <div className="r-badge" style={{cursor:"pointer"}} onClick={onShowProfile}>
              <div className="r-av" style={{overflow:"hidden"}}>
                {user.avatar ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
              </div>
              <div>
                <div className="r-name">{user.name}</div>
                <div className="r-role">{user.role}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{titles[page]}</div>
            <div className="topbar-right">
              <span style={{fontSize:13,color:"var(--grey-400)"}}>{dishes.filter(d=>d.active).length} plats actifs</span>
              <span className="badge">{tables.length} tables</span>
              <ProfileTrigger user={user} onClick={onShowProfile}/>
            </div>
          </div>
          <div className="content">
            {page==="dashboard" && <Dashboard dishes={dishes} cats={cats} tables={tables}/>}
            {page==="menu"      && <MenuManager cats={cats} setCats={setCats} dishes={dishes} setDishes={setDishes} showToast={showToast}/>}
            {page==="tables"    && <TableManager tables={tables} setTables={setTables} showToast={showToast}/>}
          </div>
        </main>
      </div>
      {toast && <div className="toast"><div className="t-dot"/>{toast}</div>}
    </>
  );
}


/* ─────────────────────────────────────────────
   FONTS
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CUISINE_CSS = ``;

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   TIMER HOOK
───────────────────────────────────────────── */



let ORDER_ID = 1000;
const mkId = () => `#${++ORDER_ID}`;
const now = () => Date.now();

const SAMPLE_ORDERS = [
  {
    id: mkId(), table: 3, status: "new", createdAt: now() - 2*60*1000,
    note: "Sans gluten pour le plat principal",
    items: [
      { id:1, name:"Salade César",    qty:1, note:"", done:false },
      { id:2, name:"Steak Frites",    qty:2, note:"Bien cuit", done:false },
      { id:3, name:"Eau minérale",    qty:2, note:"", done:false },
    ]
  },
  {
    id: mkId(), table: 7, status: "new", createdAt: now() - 4*60*1000,
    note: "",
    items: [
      { id:4, name:"Soupe à l'oignon",qty:1, note:"", done:false },
      { id:5, name:"Saumon grillé",   qty:1, note:"Sauce à part", done:false },
    ]
  },
  {
    id: mkId(), table: 1, status: "prep", createdAt: now() - 9*60*1000,
    note: "",
    items: [
      { id:6, name:"Poulet rôti",     qty:2, note:"", done:true  },
      { id:7, name:"Fondant chocolat",qty:1, note:"", done:false },
      { id:8, name:"Jus d'orange",    qty:2, note:"", done:true  },
    ]
  },
  {
    id: mkId(), table: 5, status: "prep", createdAt: now() - 14*60*1000,
    note: "",
    items: [
      { id:9, name:"Carpaccio",       qty:1, note:"", done:true  },
      { id:10,name:"Steak Frites",    qty:1, note:"Saignant", done:true  },
    ]
  },
  {
    id: mkId(), table: 2, status: "ready", createdAt: now() - 18*60*1000,
    note: "",
    items: [
      { id:11,name:"Tarte Tatin",     qty:2, note:"", done:true  },
      { id:12,name:"Eau minérale",    qty:1, note:"", done:true  },
    ]
  },
  {
    id: mkId(), table: 4, status: "done", createdAt: now() - 35*60*1000,
    note: "",
    items: [
      { id:13,name:"Salade César",    qty:2, note:"", done:true  },
    ]
  },
];

/* ─────────────────────────────────────────────
   TIMER HOOK
───────────────────────────────────────────── */
function useTimer(createdAt) {
  const [elapsed, setElapsed] = useState(Math.floor((now()-createdAt)/1000));
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((now()-createdAt)/1000)), 1000);
    return () => clearInterval(iv);
  }, [createdAt]);
  const m = Math.floor(elapsed/60), s = elapsed%60;
  const cls = elapsed > 15*60 ? "urgent" : elapsed > 8*60 ? "warn" : "ok";
  return { label: `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`, cls, elapsed };
}

/* ─────────────────────────────────────────────
   CLOCK
───────────────────────────────────────────── */
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const iv=setInterval(()=>setT(new Date()),1000); return()=>clearInterval(iv); },[]);
  return <span className="clock">{t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>;
}

/* ─────────────────────────────────────────────
   TIMER BADGE
───────────────────────────────────────────── */
function TimerBadge({ createdAt }) {
  const { label, cls } = useTimer(createdAt);
  return (
    <span className={`timer ${cls}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────────── */
function OrderCard({ order, onAction, onToggleItem }) {
  const { elapsed } = useTimer(order.createdAt);
  const urgent = elapsed > 15*60;
  const allDone = order.items.every(i=>i.done);

  return (
    <div className={`order-card ${urgent?"urgent":""}`}>
      {/* Header */}
      <div className="order-top">
        <div>
          <div className="order-table">
            Table {order.table}
            <span>{order.id}</span>
          </div>
        </div>
        <TimerBadge createdAt={order.createdAt} />
      </div>

      {/* Note */}
      {order.note && (
        <div className="order-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {order.note}
        </div>
      )}

      {/* Items */}
      <div className="order-items">
        {order.items.map(item => (
          <div key={item.id} className="order-item">
            <div className="item-qty">{item.qty}</div>
            <div style={{flex:1}}>
              <div className="item-name" style={item.done?{textDecoration:"line-through",opacity:0.45}:{}}>{item.name}</div>
              {item.note && <div className="item-note">↳ {item.note}</div>}
            </div>
            {order.status==="prep" && (
              <div
                className={`item-check ${item.done?"done":""}`}
                onClick={()=>onToggleItem(order.id, item.id)}
              >
                {item.done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="order-divider"/>

      {/* Actions */}
      <div className="order-actions">
        {order.status==="new" && (<>
          <button className="act-btn btn-confirm" onClick={()=>onAction(order.id,"prep")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Accepter
          </button>
          <button className="act-btn btn-refuse" onClick={()=>onAction(order.id,"refused")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Refuser
          </button>
        </>)}
        {order.status==="prep" && (
          <button className="act-btn btn-ready" disabled={!allDone} onClick={()=>onAction(order.id,"ready")}
            style={!allDone?{opacity:0.45,cursor:"not-allowed"}:{}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            {allDone ? "Prêt à servir" : `${order.items.filter(i=>i.done).length}/${order.items.length} fait`}
          </button>
        )}
        {order.status==="ready" && (
          <button className="act-btn btn-serve" onClick={()=>onAction(order.id,"done")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Marquer servi
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONE CARD (historique compact)
───────────────────────────────────────────── */
function DoneCard({ order }) {
  const elapsed = Math.floor((now()-order.createdAt)/1000/60);
  return (
    <div className="done-card">
      <div className="done-info">
        <div className="done-table">Table {order.table} <span style={{fontSize:10,color:"var(--muted)",fontFamily:"JetBrains Mono,monospace",fontWeight:400}}>{order.id}</span></div>
        <div className="done-meta">{order.items.length} article{order.items.length>1?"s":""} · il y a {elapsed} min</div>
      </div>
      <div className="done-check">✓</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NEW ORDER MODAL
───────────────────────────────────────────── */
function NewOrderModal({ onClose, onAdd }) {
  const [table, setTable] = useState("");
  const [lines, setLines] = useState([{name:"",qty:1,note:""}]);
  const addLine = () => setLines(p=>[...p,{name:"",qty:1,note:""}]);
  const updLine = (i,k,v) => setLines(p=>p.map((l,j)=>j===i?{...l,[k]:v}:l));
  const submit  = () => {
    if(!table) return;
    const items = lines.filter(l=>l.name.trim()).map((l,i)=>({id:Date.now()+i,name:l.name,qty:Number(l.qty)||1,note:l.note,done:false}));
    if(!items.length) return;
    onAdd({ id:mkId(), table:Number(table), status:"new", createdAt:now(), note:"", items });
    onClose();
  };
  return (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>Nouvelle commande manuelle</h2>
        </div>
        <div className="modal-body">
          <div className="fg">
            <label className="fl">Numéro de table</label>
            <input className="fi" type="number" value={table} onChange={e=>setTable(e.target.value)} placeholder="Ex : 4"/>
          </div>
          <label className="fl" style={{marginBottom:10}}>Articles</label>
          {lines.map((l,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"40px 1fr 100px",gap:8,marginBottom:8}}>
              <input className="fi" type="number" min="1" value={l.qty} onChange={e=>updLine(i,"qty",e.target.value)} style={{padding:"8px 10px",textAlign:"center"}}/>
              <input className="fi" value={l.name} onChange={e=>updLine(i,"name",e.target.value)} placeholder="Nom du plat"/>
              <input className="fi" value={l.note} onChange={e=>updLine(i,"note",e.target.value)} placeholder="Note"/>
            </div>
          ))}
          <button onClick={addLine} style={{marginTop:4,background:"none",border:"1px dashed var(--border2)",borderRadius:"var(--radius-sm)",padding:"7px 14px",color:"var(--muted2)",cursor:"pointer",fontSize:12,fontFamily:"JetBrains Mono,monospace",width:"100%"}}>
            + Ajouter une ligne
          </button>
        </div>
        <div className="modal-foot">
          <button className="modal-btn" onClick={onClose}>Annuler</button>
          <button className="modal-btn primary" onClick={submit}>Créer la commande</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REFUSE MODAL
───────────────────────────────────────────── */
function RefuseModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head"><h2>Refuser la commande</h2></div>
        <div className="modal-body">
          <p style={{fontSize:13,color:"var(--muted2)",marginBottom:16}}>
            Table {order.table} · {order.id}<br/>
            <span style={{color:"var(--refuse)",fontSize:12}}>Cette action est irréversible. Le client sera notifié.</span>
          </p>
          <div className="fg">
            <label className="fl">Motif du refus (optionnel)</label>
            <input className="fi" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ex : Rupture de stock…"/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="modal-btn" onClick={onClose}>Annuler</button>
          <button className="modal-btn danger" onClick={()=>onConfirm(reason)}>Confirmer le refus</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP
───────────────────────────────────────────── */
function CuisineMain({ user, onShowProfile, onUpdateUser, onLogout, showProfile, onCloseProfile }) {
  const [orders,    setOrders]    = useState(SAMPLE_ORDERS);
  const [view,      setView]      = useState("all");
  const [notify,    setNotify]    = useState(null);
  const [showNew,   setShowNew]   = useState(false);
  const [refuseFor, setRefuseFor] = useState(null);
  const notifyTimer = useRef(null);

  const push = (msg) => {
    setNotify(msg);
    clearTimeout(notifyTimer.current);
    notifyTimer.current = setTimeout(()=>setNotify(null), 3500);
  };

  useEffect(()=>{
    const iv = setInterval(()=>{
      const dishes = ["Poulet rôti","Salade César","Fondant chocolat","Saumon grillé","Eau minérale","Steak Frites"];
      const tableNum = Math.floor(Math.random()*10)+1;
      const qty = Math.floor(Math.random()*2)+1;
      const newOrder = {
        id:mkId(), table:tableNum, status:"new", createdAt:now(), note:"",
        items:[{id:Date.now(),name:dishes[Math.floor(Math.random()*dishes.length)],qty,note:"",done:false}]
      };
      setOrders(p=>[newOrder,...p]);
      push(`🔔 Nouvelle commande — Table ${tableNum}`);
    },30000);
    return()=>clearInterval(iv);
  },[]);

  const counts = {
    new:   orders.filter(o=>o.status==="new").length,
    prep:  orders.filter(o=>o.status==="prep").length,
    ready: orders.filter(o=>o.status==="ready").length,
    done:  orders.filter(o=>o.status==="done").length,
  };

  const handleAction = (id, nextStatus) => {
    if (nextStatus === "refused") {
      const o = orders.find(x=>x.id===id);
      setRefuseFor(o); return;
    }
    setOrders(p=>p.map(o=>o.id===id?{...o,status:nextStatus}:o));
    const msgs = { prep:"En préparation ✓", ready:"Prêt à servir ✓", done:"Servi ✓" };
    push(msgs[nextStatus]||"");
  };

  const handleRefuse = (reason) => {
    setOrders(p=>p.map(o=>o.id===refuseFor.id?{...o,status:"refused"}:o));
    push(`Commande refusée${reason?` : ${reason}`:""}`);
    setRefuseFor(null);
  };

  const handleToggleItem = (orderId, itemId) => {
    setOrders(p=>p.map(o=>o.id===orderId?{...o,items:o.items.map(i=>i.id===itemId?{...i,done:!i.done}:i)}:o));
  };

  const handleAdd = (order) => {
    setOrders(p=>[order,...p]);
    push(`🆕 Commande créée — Table ${order.table}`);
  };

  const visibleOrders = (status) => orders.filter(o => o.status===status);

  const COLS = [
    { key:"new",   label:"Nouvelles",    cls:"col-new"   },
    { key:"prep",  label:"En cuisine",   cls:"col-prep"  },
    { key:"ready", label:"Prêtes",       cls:"col-ready" },
    { key:"done",  label:"Servies",      cls:"col-done"  },
  ];

  return (
    <>
      {showProfile && (
        <ProfileModal user={user} roleKey="cuisine" dark
          onUpdate={onUpdateUser} onClose={onCloseProfile} onLogout={onLogout}/>
      )}
      <div className="kitchen">
        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="logo">Menu<span>Flow</span></div>
            <div className="logo-tag">Cuisine</div>
          </div>
          <div className="topbar-center">
            {[{id:"all",label:"Tout"},{id:"new",label:"Nouvelles"},{id:"prep",label:"En cuisine"},{id:"ready",label:"Prêtes"},{id:"done",label:"Historique"}].map(t=>(
              <button key={t.id} className={`tab-btn ${view===t.id?"active":""}`} onClick={()=>setView(t.id)}>
                {t.label}
                {t.id!=="all" && t.id!=="done" && (
                  <span className={`cnt ${counts[t.id]>0?"has":""}`}>{counts[t.id]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="topbar-right">
            <Clock/>
            <div className="service-badge">
              <div className="pulse"/><span>Service ouvert</span>
            </div>
            <button className="modal-btn primary" style={{padding:"6px 14px",fontSize:11}} onClick={()=>setShowNew(true)}>
              + Commande manuelle
            </button>
            <ProfileTrigger user={user} onClick={onShowProfile} dark/>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="stats-bar">
            {[
              {icon:"🟡", label:"Nouvelles",  val:counts.new,   col:"var(--new)",  bg:"var(--new-bg)" },
              {icon:"🔵", label:"En cuisine", val:counts.prep,  col:"var(--prep)", bg:"var(--prep-bg)"},
              {icon:"🟢", label:"Prêtes",     val:counts.ready, col:"var(--ready)",bg:"var(--ready-bg)"},
              {icon:"⚪", label:"Servies",    val:counts.done,  col:"var(--muted2)",bg:"var(--done-bg)"},
            ].map(s=>(
              <div key={s.label} className="stat-pill" style={{"--col":s.col,"--bg":s.bg}}>
                <span className="sp-icon">{s.icon}</span>
                <span className="sp-val">{s.val}</span>
                <span className="sp-lbl">{s.label}</span>
              </div>
            ))}
          </div>

          {view === "all" ? (
            <div className="kanban">
              {COLS.map(col=>(
                <div key={col.key} className={`col ${col.cls}`}>
                  <div className="col-head">
                    <span className="col-title">{col.label}</span>
                    <span className="col-count">{visibleOrders(col.key).length}</span>
                  </div>
                  <div className="col-body">
                    {visibleOrders(col.key).length === 0
                      ? <div className="col-empty"><div className="col-empty-icon">
                          {col.key==="new"?"🕐":col.key==="prep"?"👨‍🍳":col.key==="ready"?"🔔":"✓"}
                        </div><div className="col-empty-txt">Aucune commande</div></div>
                      : col.key === "done"
                        ? visibleOrders("done").map(o=><DoneCard key={o.id} order={o}/>)
                        : visibleOrders(col.key).map(o=>(
                            <OrderCard key={o.id} order={o} onAction={handleAction} onToggleItem={handleToggleItem}/>
                          ))
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding:"0 24px 24px",maxWidth:600}}>
              {view==="done"
                ? (
                  orders.filter(o=>o.status==="done").length===0
                    ? <div className="col-empty" style={{borderColor:"var(--border)",marginTop:24}}><div className="col-empty-icon">✓</div><div className="col-empty-txt">Aucune commande servie pour l'instant</div></div>
                    : orders.filter(o=>o.status==="done").map(o=><DoneCard key={o.id} order={o}/>)
                ) : (
                  orders.filter(o=>o.status===view).length===0
                    ? <div className="col-empty" style={{borderColor:"var(--border)",marginTop:24}}><div className="col-empty-icon">📭</div><div className="col-empty-txt">Aucune commande dans cette colonne</div></div>
                    : orders.filter(o=>o.status===view).map(o=>(
                        <OrderCard key={o.id} order={o} onAction={handleAction} onToggleItem={handleToggleItem}/>
                      ))
                )}
            </div>
          )}
        </div>
      </div>

      {showNew   && <NewOrderModal onClose={()=>setShowNew(false)} onAdd={handleAdd}/>}
      {refuseFor && <RefuseModal   order={refuseFor} onClose={()=>setRefuseFor(null)} onConfirm={handleRefuse}/>}

      {notify && (
        <div className="notify">
          <span className="notify-icon">🔔</span>
          {notify}
        </div>
      )}
    </>
  );
}




const CLIENT_CSS = "";

/* ───────────────── DATA ───────────────── */
function CuisineApp() {
  const [user, setUser] = useState(()=>{
    try { const s=localStorage.getItem("mf_session_cuisine"); return s?JSON.parse(s):null; } catch{ return null; }
  });
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin  = u => { localStorage.setItem("mf_session_cuisine", JSON.stringify(u)); setUser(u); };
  const handleUpdate = u => { localStorage.setItem("mf_session_cuisine", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("mf_session_cuisine"); setUser(null); };

  if (!user) return <LoginScreen roleKey="cuisine" onLogin={handleLogin}/>;
  return <CuisineMain user={user} onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={handleUpdate} onLogout={handleLogout}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}



const CLIENT_FMT = p => new Intl.NumberFormat("fr-CM",{style:"currency",currency:"XAF",maximumFractionDigits:0}).format(p);

const CATS = [
  {id:1, name:"Entrées"},
  {id:2, name:"Plats"},
  {id:3, name:"Desserts"},
  {id:4, name:"Boissons"},
];

const DISHES = [
  {id:1,catId:1,name:"Salade César",   desc:"Laitue romaine, croûtons dorés, parmesan, sauce César maison",      price:8500, img:null},
  {id:2,catId:1,name:"Soupe à l'oignon",desc:"Bouillon de bœuf, oignons confits, gratin emmental",               price:7000, img:null},
  {id:3,catId:1,name:"Carpaccio",      desc:"Bœuf tranché fin, roquette, câpres, huile d'olive et parmesan",     price:12000,img:null},
  {id:4,catId:2,name:"Poulet rôti",    desc:"Poulet fermier rôti, pommes de terre grenaille, jus de volaille",   price:16000,img:null},
  {id:5,catId:2,name:"Steak Frites",   desc:"Entrecôte 250g, frites fraîches maison, sauce au choix",            price:22000,img:null},
  {id:6,catId:2,name:"Saumon grillé",  desc:"Pavé de saumon, légumes de saison, sauce citronnée et herbes",      price:19500,img:null},
  {id:7,catId:3,name:"Fondant chocolat",desc:"Cœur coulant chaud, boule de glace vanille, coulis chocolat",      price:6500, img:null},
  {id:8,catId:3,name:"Tarte Tatin",    desc:"Tarte aux pommes caramélisées, crème fraîche maison",               price:5500, img:null},
  {id:9,catId:4,name:"Jus d'orange",   desc:"Pressé minute, sans sucre ajouté",                                  price:3000, img:null},
  {id:10,catId:4,name:"Eau minérale",  desc:"50 cl ou 1 L — gazeuse ou plate",                                   price:1500, img:null},
  {id:11,catId:4,name:"Café express",  desc:"Arabica torréfié maison, sucre en option",                          price:2000, img:null},
];

/* SVG icons */
const CIcImg    = ({s=28,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const CIcPlus   = ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CIcMinus  = ({s=12})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CIcCart   = ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const CIcBack   = ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const CIcCheck  = ({s=22})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CIcNote   = ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const CIcTrash  = ({s=13,c="var(--red)"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

/* ───────────────── WELCOME ───────────────── */
function WelcomeScreen({ tableNumber, onStart, user, onProfile }) {
  return (
    <div className="screen welcome">
      <div className="w-logo">Menu<span>Flow</span></div>
      <div className="w-tag">Bienvenue</div>
      <div className="w-plate">🍽️</div>
      <div className="w-table">
        <span style={{fontSize:11,opacity:0.6,textTransform:"uppercase",letterSpacing:1}}>Vous êtes à la</span>
        <strong>Table {tableNumber}</strong>
      </div>
      <div className="w-restaurant" style={{marginBottom:40}}>Restaurant Mvog · Service du déjeuner</div>
      {user && onProfile && (
        <button onClick={onProfile} style={{
          background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",
          borderRadius:"99px",padding:"8px 18px",color:"rgba(255,255,255,0.7)",
          fontFamily:"Nunito,sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",
          marginBottom:"16px",position:"relative",display:"flex",alignItems:"center",gap:8
        }}>
          <span style={{width:26,height:26,borderRadius:"50%",background:"#c8772a",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",overflow:"hidden",flexShrink:0}}>
            {user.avatar ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
          </span>
          {user.name} · Mon profil
        </button>
      )}
      <button className="w-btn" onClick={onStart}>Voir la carte →</button>
    </div>
  );
}

/* ───────────────── MENU ───────────────── */
function MenuScreen({ tableNumber, cart, onUpdateCart, onGoCart, user, onProfile }) {
  const [activeCat, setActiveCat] = useState(1);
  const [toast, setToast]         = useState(null);
  const toastTimer = useRef(null);

  const showToast = msg => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2000);
  };

  const getQty = id => (cart.find(c=>c.id===id)?.qty)||0;

  const addItem = (dish) => {
    onUpdateCart(prev => {
      const ex = prev.find(c=>c.id===dish.id);
      if(ex) return prev.map(c=>c.id===dish.id?{...c,qty:c.qty+1}:c);
      return [...prev,{...dish,qty:1}];
    });
    showToast(`${dish.name} ajouté ✓`);
  };

  const removeItem = (id) => {
    onUpdateCart(prev => {
      const ex = prev.find(c=>c.id===id);
      if(!ex) return prev;
      if(ex.qty<=1) return prev.filter(c=>c.id!==id);
      return prev.map(c=>c.id===id?{...c,qty:c.qty-1}:c);
    });
  };

  const filtered = DISHES.filter(d=>d.catId===activeCat);
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const totalQty = cart.reduce((s,c)=>s+c.qty,0);

  return (
    <div className="screen menu-screen">
      {/* Header */}
      <div className="menu-header">
        <div className="mh-top">
          <div className="mh-logo">Menu<span>Flow</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="mh-table">Table {tableNumber}</div>
            {user && onProfile && (
              <button onClick={onProfile} style={{
                width:32,height:32,borderRadius:"50%",background:"#c8772a",border:"2px solid rgba(255,255,255,0.3)",
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",
                fontFamily:"Fraunces,serif",fontSize:12,fontWeight:900,color:"#fff"
              }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
              </button>
            )}
          </div>
        </div>
        <div className="mh-title">Notre Carte</div>
        <div className="mh-sub">{DISHES.length} plats disponibles aujourd'hui</div>
      </div>

      {/* Categories */}
      <div className="cat-scroll">
        {CATS.map(c=>(
          <div key={c.id} className={`cat-pill ${activeCat===c.id?"active":""}`} onClick={()=>setActiveCat(c.id)}>
            <div className="cat-pill-ph"><CIcImg s={12} c={activeCat===c.id?"rgba(255,255,255,0.6)":"var(--grey)"}/></div>
            {c.name}
          </div>
        ))}
      </div>

      {/* Dishes */}
      <div className="dish-list">
        <div className="dish-section-title">{CATS.find(c=>c.id===activeCat)?.name}</div>
        {filtered.map(dish => {
          const qty = getQty(dish.id);
          return (
            <div key={dish.id} className={`dish-item ${qty>0?"added":""}`}>
              <div className="dish-item-img">
                {dish.img
                  ? <img src={dish.img} alt={dish.name}/>
                  : <div className="dish-item-img-ph"><CIcImg s={28} c="var(--grey2)"/></div>
                }
              </div>
              <div className="dish-item-body">
                <div className="dish-item-name">{dish.name}</div>
                <div className="dish-item-desc">{dish.desc}</div>
                <div className="dish-item-foot">
                  <div className="dish-price">{CLIENT_FMT(dish.price)}</div>
                  {qty === 0 ? (
                    <button className="dish-add-btn" onClick={()=>addItem(dish)}><CIcPlus/></button>
                  ) : (
                    <div className="dish-qty-ctrl">
                      <button className="qty-btn" onClick={()=>removeItem(dish.id)}><CIcMinus/></button>
                      <span className="qty-num">{qty}</span>
                      <button className="qty-btn" style={{borderColor:"var(--amber)",color:"var(--amber)"}} onClick={()=>addItem(dish)}><CIcPlus s={12}/></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {cart.length>0 && <div style={{height:90}}/>}
      </div>

      {/* Cart FAB */}
      {cart.length>0 && (
        <button className="cart-fab" onClick={onGoCart}>
          <div className="cart-fab-left">
            <div className="cart-badge">{totalQty}</div>
            <div className="cart-fab-label">Voir mon panier</div>
          </div>
          <div className="cart-fab-total">{CLIENT_FMT(total)}</div>
        </button>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ───────────────── CART ───────────────── */
function CartScreen({ tableNumber, cart, onUpdateCart, onBack, onOrder }) {
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = msg => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2000);
  };

  const removeItem = id => onUpdateCart(p=>{
    const ex=p.find(c=>c.id===id);
    if(!ex) return p;
    if(ex.qty<=1) return p.filter(c=>c.id!==id);
    return p.map(c=>c.id===id?{...c,qty:c.qty-1}:c);
  });
  const addItem    = id => onUpdateCart(p=>p.map(c=>c.id===id?{...c,qty:c.qty+1}:c));
  const deleteItem = (id, name) => {
    onUpdateCart(p=>p.filter(c=>c.id!==id));
    showToast(`${name} retiré du panier`);
  };

  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);

  return (
    <div className="screen cart-screen">
      <div className="cart-header">
        <div className="cart-header-top">
          <button className="back-btn" onClick={onBack}><CIcBack/></button>
          <div style={{flex:1}}>
            <div className="cart-title">Mon panier</div>
            <div className="cart-table">Table {tableNumber} · {cart.length} article{cart.length>1?"s":""}</div>
          </div>
        </div>
        <button className="back-to-menu-btn" onClick={onBack}>
          <CIcBack s={14}/>
          Retour au menu
        </button>
      </div>

      <div className="cart-body">
        {cart.length === 0 ? (
          <div className="empty">
            <CIcCart s={40}/>
            <p>Votre panier est vide.<br/>Ajoutez des plats depuis la carte.</p>
            <button className="new-order-btn" onClick={onBack}>← Retour à la carte</button>
          </div>
        ) : (
          <>
            {/* Items */}
            {cart.map(item=>(
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.img ? <img src={item.img} alt={item.name}/> : <CIcImg s={22} c="var(--grey2)"/>}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{CLIENT_FMT(item.price)} / unité</div>
                </div>
                <div className="cart-item-right">
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div className="cart-item-total">{CLIENT_FMT(item.price*item.qty)}</div>
                    <button
                      className="cart-item-delete"
                      onClick={()=>deleteItem(item.id, item.name)}
                      title="Supprimer du panier"
                    >
                      <CIcTrash s={13} c="var(--red)"/>
                    </button>
                  </div>
                  <div className="dish-qty-ctrl">
                    <button className="qty-btn" onClick={()=>removeItem(item.id)}><CIcMinus/></button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" style={{borderColor:"var(--amber)",color:"var(--amber)"}} onClick={()=>addItem(item.id)}><CIcPlus s={12}/></button>
                  </div>
                </div>
              </div>
            ))}

            {/* Note */}
            <div className="note-box">
              <div className="note-label"><CIcNote s={13}/>Note pour la cuisine</div>
              <textarea
                className="note-input" rows={2}
                placeholder="Allergies, préférences, cuisson… (optionnel)"
                value={note} onChange={e=>setNote(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="cart-summary">
              {cart.map(c=>(
                <div key={c.id} className="sum-row">
                  <span>{c.name} ×{c.qty}</span>
                  <span>{CLIENT_FMT(c.price*c.qty)}</span>
                </div>
              ))}
              <div className="sum-row total">
                <span>Total</span>
                <span>{CLIENT_FMT(total)}</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={()=>onOrder(note)}>
              Commander · {CLIENT_FMT(total)}
            </button>
            <div style={{height:20}}/>
          </>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ───────────────── CONFIRM ───────────────── */
function ConfirmScreen({ orderId, onTrack }) {
  return (
    <div className="screen confirm-screen">
      <div className="confirm-anim"><CIcCheck s={44}/></div>
      <div className="confirm-title">Commande envoyée !</div>
      <div className="confirm-sub">
        Votre commande a bien été transmise<br/>à la cuisine. Restez assis, on s'occupe de vous.
      </div>
      <div className="confirm-order-id">
        <div className="conf-id-lbl">Numéro de commande</div>
        <div className="conf-id-val">{orderId}</div>
      </div>
      <button className="w-btn" onClick={onTrack} style={{width:"100%",position:"relative"}}>
        Suivre ma commande →
      </button>
    </div>
  );
}

/* ───────────────── TRACKING ───────────────── */
function TrackingScreen({ orderId, cart, onNewOrder }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);

  const STEPS = [
    {icon:"📨", label:"Commande reçue",      desc:"Votre commande a été transmise à la cuisine"},
    {icon:"👨‍🍳", label:"En préparation",      desc:"Le chef prépare vos plats avec soin"},
    {icon:"🔔", label:"Prête à être servie", desc:"Vos plats sont prêts, le serveur arrive"},
    {icon:"✨", label:"Bonne dégustation !", desc:"Profitez de votre repas"},
  ];

  // Auto-advance simulation
  useEffect(()=>{
    if(statusIdx >= STEPS.length-1) return;
    const delays = [4000, 8000, 5000];
    const t = setTimeout(()=>setStatusIdx(i=>Math.min(i+1,STEPS.length-1)), delays[statusIdx]||5000);
    return ()=>clearTimeout(t);
  },[statusIdx]);

  return (
    <div className="screen track-screen">
      <div className="track-header">
        <div className="track-header-top">
          <div>
            <div className="track-title">Suivi commande</div>
            <div className="track-sub">{orderId}</div>
          </div>
          <div className="track-order-id"
            style={{background: statusIdx===STEPS.length-1?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.1)",
                    color: statusIdx===STEPS.length-1?"var(--green-l)":"rgba(255,255,255,0.8)",
                    border: statusIdx===STEPS.length-1?"1px solid rgba(16,185,129,0.35)":"none"}}>
            {STEPS[statusIdx].label}
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"var(--brown)",marginBottom:20}}>
            Statut de votre commande
          </div>
          <div className="steps">
            {STEPS.map((s,i)=>{
              const state = i<statusIdx?"done":i===statusIdx?"current":"pending";
              return (
                <div key={i} className={`step ${state}`}>
                  <div className="step-icon">
                    {state==="done" ? <CIcCheck s={16}/> : <span style={{fontSize:16}}>{s.icon}</span>}
                  </div>
                  <div className="step-body">
                    <div className="step-label">{s.label}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="track-items">
          <div className="track-items-title">Récapitulatif</div>
          {cart.map(c=>(
            <div key={c.id} className="track-item">
              <div>
                <div className="ti-name">{c.name}</div>
                <div className="ti-qty">Quantité : {c.qty}</div>
              </div>
              <div className="ti-price">{CLIENT_FMT(c.price*c.qty)}</div>
            </div>
          ))}
          <div style={{background:"var(--white)",borderRadius:"var(--radius-sm)",padding:"12px 14px",marginBottom:8,boxShadow:"var(--shadow-sm)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:14,color:"var(--brown)"}}>Total</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"var(--amber)"}}>{CLIENT_FMT(total)}</span>
          </div>
        </div>

        <button className="new-order-btn" onClick={onNewOrder}>
          + Passer une nouvelle commande
        </button>
      </div>
    </div>
  );
}

/* ───────────────── APP ROOT ───────────────── */



function ClientApp() {
  const [user, setUser] = useState(()=>{
    try { const s=localStorage.getItem("mf_session_client"); return s?JSON.parse(s):null; } catch{ return null; }
  });
  const [showProfile, setShowProfile] = useState(false);
  const tableNumber = 3;
  const handleLogin  = u => { localStorage.setItem("mf_session_client", JSON.stringify(u)); setUser(u); };
  const handleUpdate = u => { localStorage.setItem("mf_session_client", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("mf_session_client"); setUser(null); };

  if (!user) return <LoginScreen roleKey="client" onLogin={handleLogin}/>;
  return <ClientMain tableNumber={tableNumber} user={user}
    onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={u=>setUser(u)} onLogout={()=>setUser(null)}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}



export default function App() {
  const [page, setPage] = React.useState("admin");
  const nav = {
    position:"fixed",top:0,left:0,right:0,zIndex:9999,
    background:"#0a0a0a",display:"flex",alignItems:"center",
    gap:"8px",padding:"10px 20px",
    borderBottom:"2px solid #e8420a",fontFamily:"sans-serif",
  };
  const btn = (id) => ({
    padding:"7px 18px",borderRadius:"8px",border:"none",
    cursor:"pointer",fontWeight:700,fontSize:"13px",
    background:page===id?"#e8420a":"#2a2a2a",color:"white",transition:"all 0.15s",
  });
  return (
    <>
      <div style={nav}>
        <span style={{color:"white",fontWeight:800,fontSize:"16px",marginRight:"16px"}}>
          Menu<span style={{color:"#e8420a"}}>Flow</span>
        </span>
        <button style={btn("admin")}   onClick={()=>setPage("admin")}>🛠️ Admin</button>
        <button style={btn("cuisine")} onClick={()=>setPage("cuisine")}>👨‍🍳 Cuisine</button>
        <button style={btn("client")}  onClick={()=>setPage("client")}>📱 Client</button>
      </div>
      <div style={{paddingTop:"52px"}}>
        {page==="admin"   && <AdminApp/>}
        {page==="cuisine" && <CuisineApp/>}
        {page==="client"  && <ClientApp/>}
      </div>
    </>
  );
}
