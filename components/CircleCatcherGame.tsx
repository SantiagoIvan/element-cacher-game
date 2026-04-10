"use client";

import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
import {useTheme} from "@/hooks/useTheme";
import Image from "next/image";

// ── ENV Config ────────────────────────────────────────────────────────────────

const GAME_DURATION   = Number(process.env.NEXT_PUBLIC_GAME_DURATION)   || 30;
const SPAWN_INTERVAL  = Number(process.env.NEXT_PUBLIC_SPAWN_INTERVAL)  || 600;
const SPEED_MIN       = Number(process.env.NEXT_PUBLIC_CIRCLE_SPEED_MIN)|| 80;
const SPEED_MAX       = Number(process.env.NEXT_PUBLIC_CIRCLE_SPEED_MAX)|| 220;
const POINTS_HIT      = Number(process.env.NEXT_PUBLIC_POINTS_HIT)      || 10;
const POINTS_MISS     = Number(process.env.NEXT_PUBLIC_POINTS_MISS)     || -20;
const COUNTDOWN_START = Number(process.env.NEXT_PUBLIC_COUNTDOWN_START) || 3;

// ── Types ─────────────────────────────────────────────────────────────────────

type GamePhase = "home" | "selection" | "countdown" | "game" | "result";

type TargetImage = {
    src: string;
    color: string;
};

type Circle = {
    id: number;
    image: TargetImage;
    radius: number;
    x: number;
    y: number;
    speed: number;
};

type Flash = {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const TARGET_IMAGES: TargetImage[] = [
    { src: "/1-frutilla.jpg",       color: "#F03687" },
    { src: "/2-vainilla.jpg",       color: "#F6D788" },
    { src: "/3-frutilla-light.jpg", color: "#F9D6D5" },
    { src: "/4-vainilla-light.jpg", color: "#F9F5E3" },
];

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let idCounter = 0;

function makeCircle(width: number): Circle {
    const image = pickRandom(TARGET_IMAGES);
    const radius = 36 + Math.random() * 20;
    return {
        id: ++idCounter,
        image,
        radius,
        x: radius + Math.random() * (width - radius * 2),
        y: -radius,
        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
    };
}

function getRank(score: number): { label: string; color: string } {
    return { label: "",           color: "" };
    if (score >= 200) return { label: "LEYENDA",           color: "#ffe03b" };
    if (score >= 100) return { label: "EXPERTO",           color: "#3bff6a" };
    if (score >= 50)  return { label: "BUENO",             color: "#3b8fff" };
    if (score >= 0)   return { label: "NOVATO",            color: "#aaa"    };
    return               { label: "NECESITÁS PRÁCTICA", color: "#ff3b3b" };
}

// ── useGameLoop ───────────────────────────────────────────────────────────────

function useGameLoop(active: boolean, callback: (dt: number) => void): void {
    const rafRef = useRef<number | null>(null);
    const lastRef = useRef<number | null>(null);
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        if (!active) {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            lastRef.current = null;
            return;
        }
        const loop = (ts: number) => {
            if (lastRef.current === null) lastRef.current = ts;
            const dt = (ts - lastRef.current) / 1000;
            lastRef.current = ts;
            callbackRef.current(dt);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            lastRef.current = null;
        };
    }, [active]);
}

// ── HomeScreen ────────────────────────────────────────────────────────────────

const TITLE = "CIRCLE ZAP";

function HomeScreen({ onPlay }: { onPlay: () => void }) {
    const colors = TARGET_IMAGES.map((t) => t.color);
    return (
        <div style={s.screen}>
            <div style={s.scanlines} />
            <div style={s.homeContent}>
                <img
                    src="/Tregar_logo.jpg"
                    alt="Tregar"
                    style={{
                        height: 48,
                        width: "auto",
                        objectFit: "contain",
                        marginBottom: 8,
                    }}
                />
                <div style={s.titleWrap}>
                    {TITLE.split("").map((char, i) => {
                        const color = colors[i % colors.length];
                        return (
                            <span key={i} style={{ ...s.titleLetter, color, textShadow: `0 0 24px ${color}`, animationDelay: `${i * 0.1}s` }}>
                {char}
              </span>
                        );
                    })}
                </div>
                <p style={s.subtitle}>Capturá el objeto correcto. Evitá los demás.</p>
                <div style={s.rulesBox}>
                    <div style={s.ruleRow}><span style={{ fontSize: 20 }}>🎯</span><span>Objeto correcto → <b style={{ color: "#3bff6a" }}>+{POINTS_HIT} pts</b></span></div>
                    <div style={s.ruleRow}><span style={{ fontSize: 20 }}>❌</span><span>Click errado → <b style={{ color: "#ff3b3b" }}>{POINTS_MISS} pts</b></span></div>
                    <div style={s.ruleRow}><span style={{ fontSize: 20 }}>⏱</span><span>Tiempo: <b style={{ color: "#ffe03b" }}>{GAME_DURATION} segundos</b></span></div>
                </div>
                <button
                    style={s.playBtn}
                    onClick={onPlay}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    JUGAR!
                </button>
            </div>
            <style>{KEYFRAMES}</style>
        </div>
    );
}

