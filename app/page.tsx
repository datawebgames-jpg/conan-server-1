"use client";
import { useState, useEffect } from "react";
import DiscordWidget from "@/components/DiscordWidget";
import ServerModal from "@/components/ServerModal";
import { 
  MessageCircle, Zap, Shield, Sword, 
  Map, Skull, Crown, Navigation, 
  Youtube, Facebook, Download, VideoOff, 
  PlayCircle, Diamond, Clock, Library, Castle
} from "lucide-react";

// --- COMPONENTE: COUNTDOWN TIMER ---
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, mins: 0, segs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
          horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          segs: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 justify-center scale-90 md:scale-110">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-blue-600/10 border border-blue-500/20 w-16 h-16 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center backdrop-blur-xl shadow-2xl">
            <span className="text-2xl md:text-4xl font-black italic text-blue-500">{value}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-3 text-white/30">{label}</span>
        </div>
      ))}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function HomePage() {
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [steamName, setSteamName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Mantenemos la IP que solicitaste para el Popup
  const serverData = { 
    slug: "legion", 
    title: "LEGIÓN DE REYES", 
    ip: "190.174.176.46", 
    port: 7777, 
    queryPort: 27017,
    image: "/servers/legion_bg.jpg",
  };

  const handleRegister = async (faction: 'ANGELES' | 'DEMONIOS', url: string) => {
    if (!steamName.trim()) {
      alert("Por favor, ingresa tu nombre de Steam.");
      return;
    }
    setIsRegistering(true);
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "👑 NUEVA PRE-INSCRIPCIÓN: LEGIÓN DE REYES",
            color: faction === 'ANGELES' ? 3447003 : 15105570,
            fields: [
              { name: "Guerrero", value: `**${steamName}**`, inline: true },
              { name: "Bando", value: faction, inline: true },
              { name: "Apertura", value: "07/03/2026", inline: true }
            ],
            timestamp: new Date()
          }]
        })
      });
      alert(`¡${steamName}, has sido registrado en el bando ${faction}!`);
      setSteamName("");
    } catch (e) {
      alert("Error al conectar con Discord.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-blue-600 overflow-x-hidden">
      {/* BACKGROUND ESTÁTICO */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25">
        <div className="w-full h-full bg-[url('/servers/legion_bg.jpg')] bg-cover bg-center grayscale blur-md"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-24">
        {/* NAV */}
        <nav className="flex justify-between items-center bg-white/5 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl sticky top-6 z-[100]">
          <div className="flex items-center gap-5">
            <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl shadow-lg">
              <img src="/logo/logo.png" className="w-14 h-14 rounded-xl" alt="logo" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter">DATAWEB <span className="text-blue-500">GAMES</span></h1>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">CONAN EXILES • REINO DE REYES</span>
            </div>
          </div>
          <a href="https://discord.gg/4SmuhXPfMr" target="_blank" className="p-4 bg-blue-600 rounded-2xl hover:scale-110 transition-all shadow-lg shadow-blue-600/20"><MessageCircle size={24}/></a>
        </nav>

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 font-black text-[10px] tracking-[0.4em] uppercase">Preparando el Reino</span>
            </div>
            
            <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
              LEGIÓN DE <br/><span className="text-blue-600">REYES</span>
            </h2>
            
            <p className="max-w-2xl mx-auto text-xs md:text-sm font-black text-white/40 tracking-[0.5em] uppercase leading-loose">
              Pvp 24/7 • 2 Facciones • Guerras de Territorio • Mazmorras Únicas
            </p>
          </div>
          
          <div className="max-w-2xl w-full bg-gradient-to-b from-white/10 to-transparent p-12 rounded-[4rem] border border-white/10 space-y-10 backdrop-blur-2xl shadow-3xl">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">
                <Clock size={16}/> LANZAMIENTO: 07 MARZO
              </div>
              <CountdownTimer targetDate="2026-03-07T18:00:00" />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="NOMBRE DE GUERRERO (STEAM)..." 
                  value={steamName}
                  onChange={(e) => setSteamName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 py-6 px-8 rounded-3xl font-black uppercase italic text-center text-sm focus:border-blue-500 outline-none transition-all placeholder:text-white/10"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => handleRegister('ANGELES', '...')} className="group bg-blue-600 p-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                  <Shield size={18} className="group-hover:rotate-12 transition-transform"/> Bando Angeles
                </button>
                <button onClick={() => handleRegister('DEMONIOS', '...')} className="group bg-red-600 p-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                  <Sword size={18} className="group-hover:-rotate-12 transition-transform"/> Bando Demonios
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4">
                <button onClick={() => { setSelected(serverData); setOpen(true); }} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                  REVISAR IP Y CONEXIÓN
                </button>
                <div className="flex justify-center gap-8">
                  <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3674162555" target="_blank" className="text-[10px] font-black text-white/30 hover:text-blue-500 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors">
                    <Library size={16}/> Mods Oficiales
                  </a>
                  <a href="#descargas" className="text-[10px] font-black text-white/30 hover:text-blue-500 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors">
                    <Download size={16}/> Recursos
                  </a>
                </div>
            </div>
          </div>
        </section>

        {/* RECURSOS / DESCARGAS */}
        <section id="descargas" className="grid md:grid-cols-2 gap-8 pt-10">
          <a href="https://drive.google.com/file/d/1lrRNi06iCTJejVG6DTBvskxIBW7rYQfj/view?usp=drive_link" target="_blank" className="group flex items-center justify-between p-10 bg-blue-600/5 border border-white/5 rounded-[3rem] hover:bg-blue-600/10 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-600/20 text-blue-500 rounded-3xl group-hover:scale-110 transition-transform"><PlayCircle size={32} /></div>
              <div className="text-left">
                <h4 className="text-lg font-black uppercase italic">Cinemática</h4>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Intro de Legión</p>
              </div>
            </div>
            <Download size={24} className="text-white/10 group-hover:text-blue-500" />
          </a>

          <a href="https://drive.google.com/file/d/1HcayYUFxtgnleMhn24uyvRhuKS-JAoHY/view?usp=drive_link" target="_blank" className="group flex items-center justify-between p-10 bg-white/5 border border-white/5 rounded-[3rem] hover:bg-white/10 transition-all">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-white/5 text-white/40 rounded-3xl group-hover:scale-110 transition-transform"><VideoOff size={32} /></div>
              <div className="text-left">
                <h4 className="text-lg font-black uppercase italic">Parche Intro</h4>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Omitir video inicial</p>
              </div>
            </div>
            <Download size={24} className="text-white/10" />
          </a>
        </section>

        {/* FOOTER */}
        <footer className="bg-white/5 border border-white/10 p-16 rounded-[5rem] text-center space-y-12 mb-20 relative overflow-hidden backdrop-blur-md">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            <div className="flex justify-center gap-12 opacity-50">
               <a href="https://facebook.com/DatawebGames" target="_blank" className="hover:scale-125 transition-transform hover:text-blue-500"><Facebook size={32} /></a>
               <a href="https://youtube.com/@ElViejoGamer1" target="_blank" className="hover:scale-125 transition-transform hover:text-red-600"><Youtube size={32} /></a>
            </div>
            <div className="space-y-4">
              <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white/80">Dataweb <span className="text-blue-600">Games</span></h4>
              <p className="text-[9px] text-white/20 font-black uppercase tracking-[1em]">Explora • Sobrevive • Domina</p>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">© 2026 Powered by Dataweb Games</p>
        </footer>
      </div>

      <ServerModal open={open} onClose={() => setOpen(false)} server={serverData} />
    </main>
  );
}
