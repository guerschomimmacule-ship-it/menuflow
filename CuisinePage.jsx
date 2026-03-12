import React, { useState, useEffect, useRef } from "react";
import { LoginScreen, ProfileModal, ProfileTrigger } from "./shared.js";

import React, { useState, useEffect, useRef } from "react";
import { LoginScreen, ProfileModal, ProfileTrigger, SAMPLE_ORDERS, mkId, now,
         useTimer, Clock, TimerBadge, OrderCard, DoneCard, NewOrderModal, RefuseModal } from "./shared.js";

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
export 


  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return <LoginScreen roleKey="cuisine" onLogin={setUser}/>;

  return <CuisineMain user={user} onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={u=>setUser(u)} onLogout={()=>setUser(null)}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}

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
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  if (!user) return <LoginScreen roleKey="cuisine" onLogin={setUser}/>;
  return <CuisineMain user={user} onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={u=>setUser(u)} onLogout={()=>setUser(null)}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}
export { CuisineApp };
