"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import DiscordWidget from "@/components/DiscordWidget";
import ServerModal from "@/components/ServerModal";
import LiveViewers from "@/components/LiveViewers";
import { 
  Code2, Flame, Facebook, MessageCircle, Volume2, 
  VolumeX, Zap, Target, Sword, Trophy, Share2, X, Shield, Map, Compass 
} from "lucide-react";

// Tu componente de Carousel integrado
function Carousel() {
  const images = ["/carousel/1.png", "/carousel/2.png", "/carousel/3.png", "/carousel/4.png", "/carousel/5.png"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Slide ${i}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

export default function HomePage() {
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const VOTE_URL = "https://topgameservers.net/conanexiles/server/nrcYSh89KdNehu8g4MS2";

  const servers = useMemo(() => [
    { slug: "dragones", title: "DRAGONES Y DINOSAURIOS PVEVP", ip: "190.174.180.244", port: 7779, queryPort: 27017, image: "/servers/server1.png", settings: ["Cosecha: x10.0", "XP: x10.0", "Raideo: 17:00 a 23:00", "Dinos & Dragones"] },
    { slug: "mods", title: "Los Antiguos PvPvE Best Mods", ip: "190.174.180.244", port: 7786, queryPort: 27026, image: "/servers/server3.png", settings: ["Cosecha: x4.0", "XP: x5.0", "Nivel: 300", "Mods: +40"] },
    { slug: "vanilla", title: "EL EXILIO SIN MODS PVP FULL", ip: "190.174.180.244", port: 7777, queryPort: 27018, image: "/servers/server4.png", settings: ["Cosecha: x10.0", "XP: x10.0", "Vanilla", "PvP Full"] },
    { slug: "siptah", title: "SIPTAH MAS MODS EEWA", ip: "190.174.180.244", port: 7781, queryPort: 27015, image: "/servers/server2.png", settings: ["Cosecha: x5.0", "XP: x10.0", "Mapa: Siptah", "EEWA"] }
  ], []);

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      
      {/* POPUP DE BIENVENIDA */}
      {showPopup && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="relative w-full max-w-3xl bg-[#0b0f17] rounded-[3.5rem] border border-orange-600/50 overflow-hidden shadow-[0_0_150px_rgba(234,88,12,0.6)]">
            <button onClick={() => setShowPopup(false)} className="absolute top-8 right-8 text-white/30 hover:text-white z-[100001]"><X size={40} /></button>
            <div className="p-12 flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 bg-orange-600/20 px-6 py-2 rounded-full border border-orange-600/30">
                <Flame size={16} className="text-orange-500" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-orange-500">Temporada 2026</span>
              </div>
              <h2 className="text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">BIENVENIDO A <br /> <span className="text-orange-600">LOS ANTIGUOS</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mt-10">
                {[{ icon: <Sword />, t: "PVP & PVE" }, { icon: <Flame />, t: "DRAGONES" }, { icon: <Zap />, t: "SIN LAG" }, { icon: <Shield />, t: "DINOSAURIOS" }, { icon: <Map />, t: "CUSTOM" }, { icon: <Compass />, t: "EVENTOS" }].map((item, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center">
                    <div className="text-orange-500 mb-3">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">{item.t}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowPopup(false)} className="mt-12 w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic text-3xl py-8 rounded-[2.5rem] shadow-[0_25px_50px_rgba(234,88,12,0.4)] transition-all">¡EMPEZAR!</button>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-50 overflow-hidden opacity-20 blur-3xl">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/video/server.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-10">
        
        {/* HERO */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-6 mb-10">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white/10 flex flex-col items-center text-center shadow-2xl">
            <LiveViewers />
            <img src="/logo/logo.png" className="w-44 h-44 object-contain my-6" alt="Logo" />
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Los Antiguos</h1>
            <div className="flex gap-4 mt-8">
              <a href="https://discord.gg/4SmuhXPfMr" target="_blank" className="p-4 bg-[#5865F2] rounded-2xl hover:scale-110 transition-all"><MessageCircle size={24} fill="white" /></a>
              <a href="https://facebook.com/DatawebGames" target="_blank" className="p-4 bg-[#1877F2] rounded-2xl hover:scale-110 transition-all"><Facebook size={24} fill="white" /></a>
            </div>
          </div>

          <div className="relative rounded-[3.5rem] overflow-hidden border-4 border-white/5 bg-black">
            <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80">
              <source src="/video/server.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 flex items-center gap-6">
              <div className="p-4 bg-orange-600 rounded-full animate-pulse shadow-[0_0_20px_orange]"><Sword size={28} /></div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-[0.5em] text-orange-500">Temporada 2026</span>
                <h2 className="font-black italic text-4xl uppercase tracking-tighter">DOMINA EL EXILIO</h2>
              </div>
            </div>
          </div>
        </div>

        {/* SERVER GRID */}
        <div className="grid gap-10 mb-20 sm:grid-cols-2 lg:grid-cols-4">
          {servers.map((s) => (
            <div key={s.slug} className="group flex flex-col">
              <div className="relative h-[480px] rounded-[3.5rem] border border-white/10 bg-[#0a0a0a] overflow-hidden transition-all hover:border-orange-500 hover:-translate-y-2 cursor-pointer shadow-2xl" onClick={() => { setSelected(s); setOpen(true); }}>
                <img src={s.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-10 transition-opacity duration-500" />
                <div className="absolute inset-0 z-30 flex flex-col justify-center p-8 opacity-0 group-hover:opacity-100 transition-all text-left">
                   <h4 className="text-orange-500 text-[10px] font-black uppercase mb-4 border-b border-orange-500/20 pb-2">Configuración</h4>
                   <ul className="space-y-2">
                    {s.settings?.map((setting, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70">
                        <div className="w-1 h-1 bg-orange-600 rotate-45" /> {setting}
                      </li>
                    ))}
                   </ul>
                </div>
                <div className="absolute bottom-10 left-0 w-full px-8 z-20 group-hover:opacity-0 transition-opacity">
                  <h3 className="text-2xl font-black italic uppercase leading-tight text-white">{s.title}</h3>
                </div>
              </div>
              <div className="mt-6 space-y-3 px-2">
                <a href={VOTE_URL} target="_blank" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Flame size={16} /> VOTAR SERVIDOR
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION: DISCORD + CAROUSEL BANNER */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 mb-20">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl h-[500px]">
            <DiscordWidget />
          </div>
          {/* AQUÍ EL CAROUSEL REEMPLAZANDO AL CUADRO NARANJA */}
          <div className="h-[500px]">
            <Carousel />
          </div>
        </div>

        {/* DATAWEB GAMES AL FINAL (BANNER HORIZONTAL) */}
        <div className="bg-orange-600 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl group transition-all hover:bg-orange-500">
           <div className="flex items-center gap-6">
              <Code2 size={48} className="text-black group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <h2 className="text-4xl font-black text-black tracking-tighter leading-none">DATAWEB GAMES</h2>
                <span className="text-[10px] font-black uppercase text-black/60 tracking-[0.3em]">Hosting & Development 2026</span>
              </div>
           </div>
           <div className="flex gap-8 mt-6 md:mt-0 text-black/50">
              <div className="flex flex-col items-center"><Zap size={20}/><span className="text-[8px] font-bold">LATENCIA BAJA</span></div>
              <div className="flex flex-col items-center"><Trophy size={20}/><span className="text-[8px] font-bold">CALIDAD PREMIUM</span></div>
              <div className="flex flex-col items-center"><Share2 size={20}/><span className="text-[8px] font-bold">COMUNIDAD</span></div>
           </div>
        </div>
      </div>

      <ServerModal open={open} onClose={() => setOpen(false)} server={selected} />

      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #ea580c; border-radius: 10px; }
      `}</style>
    </main>
  );
}
