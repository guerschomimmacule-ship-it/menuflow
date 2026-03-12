import React, { useState, useRef } from "react";
import { LoginScreen, ProfileModal } from "./shared.js";

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

export { CuisineApp };

export { ClientApp };

function ClientApp() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const tableNumber = 3;
  if (!user) return <LoginScreen roleKey="client" onLogin={setUser}/>;
  return <ClientMain tableNumber={tableNumber} user={user}
    onShowProfile={()=>setShowProfile(true)}
    onUpdateUser={u=>setUser(u)} onLogout={()=>setUser(null)}
    showProfile={showProfile} onCloseProfile={()=>setShowProfile(false)}/>;
}
