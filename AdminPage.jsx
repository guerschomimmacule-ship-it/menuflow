import React, { useState, useRef } from "react";
import { LoginScreen, ProfileModal, ProfileTrigger, ImageUpload, QRCode, Modal, Dashboard, MenuManager, TableManager, INIT_CATS, INIT_DISHES, INIT_TABLES, FAKE_ORDERS, fmt, IcGrid, IcMenu, IcQR, IcClock, IcUser, IcImg, IcEdit, IcTrash, IcEye, IcEyeOff, IcPrint, IcDl } from "./shared.js";

function AdminApp() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return <LoginScreen roleKey="admin" onLogin={setUser}/>;

  return <AdminMain user={user} onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={u=>{setUser(u);}} onLogout={()=>setUser(null)}
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
export { AdminApp };
