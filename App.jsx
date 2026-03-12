import React, { useState } from "react";
import "./style.css";
import { AdminApp }   from "./AdminPage.jsx";
import { CuisineApp } from "./CuisinePage.jsx";
import { ClientApp }  from "./ClientPage.jsx";

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