// ── SelectionModal ────────────────────────────────────────────────────────────

function SelectionModal({ target, onStart }: { target: TargetImage; onStart: () => void }) {
    return (
        <div style={s.modalOverlay}>
            <div style={{ ...s.modalBox, gap: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#666", letterSpacing: 4, textTransform: "uppercase" }}>
                    Capturá este objeto
                </p>
                <div style={{
                    width: 120, height: 120,
                    borderRadius: "50%",
                    background: target.color,
                    overflow: "hidden",
                    border: `4px solid ${target.color}`,
                    boxShadow: `0 0 32px ${target.color}88`,
                    animation: "popIn 0.4s ease",
                }}>
                    <img src={target.src} alt="objetivo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#aaa", textAlign: "center", maxWidth: 200, lineHeight: 1.5 }}>
                    Este es el objeto que debés capturar durante la partida.
                </p>
                <button
                    style={{ ...s.playBtn, fontSize: 16, padding: "12px 40px", letterSpacing: 2 }}
                    onClick={onStart}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    ¡Empezar!
                </button>
            </div>
            <style>{KEYFRAMES}</style>
        </div>
    );
}

// ── CountdownModal ────────────────────────────────────────────────────────────

function CountdownModal({ count }: { count: number }) {
    const color = count === 1 ? "#ff3b3b" : count === 2 ? "#ffe03b" : "#3bff6a";
    return (
        <div style={s.modalOverlay}>
            <div style={s.modalBox}>
                <p style={{ margin: 0, fontSize: 18, color: "#aaa", letterSpacing: 4, textTransform: "uppercase" }}>Preparate...</p>
                <div style={{ fontSize: 120, fontWeight: 900, fontFamily: "'Courier New', monospace", color, lineHeight: 1, textShadow: `0 0 40px ${color}`, animation: "popIn 0.3s ease" }}>
                    {count}
                </div>
            </div>
            <style>{KEYFRAMES}</style>
        </div>
    );
}

// ── ResultModal ───────────────────────────────────────────────────────────────

function ResultModal({ score, target, onMenu, onReplay }: { score: number; target: TargetImage; onMenu: () => void; onReplay: () => void }) {
    const rank = getRank(score);
    const scoreColor = score < 0 ? "#ff3b3b" : "#fff";
    return (
        <div style={s.modalOverlay}>
            <div style={{ ...s.modalBox, gap: 8 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666", letterSpacing: 4, textTransform: "uppercase" }}>¡Tiempo!</p>
                <p style={{ margin: "0 0 12px", fontSize: 18, color: rank.color, letterSpacing: 3, fontWeight: 700 }}>{rank.label}</p>
                <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: target.color, overflow: "hidden",
                    border: `3px solid ${target.color}`,
                    boxShadow: `0 0 16px ${target.color}88`,
                    marginBottom: 4,
                }}>
                    <img src={target.src} alt="objetivo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ fontSize: 80, fontWeight: 900, fontFamily: "'Courier New', monospace", color: scoreColor, textShadow: `0 0 30px ${scoreColor}`, lineHeight: 1 }}>
                    {score}
                </div>
                <p style={{ color: "#666", fontSize: 14, margin: "4px 0 24px" }}>puntos</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button style={s.secondaryBtn} onClick={onMenu}>Menú principal</button>
                    <button
                        style={s.playBtn}
                        onClick={onReplay}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        Volver a jugar
                    </button>
                </div>
            </div>
            <style>{KEYFRAMES}</style>
        </div>
    );
}

// ── GameScreen ────────────────────────────────────────────────────────────────

