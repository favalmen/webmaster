import React, { useState, useEffect, useRef } from 'react';
import { Play, ArrowRight, Activity, Fingerprint, Dna, BrainCircuit, Check, Terminal, Crosshair, ChevronRight } from 'lucide-react';

// --- DESIGN SYSTEM & ASSETS ---
const COLORS = {
  moss: '#2E4036',
  clay: '#CC5833',
  cream: '#F2F0E9',
  charcoal: '#1A1A1A',
};

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=2070&auto=format&fit=crop',
  philosophy: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2074&auto=format&fit=crop',
};

// --- GLOBAL STYLES & FONTS INJECTION ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,800;1,400&display=swap');
    
    body {
      background-color: ${COLORS.cream};
      color: ${COLORS.charcoal};
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .font-display { font-family: 'Outfit', sans-serif; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* Custom Selection */
    ::selection { background: ${COLORS.moss}; color: ${COLORS.cream}; }

    /* Custom Native Animations (Replacing GSAP) */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeUpSubtle {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes drawLine {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    .animate-draw-line {
      animation: drawLine 4s linear infinite;
    }

    @keyframes cursorPath {
      0%, 5% { transform: translate(20px, 150px); opacity: 0; }
      10% { transform: translate(20px, 150px); opacity: 1; }
      30% { transform: translate(140px, 80px); opacity: 1; scale: 1; }
      35% { transform: translate(140px, 80px) scale(0.8); opacity: 1; }
      40% { transform: translate(140px, 80px) scale(1); opacity: 1; }
      60% { transform: translate(220px, 180px); opacity: 1; scale: 1; }
      65% { transform: translate(220px, 180px) scale(0.8); opacity: 1; }
      70% { transform: translate(220px, 180px) scale(1); opacity: 1; }
      90%, 100% { transform: translate(220px, 200px); opacity: 0; }
    }
    .animate-cursor-path {
      animation: cursorPath 5s infinite;
    }

    @keyframes dotPop {
      0%, 35% { transform: scale(0); opacity: 0; }
      40%, 100% { transform: scale(1); opacity: 1; }
    }
    .animate-dot-pop {
      animation: dotPop 5s infinite;
    }

    @keyframes btnPress {
      0%, 65% { transform: scale(1); background-color: #F2F0E9; color: rgba(0,0,0,0.6); }
      70%, 100% { transform: scale(0.95); background-color: #2E4036; color: #F2F0E9; }
    }
    .animate-btn-press {
      animation: btnPress 5s infinite;
    }
  `}</style>
);

// --- UTILITY COMPONENTS ---

const NoiseOverlay = () => (
  <svg className="pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden="true">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

const MagneticButton = ({ children, className = '', onClick, variant = 'dark' }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.15;
    const y = (clientY - (top + height / 2)) * 0.15;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const baseClasses = "relative overflow-hidden rounded-full flex items-center justify-center transition-transform duration-300 ease-out group";
  const variants = {
    dark: "bg-[#1A1A1A] text-[#F2F0E9] border border-transparent",
    light: "bg-[#F2F0E9] text-[#1A1A1A] border border-[#1A1A1A]/10",
    clay: "bg-[#CC5833] text-[#F2F0E9] border border-transparent",
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="absolute inset-0 bg-[#CC5833] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 rounded-full"></div>
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:text-[#F2F0E9]">
        {children}
      </span>
    </button>
  );
};

const SplitTextReveal = ({ text, className = "" }) => {
  const words = text.split(" ");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em] align-bottom pb-1">
          <span 
            className="inline-block"
            style={{ 
              opacity: inView ? 1 : 0, 
              transform: inView ? 'translateY(0)' : 'translateY(100%)',
              transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

// --- MAJOR SECTIONS ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <div 
        className={`pointer-events-auto flex items-center justify-between px-6 py-4 rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full max-w-5xl
        ${isScrolled 
          ? 'bg-white/60 backdrop-blur-xl border border-[#2E4036]/10 text-[#2E4036] shadow-[0_8px_32px_rgba(0,0,0,0.05)] translate-y-0 scale-100' 
          : 'bg-transparent border-transparent text-white translate-y-2 scale-[0.98]'}`}
      >
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isScrolled ? 'bg-[#CC5833]' : 'bg-white'}`}></div>
          <span className="font-display font-semibold tracking-wide text-lg">NURA</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight">
          {['Intelligence', 'Protocol', 'Manifesto'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:opacity-60 transition-opacity">
              {item}
            </a>
          ))}
        </div>

        <MagneticButton variant={isScrolled ? 'dark' : 'light'} className="px-5 py-2.5 text-sm font-semibold">
          Begin Audit
        </MagneticButton>
      </div>
    </nav>
  );
};

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-[#1A1A1A] rounded-b-[3rem]">
      {/* Background Image & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${IMAGES.hero})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b from-[#2E4036]/60 via-transparent to-[#1A1A1A] transition-opacity duration-[2000ms] ${mounted ? 'opacity-70' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col justify-end h-full z-10 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="overflow-hidden mb-[-2vw]">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[#F2F0E9] uppercase"
              style={{ 
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(50px)', 
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s' 
              }}
            >
              Nature is the
            </h1>
          </div>
          <div className="overflow-hidden pb-4 perspective-[1000px]">
            <h1 
              className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-[#CC5833] leading-none pr-4"
              style={{ 
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) rotateX(0)' : 'translateY(80px) rotateX(-20deg)', 
                transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s', transformOrigin: 'top' 
              }}
            >
              Algorithm.
            </h1>
          </div>
          <p 
            className="text-lg md:text-xl text-[#F2F0E9]/80 max-w-xl mt-6 mb-10 font-light tracking-wide"
            style={{ 
              opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'all 1s ease-out 0.9s' 
            }}
          >
            Precision biological telemetry meets bespoke intervention. We do not just measure longevity; we engineer it through high-end clinical protocols.
          </p>
          <div 
            className="inline-block"
            style={{ 
              opacity: mounted ? 1 : 0, transform: mounted ? 'scale(1)' : 'scale(0.8)', 
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s' 
            }}
          >
            <MagneticButton variant="light" className="px-8 py-4 text-base font-semibold">
              Explore the Protocol <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- INTERACTIVE ARTIFACTS (FEATURES) ---

const DiagnosticShuffler = () => {
  const [cards, setCards] = useState([
    { id: 1, label: "Epigenetic Age", value: "32.4", unit: "yrs", status: "Optimal", color: "text-[#2E4036]" },
    { id: 2, label: "Microbiome Diversity", value: "94", unit: "score", status: "Analyzing", color: "text-[#CC5833]" },
    { id: 3, label: "Cortisol Optimization", value: "Aligned", unit: "", status: "Stable", color: "text-blue-600" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const first = newCards.shift();
        newCards.push(first);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 w-full flex justify-center items-center perspective-[1000px]">
      {cards.map((card, index) => {
        // Calculate dynamic styles based on index (0 is front)
        const isFront = index === 0;
        const translateY = index * 20;
        const scale = 1 - (index * 0.05);
        const zIndex = 30 - index;
        const opacity = 1 - (index * 0.2);

        return (
          <div
            key={card.id}
            className="absolute w-full max-w-[280px] bg-white rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between h-48"
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              zIndex,
              opacity
            }}
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">Telemetry // 0{card.id}</span>
              <Activity className={`w-4 h-4 transition-colors duration-500 ${isFront ? card.color : 'text-black/20'}`} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A] mb-1">{card.label}</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-display font-light transition-colors duration-500 ${card.color}`}>{card.value}</span>
                <span className="text-xs font-mono text-black/50">{card.unit}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isFront ? 'bg-green-500 animate-pulse' : 'bg-black/10'}`}></div>
              <span className="text-[10px] font-mono uppercase text-black/50">{card.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TelemetryTypewriter = () => {
  const lines = [
    "Establishing neural handshake...",
    "Analyzing circadian rhythm variance...",
    "Optimizing cortisol curve...",
    "System aligned. Awaiting protocol."
  ];
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetText = lines[currentLineIdx];
    const typingSpeed = isDeleting ? 30 : 50;
    const pauseTime = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentText === targetText) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentLineIdx((prev) => (prev + 1) % lines.length);
      } else {
        const nextChar = isDeleting 
          ? targetText.substring(0, currentText.length - 1)
          : targetText.substring(0, currentText.length + 1);
        setCurrentText(nextChar);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentLineIdx]);

  return (
    <div className="bg-[#1A1A1A] rounded-[2rem] p-6 h-full flex flex-col justify-between border border-white/10 text-white font-mono text-sm shadow-inner relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#CC5833]/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#CC5833]/20 transition-colors duration-1000"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <span className="text-[10px] text-white/40 tracking-widest uppercase">Live Stream</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#CC5833] rounded-full animate-pulse shadow-[0_0_10px_#CC5833]"></div>
          <span className="text-[10px] text-[#CC5833]">REC</span>
        </div>
      </div>

      <div className="relative z-10 flex-grow flex flex-col justify-end">
        <div className="text-white/30 text-xs mb-2 leading-relaxed">
          &gt; SYSTEM_INIT<br/>
          &gt; BIOMETRIC_SYNC_OK
        </div>
        <div className="text-[#F2F0E9] leading-relaxed min-h-[3rem]">
          <span className="text-[#CC5833] mr-2">&gt;</span>
          {currentText}
          <span className="inline-block w-2 h-4 bg-[#CC5833] ml-1 align-middle animate-[pulse_1s_step-end_infinite]"></span>
        </div>
      </div>
    </div>
  );
};

const AdaptiveRegimenCard = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-[2rem] p-6 h-full flex flex-col justify-between border border-black/5 relative overflow-hidden">
      <div>
        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#CC5833]" /> Protocol injection
        </h3>
        <div className="flex justify-between mb-8 px-2 relative z-10">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative">
              <span className={`text-xs font-medium transition-colors ${i === 2 ? 'text-[#1A1A1A]' : 'text-black/30'}`}>
                {d}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-black/10"></div>
              {/* CSS Animated active dot for Tuesday (index 2) */}
              {i === 2 && (
                <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#CC5833] animate-dot-pop"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end relative z-10">
        <div className="text-[10px] uppercase tracking-widest font-mono px-4 py-2 rounded-full transition-colors animate-btn-press">
          Compile
        </div>
      </div>

      {/* SVG Mock Cursor with CSS Native Animation */}
      <svg 
        className="absolute top-0 left-0 w-5 h-5 z-20 drop-shadow-md origin-top-left animate-cursor-path" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#1A1A1A" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
        <path d="m13 13 6 6"/>
      </svg>
    </div>
  );
};

const Features = () => {
  return (
    <section id="intelligence" className="py-24 md:py-32 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16 md:mb-24">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#CC5833] mb-4">The Architecture</h2>
        <p className="text-3xl md:text-5xl font-display font-light text-[#1A1A1A] max-w-2xl mx-auto leading-tight">
          Precision instrumentation for your biological hardware.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[22rem]">
        {/* Card 1 */}
        <div className="bg-[#F2F0E9] rounded-[3rem] p-2 flex flex-col border border-[#1A1A1A]/5 hover:border-[#2E4036]/20 transition-colors group">
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-[#2E4036]"/> Audit Intelligence</h3>
            <p className="text-sm text-black/60 mt-1">Continuous biometric normalization.</p>
          </div>
          <div className="flex-grow rounded-[2.5rem] bg-[#E8E6DF] overflow-hidden flex items-center justify-center relative">
             <DiagnosticShuffler />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#F2F0E9] rounded-[3rem] p-2 flex flex-col border border-[#1A1A1A]/5 hover:border-[#CC5833]/20 transition-colors group md:col-span-1">
           <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-[#CC5833]"/> Neural Stream</h3>
            <p className="text-sm text-black/60 mt-1">Real-time physiological telemetry.</p>
          </div>
          <div className="flex-grow rounded-[2.5rem] bg-[#1A1A1A] p-2">
            <TelemetryTypewriter />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#F2F0E9] rounded-[3rem] p-2 flex flex-col border border-[#1A1A1A]/5 hover:border-[#2E4036]/20 transition-colors group">
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Crosshair className="w-5 h-5 text-[#2E4036]"/> Adaptive Regimen</h3>
            <p className="text-sm text-black/60 mt-1">Automated micro-adjustments.</p>
          </div>
          <div className="flex-grow rounded-[2.5rem] bg-[#E8E6DF] p-2">
             <AdaptiveRegimenCard />
          </div>
        </div>
      </div>
    </section>
  );
};

// --- PHILOSOPHY (MANIFESTO) ---

const Philosophy = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="manifesto" className="relative py-32 md:py-48 bg-[#1A1A1A] text-[#F2F0E9] overflow-hidden rounded-[3rem] mx-2 md:mx-4 my-8">
      <div 
        className="absolute inset-[-20%] bg-cover bg-center opacity-30 mix-blend-luminosity grayscale will-change-transform"
        style={{ 
          backgroundImage: `url(${IMAGES.philosophy})`,
          transform: `translateY(${scrollY * 0.15}px)` 
        }}
      />
      <div className="absolute inset-0 bg-[#2E4036]/80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-transparent to-[#1A1A1A]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center manifesto-text">
        <p className="text-xl md:text-3xl font-light text-white/50 mb-8 tracking-wide">
          <SplitTextReveal text="Modern medicine asks: What is wrong?" />
        </p>
        <h2 className="text-4xl md:text-7xl lg:text-8xl font-serif italic text-[#CC5833] leading-tight">
          <SplitTextReveal text="We ask: What is optimal?" />
        </h2>
        
        <div className="mt-16 inline-flex flex-col items-center">
          <div className="w-[1px] h-24 bg-gradient-to-b from-[#CC5833] to-transparent opacity-50 mb-8"></div>
          <p className="text-sm font-mono tracking-widest text-white/40 uppercase">Shift the paradigm</p>
        </div>
      </div>
    </section>
  );
};

// --- PROTOCOL (STICKY STACKING) ---

const ProtocolArtifact1 = () => (
  <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none mix-blend-multiply">
    <svg width="400" height="400" viewBox="0 0 100 100" className="animate-[spin_40s_linear_infinite]">
      <g stroke="#2E4036" strokeWidth="0.5" fill="none">
        <circle cx="50" cy="50" r="40" strokeDasharray="2 4" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="20" strokeDasharray="1 6" strokeWidth="2"/>
        <path d="M50 10 L50 90 M10 50 L90 50" opacity="0.5" />
      </g>
    </svg>
  </div>
);

const ProtocolArtifact2 = () => (
  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none mix-blend-multiply overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(46,64,54,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(46,64,54,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#CC5833] shadow-[0_0_15px_#CC5833] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
    <style>{`@keyframes scan { from { top: 0; } to { top: 100%; } }`}</style>
  </div>
);

const ProtocolArtifact3 = () => (
  <div className="absolute bottom-10 left-10 w-[60vw] opacity-30 pointer-events-none mix-blend-multiply">
    <svg viewBox="0 0 500 100" className="w-full h-auto drop-shadow-lg">
      <path 
        className="animate-draw-line"
        d="M0,50 L100,50 L120,20 L140,80 L160,10 L180,90 L200,50 L500,50" 
        fill="none" 
        stroke="#CC5833" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
      />
    </svg>
  </div>
);

const ProtocolStack = () => {
  const protocolData = [
    {
      title: "Cellular Baseline",
      subtitle: "Phase 01",
      desc: "Comprehensive multi-omic sequencing to map your biological terrain. We establish the ground truth of your health architecture.",
      color: "bg-[#E8E6DF]",
      Artifact: ProtocolArtifact1
    },
    {
      title: "Algorithmic Mapping",
      subtitle: "Phase 02",
      desc: "Data is fed into our proprietary Nura core. We identify friction points in your metabolic and neural pathways.",
      color: "bg-[#D6D3CA]",
      Artifact: ProtocolArtifact2
    },
    {
      title: "Precision Intervention",
      subtitle: "Phase 03",
      desc: "Deployment of targeted clinical protocols. Continuous telemetry ensures adaptation. Your biology, fully optimized.",
      color: "bg-[#C4C0B5]",
      Artifact: ProtocolArtifact3
    }
  ];

  return (
    <section id="protocol" className="relative bg-[#F2F0E9]">
      {protocolData.map((data, i) => (
        <div 
          key={i} 
          className={`sticky top-0 w-full h-screen flex flex-col justify-center p-8 md:p-24 origin-top shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ${data.color} rounded-t-[3rem] overflow-hidden`}
          style={{ zIndex: i + 1 }}
        >
          <div className="max-w-3xl relative z-10 animate-fade-up">
            <span className="font-mono text-sm tracking-widest text-[#CC5833] uppercase mb-4 block">
              {data.subtitle}
            </span>
            <h2 className="text-5xl md:text-7xl font-display text-[#2E4036] tracking-tight mb-8">
              {data.title}
            </h2>
            <p className="text-xl text-[#1A1A1A]/70 max-w-xl font-light leading-relaxed">
              {data.desc}
            </p>
          </div>
          <data.Artifact />
        </div>
      ))}
    </section>
  );
};

// --- MEMBERSHIP & FOOTER ---

const Membership = () => {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto relative z-10 bg-[#F2F0E9]">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-serif italic text-[#1A1A1A] mb-4">Engage the System</h2>
        <p className="font-mono text-sm uppercase tracking-widest text-black/50">Select your protocol tier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Tier 1 */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-black/5">
          <h3 className="font-display text-2xl mb-2">Essential</h3>
          <p className="text-black/50 text-sm mb-8">Baseline telemetry and quarterly biological audits.</p>
          <div className="text-4xl font-light mb-8">$2,500 <span className="text-sm text-black/40">/yr</span></div>
          <ul className="space-y-4 mb-10 text-sm">
             <li className="flex gap-3 text-black/70"><Check className="w-5 h-5 text-[#2E4036]" /> Full Epigenetic Panel</li>
             <li className="flex gap-3 text-black/70"><Check className="w-5 h-5 text-[#2E4036]" /> Microbiome Sequencing</li>
             <li className="flex gap-3 text-black/70"><Check className="w-5 h-5 text-[#2E4036]" /> Digital Dashboard Access</li>
          </ul>
          <MagneticButton variant="light" className="w-full py-4">Initialize</MagneticButton>
        </div>

        {/* Tier 2 (Highlighted) */}
        <div className="bg-[#2E4036] p-10 rounded-[3rem] border-none text-[#F2F0E9] transform md:scale-105 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC5833]/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#CC5833]/30 transition-colors duration-1000"></div>
          
          <div className="relative z-10">
            <span className="bg-[#CC5833] text-white text-[10px] uppercase font-mono px-3 py-1 rounded-full mb-6 inline-block">Recommended</span>
            <h3 className="font-display text-3xl mb-2 text-white">Performance</h3>
            <p className="text-white/60 text-sm mb-8">Continuous active telemetry and dynamic protocol adjustment.</p>
            <div className="text-5xl font-light mb-8 text-white">$8,000 <span className="text-sm text-white/40">/yr</span></div>
            <ul className="space-y-4 mb-10 text-sm">
               <li className="flex gap-3 text-white/90"><Check className="w-5 h-5 text-[#CC5833]" /> Everything in Essential</li>
               <li className="flex gap-3 text-white/90"><Check className="w-5 h-5 text-[#CC5833]" /> Wearable API Integration</li>
               <li className="flex gap-3 text-white/90"><Check className="w-5 h-5 text-[#CC5833]" /> Monthly Clinical Consults</li>
               <li className="flex gap-3 text-white/90"><Check className="w-5 h-5 text-[#CC5833]" /> Adaptive Nootropic Stack</li>
            </ul>
            <MagneticButton variant="clay" className="w-full py-4 shadow-[0_10px_20px_rgba(204,88,51,0.3)]">
              Begin Protocol
            </MagneticButton>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-black/5">
          <h3 className="font-display text-2xl mb-2">Longevity</h3>
          <p className="text-black/50 text-sm mb-8">The absolute pinnacle of biological engineering.</p>
          <div className="text-4xl font-light mb-8">Custom</div>
          <ul className="space-y-4 mb-10 text-sm opacity-50">
             <li className="flex gap-3 text-black/70">Requires Medical Review</li>
             <li className="flex gap-3 text-black/70">Waitlist Applicable</li>
          </ul>
          <MagneticButton variant="light" className="w-full py-4 text-black/50 border-dashed border-black/20">
            Apply for Waitlist
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#1A1A1A] text-[#F2F0E9] rounded-t-[4rem] pt-24 pb-12 px-8 mt-20 relative z-20">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
      
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-4 h-4 rounded-full bg-white"></div>
          <span className="font-display font-semibold tracking-widest text-2xl">NURA</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-white/40 uppercase tracking-widest mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          System Operational
        </div>
        <p className="text-white/30 text-xs max-w-sm leading-relaxed">
          Nura Health operates at the intersection of computational biology and high-end clinical practice. Not intended to diagnose or treat specific diseases without consultation.
        </p>
      </div>

      <div className="flex gap-16 text-sm font-medium">
        <div className="flex flex-col gap-4">
          <span className="text-white/30 font-mono text-[10px] uppercase tracking-widest mb-2">Platform</span>
          <a href="#" className="hover:text-[#CC5833] transition-colors">Audit Console</a>
          <a href="#" className="hover:text-[#CC5833] transition-colors">The Science</a>
          <a href="#" className="hover:text-[#CC5833] transition-colors">Research Pubs</a>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-white/30 font-mono text-[10px] uppercase tracking-widest mb-2">Company</span>
          <a href="#" className="hover:text-[#CC5833] transition-colors">Manifesto</a>
          <a href="#" className="hover:text-[#CC5833] transition-colors">Careers</a>
          <a href="#" className="hover:text-[#CC5833] transition-colors">Contact</a>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/10 flex justify-between items-center text-xs text-white/30">
      <span>&copy; {new Date().getFullYear()} Nura Systems Inc.</span>
      <div className="flex gap-4">
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
      </div>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  return (
    <div className="relative min-h-screen selection:bg-[#2E4036] selection:text-[#F2F0E9] overflow-hidden">
      <GlobalStyles />
      <NoiseOverlay />
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <ProtocolStack />
        <Membership />
      </main>
      
      <Footer />
    </div>
  );
}
