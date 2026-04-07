"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const GAME_DURATION = 30;
const CIRCLE_COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
const SPAWN_INTERVAL = 600;

function useGameLoop(active, callback) {
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
      return;
    }
    const loop = (ts) => {
      if (lastRef.current === null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      callbackRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}

let idCounter = 0;
function makeCircle(width) {
  const color = CIRCLE_COLORS[Math.floor(Math.random() * CIRCLE_COLORS.length)];
  const radius = 20 + Math.random() * 22;
  return {
    id: ++idCounter,
    color,
    radius,
    x: radius + Math.random() * (width - radius * 2),
    y: -radius,
    speed: 80 + Math.random() * 140,
  };
}

const PALETTE = {
  red: "#ff3b3b",
  blue: "#3b8fff",
  green: "#3bff6a",
  yellow: "#ffe03b",
  purple: "#b03bff",
  orange: "#ff8c3b",
};

const GLOW = {
  red: "0 0 16px 4px #ff3b3b99",
  blue: "0 0 16px 4px #3b8fff99",
  green: "0 0 16px 4px #3bff6a99",
  yellow: "0 0 16px 4px #ffe03b99",
  purple: "0 0 16px 4px #b03bff99",
  orange: "0 0 16px 4px #ff8c3b99",
};

// ── Screens ──────────────────────────────────────────────────────────────────

function HomeScreen({ onPlay }) {
  return (
    <div style={s.screen}>
      <div style={s.scanlines} />
      <div style={s.homeContent}>
        <div style={s.titleWrap}>
          <span style={{ ...s.titleLetter, color: "#ff3b3b", animationDelay: "0s" }}>C</span>
          <span style={{ ...s.titleLetter, color: "#3b8fff", animationDelay: "0.1s" }}>I</span>
          <span style={{ ...s.titleLetter, color: "#3bff6a", animationDelay: "0.2s" }}>R</span>
          <span style={{ ...s.titleLetter, color: "#ffe03b", animationDelay: "0.3s" }}>C</span>
          <span style={{ ...s.titleLetter, color: "#b03bff", animationDelay: "0.4s" }}>L</span>
          <span style={{ ...s.titleLetter, color: "#ff8c3b", animationDelay: "0.5s" }}>E</span>
          <span style={{ ...s.titleLetter, color: "#ff3b3b", animationDelay: "0.6s" }}> </span>
          <span style={{ ...s.titleLetter, color: "#3b8fff", animationDelay: "0.7s" }}>Z</span>
          <span style={{ ...s.titleLetter, color: "#3bff6a", animationDelay: "0.8s" }}>A</span>
          <span style={{ ...s.titleLetter, color: "#ffe03b", animationDelay: "0.9s" }}>P</span>
        </div>
        <p style={s.subtitle}>Golpeá los rojos. Evitá los demás.</p>
        <div style={s.rulesBox}>
          <div style={s.ruleRow}><span style={{ color: "#ff3b3b", fontSize: 20 }}>●</span><span>Círculo rojo → <b style={{ color: "#3bff6a" }}>+10 pts</b></span></div>
          <div style={s.ruleRow}><span style={{ color: "#888", fontSize: 20 }}>●</span><span>Click errado → <b style={{ color: "#ff3b3b" }}>−20 pts</b></span></div>
          <div style={s.ruleRow}><span style={{ color: "#ff3b3b", fontSize: 20 }}>↓</span><span>Rojo escapa → <b style={{ color: "#ff3b3b" }}>−10 pts</b></span></div>
          <div style={s.ruleRow}><span style={{ color: "#ffe03b", fontSize: 20 }}>⏱</span><span>Tiempo: <b style={{ color: "#ffe03b" }}>30 segundos</b></span></div>
        </div>
        <button style={s.playBtn} onClick={onPlay} onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
          JUGAR!
        </button>
      </div>
    </div>
  );
}

function CountdownModal({ count }) {
  return (
    <div style={s.modalOverlay}>
      <div style={s.modalBox}>
        <p style={{ margin: 0, fontSize: 18, color: "#aaa", letterSpacing: 4, textTransform: "uppercase" }}>Preparate...</p>
        <div style={{ fontSize: 120, fontWeight: 900, fontFamily: "'Courier New', monospace", color: count === 1 ? "#ff3b3b" : count === 2 ? "#ffe03b" : "#3bff6a", lineHeight: 1, textShadow: `0 0 40px currentColor`, animation: "popIn 0.3s ease" }}>
          {count}
        </div>
      </div>
    </div>
  );
}

function ResultModal({ score, onMenu, onReplay }) {
  const rank = score >= 200 ? "LEYENDA" : score >= 100 ? "EXPERTO" : score >= 50 ? "BUENO" : score >= 0 ? "NOVATO" : "NECESITÁS PRÁCTICA";
  const rankColor = score >= 200 ? "#ffe03b" : score >= 100 ? "#3bff6a" : score >= 50 ? "#3b8fff" : score >= 0 ? "#aaa" : "#ff3b3b";
  return (
    <div style={s.modalOverlay}>
      <div style={s.modalBox}>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666", letterSpacing: 4, textTransform: "uppercase" }}>Tiempo!</p>
        <p style={{ margin: "0 0 16px", fontSize: 18, color: rankColor, letterSpacing: 3, fontWeight: 700 }}>{rank}</p>
        <div style={{ fontSize: 80, fontWeight: 900, fontFamily: "'Courier New', monospace", color: score < 0 ? "#ff3b3b" : "#fff", textShadow: `0 0 30px ${score < 0 ? "#ff3b3b" : "#fff"}`, lineHeight: 1 }}>
          {score}
        </div>
        <p style={{ color: "#666", fontSize: 14, margin: "4px 0 28px" }}>puntos</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={s.secondaryBtn} onClick={onMenu}>Menú principal</button>
          <button style={s.playBtn} onClick={onReplay}>Volver a jugar</button>
        </div>
      </div>
    </div>
  );
}

// ── Game ─────────────────────────────────────────────────────────────────────

function GameScreen({ onEnd }) {
  const areaRef = useRef(null);
  const [circles, setCircles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [flashes, setFlashes] = useState([]);
  const circlesRef = useRef([]);
  const scoreRef = useRef(0);
  const spawnTimer = useRef(0);
  const gameTimer = useRef(0);
  const ended = useRef(false);
  const widthRef = useRef(400);

  useEffect(() => {
    if (areaRef.current) widthRef.current = areaRef.current.clientWidth;
  }, []);

  const addFlash = (x, y, text, color) => {
    const id = ++idCounter;
    setFlashes(f => [...f, { id, x, y, text, color }]);
    setTimeout(() => setFlashes(f => f.filter(fl => fl.id !== id)), 700);
  };

  const handleMiss = useCallback((e) => {
    if (ended.current) return;
    scoreRef.current -= 20;
    setScore(scoreRef.current);
    const rect = areaRef.current.getBoundingClientRect();
    addFlash(e.clientX - rect.left, e.clientY - rect.top, "−20", "#ff3b3b");
  }, []);

  const handleCircleClick = useCallback((e, id, color) => {
    e.stopPropagation();
    if (ended.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (color === "red") {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      addFlash(cx, cy, "+10", "#3bff6a");
    } else {
      scoreRef.current -= 20;
      setScore(scoreRef.current);
      addFlash(cx, cy, "−20", "#ff3b3b");
    }
    circlesRef.current = circlesRef.current.filter(c => c.id !== id);
    setCircles([...circlesRef.current]);
  }, []);

  useGameLoop(true, useCallback((dt) => {
    if (ended.current) return;

    // Timer
    gameTimer.current += dt;
    const remaining = Math.max(0, GAME_DURATION - gameTimer.current);
    setTimeLeft(Math.ceil(remaining));
    if (remaining <= 0 && !ended.current) {
      ended.current = true;
      onEnd(scoreRef.current);
      return;
    }

    // Spawn
    spawnTimer.current += dt;
    if (spawnTimer.current * 1000 >= SPAWN_INTERVAL) {
      spawnTimer.current = 0;
      const c = makeCircle(widthRef.current);
      circlesRef.current = [...circlesRef.current, c];
    }

    // Move
    const height = areaRef.current?.clientHeight ?? 500;
    const next = [];
    for (const c of circlesRef.current) {
      const ny = c.y + c.speed * dt;
      if (ny - c.radius > height) {
        if (c.color === "red") {
          scoreRef.current -= 10;
          setScore(scoreRef.current);
          addFlash(c.x, height - 10, "−10", "#ff8c3b");
        }
      } else {
        next.push({ ...c, y: ny });
      }
    }
    circlesRef.current = next;
    setCircles([...next]);
  }, [onEnd]));

  const pct = timeLeft / GAME_DURATION;
  const timerColor = pct > 0.5 ? "#3bff6a" : pct > 0.25 ? "#ffe03b" : "#ff3b3b";

  return (
    <div style={s.screen}>
      <div style={s.scanlines} />
      {/* HUD */}
      <div style={s.hud}>
        <div style={s.hudScore}>
          <span style={{ fontSize: 11, color: "#666", letterSpacing: 3 }}>SCORE</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: scoreRef.current < 0 ? "#ff3b3b" : "#fff", fontFamily: "'Courier New', monospace" }}>{score}</span>
        </div>
        <div style={s.timerWrap}>
          <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#222" strokeWidth="5" />
            <circle cx="32" cy="32" r="26" fill="none" stroke={timerColor} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct)}`}
              style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.3s" }} />
          </svg>
          <span style={{ position: "absolute", fontSize: 18, fontWeight: 700, color: timerColor, fontFamily: "'Courier New', monospace" }}>{timeLeft}</span>
        </div>
      </div>

      {/* Arena */}
      <div ref={areaRef} style={s.arena} onClick={handleMiss}>
        {circles.map(c => (
          <div key={c.id}
            onClick={e => handleCircleClick(e, c.id, c.color)}
            style={{
              position: "absolute",
              left: c.x - c.radius,
              top: c.y - c.radius,
              width: c.radius * 2,
              height: c.radius * 2,
              borderRadius: "50%",
              background: PALETTE[c.color],
              boxShadow: GLOW[c.color],
              cursor: "crosshair",
              border: "2px solid rgba(255,255,255,0.15)",
              transition: "transform 0.05s",
            }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ))}
        {flashes.map(f => (
          <div key={f.id} style={{
            position: "absolute", left: f.x - 20, top: f.y - 10,
            color: f.color, fontWeight: 900, fontSize: 20,
            fontFamily: "'Courier New', monospace",
            pointerEvents: "none", animation: "floatUp 0.7s ease forwards",
            textShadow: `0 0 8px ${f.color}`,
          }}>{f.text}</div>
        ))}
        <div style={s.bottomLine} />
      </div>

      <style>{`
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-48px)} }
        @keyframes popIn { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pulse { 0%,100%{opacity:0.03} 50%{opacity:0.06} }
        @keyframes titleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState("home"); // home | countdown | game | result
  const [countdown, setCountdown] = useState(3);
  const [finalScore, setFinalScore] = useState(0);

  const startCountdown = () => {
    setPhase("countdown");
    setCountdown(3);
    let n = 3;
    const iv = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(iv);
        setPhase("game");
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  const handleEnd = (score) => {
    setFinalScore(score);
    setTimeout(() => setPhase("result"), 300);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#080810", overflow: "hidden", position: "relative" }}>
      {(phase === "home") && <HomeScreen onPlay={startCountdown} />}
      {(phase === "countdown" || phase === "game") && (
        <GameScreen key={phase === "game" ? "game" : "pre"} onEnd={handleEnd} />
      )}
      {phase === "countdown" && <CountdownModal count={countdown} />}
      {phase === "result" && (
        <>
          <GameScreen key="bg" onEnd={() => {}} />
          <ResultModal score={finalScore} onMenu={() => setPhase("home")} onReplay={startCountdown} />
        </>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  screen: {
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column",
    background: "#080810",
    position: "relative", overflow: "hidden",
    fontFamily: "'Courier New', monospace",
  },
  scanlines: {
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    animation: "pulse 3s ease infinite",
  },
  homeContent: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 24, padding: 32,
  },
  titleWrap: {
    display: "flex", gap: 2, userSelect: "none",
  },
  titleLetter: {
    fontSize: 56, fontWeight: 900, letterSpacing: 2,
    animation: "titleFloat 2s ease infinite",
    textShadow: "0 0 24px currentColor",
  },
  subtitle: {
    color: "#555", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", margin: 0,
  },
  rulesBox: {
    background: "#0e0e1a", border: "1px solid #222",
    borderRadius: 8, padding: "16px 24px",
    display: "flex", flexDirection: "column", gap: 10,
  },
  ruleRow: {
    display: "flex", gap: 12, alignItems: "center",
    color: "#aaa", fontSize: 15,
  },
  playBtn: {
    background: "#ff3b3b", color: "#fff", border: "none",
    padding: "14px 48px", fontSize: 20, fontWeight: 900,
    borderRadius: 6, cursor: "pointer", letterSpacing: 4,
    boxShadow: "0 0 32px #ff3b3b88",
    transition: "transform 0.15s",
    fontFamily: "'Courier New', monospace",
  },
  secondaryBtn: {
    background: "transparent", color: "#aaa",
    border: "1px solid #333", padding: "14px 20px",
    fontSize: 14, fontWeight: 700, borderRadius: 6,
    cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace",
    transition: "border-color 0.15s, color 0.15s",
  },
  hud: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 24px", background: "#0a0a16",
    borderBottom: "1px solid #1a1a2e", flexShrink: 0, zIndex: 5,
  },
  hudScore: {
    display: "flex", flexDirection: "column", lineHeight: 1,
  },
  timerWrap: {
    position: "relative", width: 64, height: 64,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  arena: {
    flex: 1, position: "relative", cursor: "crosshair", overflow: "hidden",
  },
  bottomLine: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 2, background: "#ff3b3b44",
    boxShadow: "0 0 12px #ff3b3b66",
  },
  modalOverlay: {
    position: "absolute", inset: 0, zIndex: 20,
    background: "rgba(0,0,0,0.82)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modalBox: {
    background: "#0e0e1a", border: "1px solid #2a2a3e",
    borderRadius: 16, padding: "40px 56px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
    boxShadow: "0 0 80px #000",
    animation: "popIn 0.25s ease",
  },
};