function GameScreen({ target, onEnd }: { target: TargetImage | null; onEnd?: (score: number) => void }) {
    const areaRef = useRef<HTMLDivElement>(null);
    const [circles, setCircles] = useState<Circle[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [flashes, setFlashes] = useState<Flash[]>([]);

    const circlesRef  = useRef<Circle[]>([]);
    const scoreRef    = useRef(0);
    const spawnTimer  = useRef(0);
    const gameTimer   = useRef(0);
    const ended       = useRef(false);
    const widthRef    = useRef(400);
    const heightRef   = useRef(600);

    const active = !!onEnd && !!target;

    useEffect(() => {
        const el = areaRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            widthRef.current  = entry.contentRect.width;
            heightRef.current = entry.contentRect.height;
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const addFlash = useCallback((x: number, y: number, text: string, color: string) => {
        const id = ++idCounter;
        setFlashes((f) => [...f, { id, x, y, text, color }]);
        setTimeout(() => setFlashes((f) => f.filter((fl) => fl.id !== id)), 700);
    }, []);

    const handleMiss = useCallback((e: React.MouseEvent) => {
        if (!active || ended.current || !areaRef.current) return;
        scoreRef.current += POINTS_MISS;
        setScore(scoreRef.current);
        const rect = areaRef.current.getBoundingClientRect();
        addFlash(e.clientX - rect.left, e.clientY - rect.top, `${POINTS_MISS}`, "#ff3b3b");
    }, [active, addFlash]);

    const handleCircleClick = useCallback((e: React.MouseEvent, circle: Circle) => {
        e.stopPropagation();
        if (!active || ended.current || !areaRef.current || !target) return;
        const rect = areaRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const isCorrect = circle.image.src === target.src;
        if (isCorrect) {
            scoreRef.current += POINTS_HIT;
            addFlash(cx, cy, `+${POINTS_HIT}`, "#3bff6a");
        } else {
            scoreRef.current += POINTS_MISS;
            addFlash(cx, cy, `${POINTS_MISS}`, "#ff3b3b");
        }
        setScore(scoreRef.current);
        circlesRef.current = circlesRef.current.filter((c) => c.id !== circle.id);
        setCircles([...circlesRef.current]);
    }, [active, target, addFlash]);

    useGameLoop(active, useCallback((dt: number) => {
        if (ended.current) return;

        // Timer
        gameTimer.current += dt;
        const remaining = Math.max(0, GAME_DURATION - gameTimer.current);
        setTimeLeft(Math.ceil(remaining));
        if (remaining <= 0) {
            ended.current = true;
            onEnd?.(scoreRef.current);
            return;
        }

        // Spawn
        spawnTimer.current += dt * 1000;
        if (spawnTimer.current >= SPAWN_INTERVAL) {
            spawnTimer.current = 0;
            circlesRef.current = [...circlesRef.current, makeCircle(widthRef.current)];
        }

        // Move + detectar escape
        const next: Circle[] = [];
        for (const c of circlesRef.current) {
            const ny = c.y + c.speed * dt;
            if (ny - c.radius > heightRef.current) {
                // círculos incorrectos que escapan no penalizan
            } else {
                next.push({ ...c, y: ny });
            }
        }
        circlesRef.current = next;
        setCircles([...next]);
    }, [onEnd]));

    const pct = timeLeft / GAME_DURATION;
    const timerColor = pct > 0.5 ? "#3bff6a" : pct > 0.25 ? "#ffe03b" : "#ff3b3b";
    const circumference = 2 * Math.PI * 26;

    return (
        <div style={s.screen}>
            <div style={s.scanlines} />

            {/* HUD */}
            <div style={s.hud}>
                <div style={s.hudScore}>
                    <span style={{ fontSize: 11, color: "#666", letterSpacing: 3 }}>SCORE</span>
                    <span style={{ fontSize: 32, fontWeight: 900, color: score < 0 ? "#ff3b3b" : "#fff", fontFamily: "'Courier New', monospace" }}>{score}</span>
                </div>

                {/* Target indicator */}
                {target && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase" }}>Capturá</span>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: target.color, overflow: "hidden",
                            border: `2px solid ${target.color}`,
                            boxShadow: `0 0 12px ${target.color}88`,
                        }}>
                            <img src={target.src} alt="objetivo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    </div>
                )}

                <div style={s.timerWrap}>
                    <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#222" strokeWidth="5" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={timerColor} strokeWidth="5"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - pct)}
                                style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.3s" }}
                        />
                    </svg>
                    <span style={{ position: "absolute", fontSize: 18, fontWeight: 700, color: timerColor, fontFamily: "'Courier New', monospace" }}>{timeLeft}</span>
                </div>
            </div>

            {/* Arena */}
            <div ref={areaRef} style={s.arena} onClick={handleMiss}>
                {circles.map((c) => (
                    <div
                        key={c.id}
                        onClick={(e) => handleCircleClick(e, c)}
                        style={{
                            position: "absolute",
                            left: c.x - c.radius,
                            top: c.y - c.radius,
                            width: c.radius * 2,
                            height: c.radius * 2,
                            borderRadius: "50%",
                            background: c.image.color,
                            overflow: "hidden",
                            border: `3px solid ${c.image.color}`,
                            boxShadow: `0 0 16px ${c.image.color}88`,
                            cursor: "crosshair",
                            transition: "transform 0.05s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        <img
                            src={c.image.src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                        />
                    </div>
                ))}

                {flashes.map((f) => (
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

            <style>{KEYFRAMES}</style>
        </div>
    );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
    const [phase, setPhase] = useState<GamePhase>("home");
    const [countdown, setCountdown] = useState(COUNTDOWN_START);
    const [finalScore, setFinalScore] = useState(0);
    const [target, setTarget] = useState<TargetImage | null>(null);
    const { toggle, isDark } = useTheme();

    const startSelection = useCallback(() => {
        setTarget(pickRandom(TARGET_IMAGES));
        setPhase("selection");
    }, []);

    const startCountdown = useCallback(() => {
        setPhase("countdown");
        setCountdown(COUNTDOWN_START);
        let n = COUNTDOWN_START;
        const iv = setInterval(() => {
            n--;
            if (n <= 0) {
                clearInterval(iv);
                setPhase("game");
            } else {
                setCountdown(n);
            }
        }, 1000);
    }, []);

    const handleEnd = useCallback((score: number) => {
        setFinalScore(score);
        setTimeout(() => setPhase("result"), 300);
    }, []);

    const handleReplay = useCallback(() => {
        setTarget(pickRandom(TARGET_IMAGES));
        setPhase("selection");
    }, []);

    return (
        <div
            style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}
            className={"pattern-bg bg-(--bg-primary)"}
        >

            {phase === "home" && <HomeScreen onPlay={startSelection} />}

            {(phase === "countdown" || phase === "game") && (
                <GameScreen key="game" target={target} onEnd={handleEnd} />
            )}

            {phase === "selection" && (
                <>
                    <GameScreen key="selection-bg" target={null} />
                    <SelectionModal target={target!} onStart={startCountdown} />
                </>
            )}

            {phase === "countdown" && <CountdownModal count={countdown} />}

            {phase === "result" && (
                <>
                    <GameScreen key="result-bg" target={null} />
                    <ResultModal score={finalScore} target={target!} onMenu={() => setPhase("home")} onReplay={handleReplay} />
                </>
            )}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes floatUp    { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-48px)} }
  @keyframes popIn      { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes pulse      { 0%,100%{opacity:0.03} 50%{opacity:0.06} }
  @keyframes titleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
`;

const s: Record<string, CSSProperties> = {
    screen: {
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        //background: "var(--bg-primary)",
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
    } as CSSProperties,
    subtitle: {
        color: "#555", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", margin: 0,
    },
    rulesBox: {
        background: "#0e0e1a",
        border: "1px solid #222",
        borderRadius: 8, padding: "16px 24px",
        display: "flex", flexDirection: "column", gap: 10,
    },
    ruleRow: {
        display: "flex", gap: 12, alignItems: "center",
        color: "#aaa", fontSize: 15,
    },
    playBtn: {
        background: "#ff3b3b",
        color: "#fff",
        border: "none",
        padding: "14px 48px", fontSize: 20, fontWeight: 900,
        borderRadius: 6, cursor: "pointer", letterSpacing: 4,
        boxShadow: "0 0 32px #ff3b3b88",
        transition: "transform 0.15s",
        fontFamily: "'Courier New', monospace",
    },
    secondaryBtn: {
        background: "transparent",
        color: "#aaa",
        border: "1px solid #333", padding: "14px 20px",
        fontSize: 14, fontWeight: 700, borderRadius: 6,
        cursor: "pointer", letterSpacing: 2, fontFamily: "'Courier New', monospace",
        transition: "border-color 0.15s, color 0.15s",
    },
    hud: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", //background: "#0a0a16",
        borderBottom: "1px solid #1a1a2e", flexShrink: 0, zIndex: 5,
    },
    hudScore: {
        display: "flex", flexDirection: "column", lineHeight: 1,alignItems: "center"
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
        height: 2,
        background: "#ff3b3b44",
        boxShadow: "0 0 12px #ff3b3b66",
    },
    modalOverlay: {
        position: "absolute", inset: 0, zIndex: 20,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
    },
    modalBox: {
        background: "#0e0e1a",
        border: "1px solid #2a2a3e",
        borderRadius: 16, padding: "40px 56px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4,
        boxShadow: "0 0 80px #000",
        animation: "popIn 0.25s ease",
    },

};