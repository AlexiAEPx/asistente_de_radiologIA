"use client";
import { useState, useRef, useEffect, useMemo } from "react";

const MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku", cost: "💰", desc: "Rápido" },
  { id: "claude-sonnet-4-20250514", label: "Sonnet", cost: "💰💰", desc: "Equilibrado" },
  { id: "claude-opus-4-6", label: "Opus", cost: "💰💰💰", desc: "Máxima calidad" },
];

const palette = (dark) => dark ? {
  bg: "#0e0e18", bg2: "#111120", bg3: "#1a1a2e",
  text: "#e0ddd5", text2: "#aaa", text3: "#777", text4: "#555",
  gold: "#c4973c", goldDim: "rgba(196,151,60,0.5)", goldBorder: "rgba(196,151,60,0.2)", goldBg: "rgba(196,151,60,0.08)", goldBgActive: "rgba(196,151,60,0.12)", goldBorderFocus: "rgba(196,151,60,0.5)",
  inputBg: "rgba(255,255,255,0.04)", inputBgFocus: "rgba(255,255,255,0.07)", inputBorder: "rgba(196,151,60,0.2)",
  bubbleUser: "linear-gradient(135deg,#c4973c,#a07830)", bubbleAsst: "rgba(255,255,255,0.06)", bubbleAsstBorder: "rgba(255,255,255,0.08)",
  reportBg: "linear-gradient(180deg,#1e1e2a,#1a1a28)", reportHeader: "#161622", reportHeaderBorder: "rgba(196,151,60,0.15)", reportTitleColor: "#c4973c",
  legendBg: "#161622", legendBorder: "rgba(196,151,60,0.15)",
  analysisBg: "linear-gradient(180deg,#141428,#12122a)", analysisHeader: "#161630", analysisHeaderBorder: "rgba(99,102,241,0.2)", analysisTitleColor: "#818cf8",
  chatPanelBg: "linear-gradient(180deg,#0e1a14,#0e1818)", chatHeader: "#0f1f16", chatHeaderBorder: "rgba(34,197,94,0.2)", chatTitleColor: "#4ade80",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.08)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#ccc",
  chatInputBg: "rgba(255,255,255,0.04)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#e0ddd5",
  chatInputAreaBg: "#0f1f16", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  dropdownBg: "#1a1a2e", dropdownShadow: "0 8px 24px rgba(0,0,0,0.5)",
  errorBg: "rgba(204,0,0,0.1)", errorBorder: "rgba(204,0,0,0.2)", errorText: "#ff6b6b",
  urgentBg: "rgba(220,38,38,0.15)", ictusBg: "rgba(220,38,38,0.25)",
} : {
  bg: "#f5f3ef", bg2: "#ffffff", bg3: "#fafaf8",
  text: "#1a1a1a", text2: "#555", text3: "#888", text4: "#aaa",
  gold: "#96722a", goldDim: "rgba(150,114,42,0.5)", goldBorder: "rgba(150,114,42,0.2)", goldBg: "rgba(150,114,42,0.06)", goldBgActive: "rgba(150,114,42,0.12)", goldBorderFocus: "rgba(150,114,42,0.45)",
  inputBg: "#ffffff", inputBgFocus: "#fffdf8", inputBorder: "rgba(150,114,42,0.25)",
  bubbleUser: "linear-gradient(135deg,#96722a,#7a5c1f)", bubbleAsst: "#f0ece4", bubbleAsstBorder: "#e0dbd0",
  reportBg: "linear-gradient(180deg,#fdfbf7,#f9f6f0)", reportHeader: "#f5f1ea", reportHeaderBorder: "#e8e4dc", reportTitleColor: "#8a7a60",
  legendBg: "#f5f1ea", legendBorder: "#e8e4dc",
  analysisBg: "linear-gradient(180deg,#fafbff,#f5f7ff)", analysisHeader: "#eef2ff", analysisHeaderBorder: "#c7d2fe", analysisTitleColor: "#4338ca",
  chatPanelBg: "linear-gradient(180deg,#fafdfb,#f5faf6)", chatHeader: "#f0fdf4", chatHeaderBorder: "#bbf7d0", chatTitleColor: "#166534",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.06)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#555",
  chatInputBg: "rgba(255,255,255,0.8)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#333",
  chatInputAreaBg: "#f0fdf4", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  dropdownBg: "#fff", dropdownShadow: "0 8px 24px rgba(0,0,0,0.12)",
  errorBg: "rgba(204,0,0,0.06)", errorBorder: "rgba(204,0,0,0.15)", errorText: "#cc0000",
  urgentBg: "rgba(220,38,38,0.08)", ictusBg: "rgba(220,38,38,0.12)",
};

const CORRECTIONS = `"sin defectos de reflexión"→"sin defectos de repleción"|"angiotomografía"→"AngioTC"|"quiste de tallo"→"quiste de Tarlov"|"protusiones discotróficas"→"protusiones disco-osteofitarias"|"lobo"→"lóbulo"|"baso"/"vaso"(abdominal)→"bazo"|"células mastoideas"→"celdillas mastoideas"|"L2-S1"→"L5-S1"|"ángulo de Kopp"→"ángulo de Cobb"|"ECografía"→"ecografía"|"edema opaco"→"enema opaco"|"TAG"→"TAC"|"perifysural"→"perifisural"|"alopatia"→"adenopatía"|"Dickson"→"DIXON"|"vaso accesorio"→"bazo accesorio"|"FLIR"→"FLAIR"|"eco-degradiente"→"eco de gradiente"|"reflexión"(digestivo)→"repleción"|"Mattera"→"masetero"`;

const buildCtxBlock = (c) => {
  const p = [];
  if (c.age) p.push("Edad: " + c.age + " años");
  if (c.gender) p.push("Género: " + c.gender);
  if (c.studyRequested) p.push("Estudio solicitado: " + c.studyRequested);
  if (c.priority && c.priority !== "programado") p.push("Prioridad: " + c.priority.toUpperCase());
  if (c.reason) p.push("Motivo: " + c.reason);
  if (c.clinicalHistory) p.push("Antecedentes:\n" + c.clinicalHistory);
  if (c.priorRadiology) p.push("Informes radiológicos previos:\n" + c.priorRadiology);
  if (c.clinicalReports) p.push("Informes clínicos:\n" + c.clinicalReports);
  return p.length ? "\n\n## CONTEXTO CLÍNICO\n" + p.join("\n\n") : "";
};

const REPORT_SYS = (c) => `Eres "Asistente de Radiología", asistente de informes radiológicos profesionales en español.
${buildCtxBlock(c)}

## COLORES (OBLIGATORIO en cada fragmento)
- Patológico importante: <span style="color:#CC0000;font-style:italic;font-weight:bold;">texto</span>
- Patológico leve: <span style="color:#D2691E;font-style:italic;">texto</span>
- Normal relevante: <span style="color:#2E8B57;">texto</span>
- Normal relleno: <span style="color:#444;">texto</span>

## HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',Calibri,sans-serif;line-height:1.7;font-size:14px;">
<p style="font-weight:bold;font-size:1.15em;color:#222;margin-bottom:0.3em;">[TIPO ESTUDIO] [URGENTE/CÓDIGO ICTUS]</p>
<p style="color:#666;font-size:0.95em;">[Técnica]</p>
<p style="color:#666;font-size:0.95em;">[Referencia previo]</p>
<p style="font-weight:bold;margin-top:1.2em;font-size:1.05em;color:#222;border-bottom:1px solid #ccc;padding-bottom:4px;">HALLAZGOS</p>
<div style="margin-top:1.2em;padding-top:0.6em;border-top:1px solid #eee;">
<p style="font-weight:bold;color:#555;text-transform:uppercase;font-size:0.95em;letter-spacing:0.5px;">Estructura</p>
<p>[Descripción con spans colores]</p>
</div>
<div style="margin-top:1.5em;padding-top:0.8em;border-top:2px solid #888;">
<p style="font-size:1.25em;font-weight:bold;color:#222;">CONCLUSIÓN:</p>
<ul style="margin-top:0.5em;padding-left:1.2em;">
<li style="margin-bottom:0.4em;"><strong style="color:#CC0000;">[Hallazgo]</strong></li>
</ul>
</div>
<div style="margin-top:0.8em;"><p style="font-weight:bold;color:#555;">RECOMENDACIÓN:</p><p style="color:#444;font-size:0.95em;">[Si procede]</p></div>
</div>

## REGLAS
- Separación visual amplia entre regiones
- Frases LARGAS y detalladas
- Conclusión: SOLO patología, negrita, mayor→menor gravedad
- TODAS las estructuras evaluables con normalidad detallada
- Si informes previos: COMPARAR hallazgos
- Código ictus→"CÓDIGO ICTUS"+ASPECTS | Urgente→"URGENTE"
- Medidas con plano entre paréntesis | Escoliosis párrafo separado

## COMPLETITUD OBLIGATORIA
SIEMPRE: tipo estudio, técnica, HALLAZGOS completos, CONCLUSIÓN, RECOMENDACIÓN si procede.
TC ABDOMEN: hígado, vesícula/vía biliar, páncreas, bazo, riñones, adrenales, aorta/vasos, asas, vejiga, óseo, bases pulmonares.
TC CRÁNEO: parénquima, ventrículos, cisternas, línea media, óseo, senos, celdillas mastoideas, órbitas.
TC TÓRAX: pulmón, mediastino, corazón, aorta, pleura, pared, óseo.
RM COLUMNA: alineación, cuerpos, TODOS discos, canal, médula, foraminas, musculatura.
ECO ABDOMINAL: hígado, vesícula/vía biliar, páncreas, bazo, riñones, aorta, líquido libre.

## COMANDOS
"completa"→añadir normalidad | "plagia"→reescribir informe ajeno

## CORRECCIONES AUTOMÁTICAS
${CORRECTIONS}

## RESPUESTA
SOLO HTML. Sin explicaciones, sin markdown, sin backticks. Informe COMPLETO.`;

const ANALYSIS_SYS = (c, report) => `Eres consultor experto en radiología diagnóstica. Analiza y genera HTML profesional con estilos inline.
${buildCtxBlock(c)}

## INFORME ACTUAL
${report}

## ESTRUCTURA HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.7;font-size:14px;color:#333;">
<div style="margin-bottom:1.5em;padding:16px;background:#f0f7ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;">
<p style="font-weight:bold;font-size:1.1em;color:#1e40af;margin-bottom:8px;">📋 RESUMEN DEL CASO</p><p>[Resumen]</p></div>
<div style="margin-bottom:1.5em;">
<p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">🔍 DIAGNÓSTICO DIFERENCIAL</p>
<div style="margin:12px 0;padding:12px 16px;background:#fafafa;border-radius:8px;border:1px solid #e5e7eb;">
<p style="font-weight:bold;color:#CC0000;">1. [Diagnóstico] — [%]</p>
<p><strong>A favor:</strong> [...]</p><p><strong>En contra:</strong> [...]</p><p><strong>Clave:</strong> [...]</p></div></div>
<div style="margin-bottom:1.5em;"><p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">📐 ESCALAS Y GRADUACIONES</p><p>[Las que apliquen]</p></div>
<div style="margin-bottom:1.5em;"><p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">👁️ SIGNOS CLAVE</p><p>[En qué fijarse]</p></div>
<div style="margin-bottom:1.5em;"><p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">🎯 RECOMENDACIONES</p><p>[Seguimiento]</p></div>
<div style="padding:16px;background:#fef3c7;border-left:4px solid #d97706;border-radius:0 8px 8px 0;">
<p style="font-weight:bold;color:#92400e;">💡 PERLAS RADIOLÓGICAS</p><p>[1-3 datos]</p></div>
</div>

SOLO HTML. Probabilidades numéricas. Diagnósticos "can't miss".`;

const CHAT_SYS = (c, report, analysis) => `Eres consultor de radiología experto.
${buildCtxBlock(c)}
${report ? "\n## INFORME\n" + report : ""}
${analysis ? "\n## ANÁLISIS\n" + analysis : ""}
Responde directo, profesional. HTML para complejas, texto para breves. Español.`;

function LoadingDots({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#c4973c", animation: `ldp 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
      <span style={{ fontSize: 12, color: "#888" }}>{text}</span>
      <style>{`@keyframes ldp{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.1)}}`}</style>
    </div>
  );
}

function Tab({ active, icon, label, badge, onClick, P }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "9px 13px",
      background: active ? P.goldBgActive : "transparent",
      border: "none", borderBottom: active ? "2px solid " + P.gold : "2px solid transparent",
      color: active ? P.gold : P.text3, fontSize: 13, fontWeight: active ? 600 : 400,
      cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", fontFamily: "inherit",
    }}>
      <span>{icon}</span><span>{label}</span>
      {badge && <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold }} />}
    </button>
  );
}

function ThemeToggle({ themePref, setThemePref, P }) {
  const icons = { auto: "◐", light: "☀️", dark: "🌙" };
  const labels = { auto: "Auto", light: "Claro", dark: "Oscuro" };
  const cycle = { auto: "light", light: "dark", dark: "auto" };
  return (
    <button onClick={() => setThemePref(cycle[themePref])} style={{
      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7,
      border: "1px solid " + P.goldBorder, background: P.goldBg, color: P.gold,
      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    }}>
      <span style={{ fontSize: 14 }}>{icons[themePref]}</span><span>{labels[themePref]}</span>
    </button>
  );
}

export default function Page() {
  const emptyCtx = { age: "", gender: "", studyRequested: "", priority: "programado", reason: "", clinicalHistory: "", priorRadiology: "", clinicalReports: "" };

  const [themePref, setThemePref] = useState("auto");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const isDark = themePref === "auto" ? systemDark : themePref === "dark";
  const P = useMemo(() => palette(isDark), [isDark]);

  const [ctx, setCtx] = useState(emptyCtx);
  const [ctxSnap, setCtxSnap] = useState("");
  const [fMsgs, setFMsgs] = useState([]);
  const [cMsgs, setCMsgs] = useState([]);
  const [fInput, setFInput] = useState("");
  const [cInput, setCInput] = useState("");
  const [report, setReport] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [model, setModel] = useState(MODELS[1].id);
  const [lTab, setLTab] = useState("context");
  const [rTab, setRTab] = useState("report");
  const [ldReport, setLdReport] = useState(false);
  const [ldAnalysis, setLdAnalysis] = useState(false);
  const [ldChat, setLdChat] = useState(false);
  const [copied, setCopied] = useState("");
  const [err, setErr] = useState("");
  const [showMP, setShowMP] = useState(false);
  const [ff, setFf] = useState("");

  const fEndRef = useRef(null);
  const cEndRef = useRef(null);
  const fInpRef = useRef(null);
  const cInpRef = useRef(null);

  useEffect(() => { fEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [fMsgs, ldReport]);
  useEffect(() => { cEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cMsgs, ldChat]);

  const autoR = (ref) => { if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = Math.min(ref.current.scrollHeight, 300) + "px"; } };
  useEffect(() => autoR(fInpRef), [fInput]);
  useEffect(() => autoR(cInpRef), [cInput]);

  const ctxStr = JSON.stringify(ctx);
  useEffect(() => {
    if (lTab === "findings" && ctxSnap && ctxStr !== ctxSnap && report && fMsgs.length > 0) {
      setCtxSnap(ctxStr); regenReport();
    }
  }, [lTab]);

  // ─── API calls go to /api/chat (server proxy) ───
  const callAPI = async (sys, msgs, mt = 4096) => {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: mt, system: sys, messages: msgs.map(m => ({ role: m.role, content: m.content })) }),
    });
    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      throw new Error(errData.error || `Error ${r.status}`);
    }
    const d = await r.json();
    return (d.content || []).map(b => b.text || "").join("");
  };

  const clean = (s) => { let t = s.trim(); if (t.startsWith("```html")) t = t.slice(7); else if (t.startsWith("```")) t = t.slice(3); if (t.endsWith("```")) t = t.slice(0, -3); return t.trim(); };

  const sendFindings = async () => {
    const t = fInput.trim(); if (!t || ldReport) return;
    setErr(""); const um = { role: "user", content: t }; const nm = [...fMsgs, um];
    setFMsgs(nm); setFInput(""); setLdReport(true); setRTab("report");
    try { const h = clean(await callAPI(REPORT_SYS(ctx), nm)); setFMsgs(p => [...p, { role: "assistant", content: h }]); setReport(h); setCtxSnap(JSON.stringify(ctx)); }
    catch (e) { setErr("Error informe: " + e.message); } setLdReport(false);
  };
  const regenReport = async () => {
    if (!fMsgs.length || ldReport) return; setLdReport(true); setErr(""); setRTab("report");
    try { const h = clean(await callAPI(REPORT_SYS(ctx), fMsgs)); setReport(h); }
    catch (e) { setErr("Error regenerar: " + e.message); } setLdReport(false);
  };
  const genAnalysis = async () => {
    if (!report || ldAnalysis) return; setLdAnalysis(true); setErr(""); setRTab("analysis");
    try { setAnalysis(clean(await callAPI(ANALYSIS_SYS(ctx, report), [{ role: "user", content: "Analiza este caso radiológico de forma exhaustiva." }]))); }
    catch (e) { setErr("Error análisis: " + e.message); } setLdAnalysis(false);
  };
  const sendChat = async () => {
    const t = cInput.trim(); if (!t || ldChat) return; setErr("");
    const um = { role: "user", content: t }; const nm = [...cMsgs, um];
    setCMsgs(nm); setCInput(""); setLdChat(true);
    try {
  const response = await callAPI(CHAT_SYS(ctx, report, analysis), nm, 2048);
  setCMsgs(p => [...p, { role: "assistant", content: response }]);
}
    catch (e) { setErr("Error chat: " + e.message); } setLdChat(false);
  };

  const cpText = async () => { if (!report) return; const d = document.createElement("div"); d.innerHTML = report; await navigator.clipboard.writeText(d.innerText || d.textContent); setCopied("t"); setTimeout(() => setCopied(""), 2500); };
  const cpHtml = async () => { if (!report) return; try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([report], { type: "text/html" }), "text/plain": new Blob([report], { type: "text/plain" }) })]); } catch { await navigator.clipboard.writeText(report); } setCopied("h"); setTimeout(() => setCopied(""), 2500); };
  const clearAll = () => { setCtx(emptyCtx); setFMsgs([]); setCMsgs([]); setReport(""); setAnalysis(""); setFInput(""); setCInput(""); setErr(""); setCtxSnap(""); setLTab("context"); setRTab("report"); };
  const hk = (e, fn) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fn(); } };
  const sm = MODELS.find(m => m.id === model);

  const S = {
    root: { display: "flex", flexDirection: "column", height: "100vh", width: "100%", background: P.bg, color: P.text, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", overflow: "hidden", transition: "background 0.3s, color 0.3s" },
    hdr: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid " + P.goldBorder, background: isDark ? "linear-gradient(135deg,#12121e,#1a1a2e)" : "linear-gradient(135deg,#f8f6f1,#f0ece2)", flexShrink: 0, gap: 10, flexWrap: "wrap" },
    logo: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 700, color: P.gold, letterSpacing: 0.5 },
    sub: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10, color: P.goldDim, letterSpacing: 3, textTransform: "uppercase", marginTop: 1 },
    hdrR: { display: "flex", alignItems: "center", gap: 8 },
    mBtn: { display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid " + P.goldBorder, background: P.goldBg, color: P.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", position: "relative" },
    mDrop: { position: "absolute", top: "calc(100% + 4px)", right: 0, background: P.dropdownBg, border: "1px solid " + P.goldBorder, borderRadius: 10, padding: 5, zIndex: 100, minWidth: 170, boxShadow: P.dropdownShadow },
    mOpt: (a) => ({ display: "flex", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, cursor: "pointer", background: a ? P.goldBgActive : "transparent", color: a ? P.gold : P.text2, fontSize: 13, fontWeight: a ? 600 : 400 }),
    clr: { padding: "5px 10px", borderRadius: 7, border: "1px solid " + P.goldBorder, background: "transparent", color: P.gold, fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" },
    main: { display: "flex", flex: 1, overflow: "hidden" },
    lp: { display: "flex", flexDirection: "column", width: "42%", minWidth: 300, borderRight: "1px solid " + P.goldBorder },
    rp: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
    tb: { display: "flex", borderBottom: "1px solid " + P.goldBorder, background: P.bg2, flexShrink: 0 },
    cs: { flex: 1, overflowY: "auto", padding: "14px 16px" },
    fg: { marginBottom: 14 },
    lb: { display: "block", fontSize: 11, fontWeight: 600, color: P.text3, marginBottom: 4, letterSpacing: 0.3, textTransform: "uppercase" },
    inp: (f) => ({ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s" }),
    sel: { width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + P.inputBorder, background: P.inputBg, color: P.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", cursor: "pointer" },
    taf: (f, bigH) => ({ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: f ? (bigH || 180) : 56, lineHeight: 1.5, boxSizing: "border-box", transition: "min-height 0.3s, border-color 0.2s, background 0.2s" }),
    chip: (v, cur) => ({ padding: "5px 12px", borderRadius: 18, border: v === cur ? "2px solid" : "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 13, fontWeight: v === cur ? 600 : 400, fontFamily: "inherit",
      background: v === cur ? (v === "urgente" ? P.urgentBg : v === "codigo_ictus" ? P.ictusBg : P.goldBg) : "transparent",
      color: v === cur ? (v !== "programado" ? "#ef4444" : P.gold) : P.text3,
      borderColor: v === cur ? (v !== "programado" ? "#ef4444" : P.gold) : P.goldBorder }),
    ca: { flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 9 },
    ub: { alignSelf: "flex-end", maxWidth: "85%", padding: "9px 13px", borderRadius: "13px 13px 3px 13px", fontSize: 14, lineHeight: 1.5, background: P.bubbleUser, color: "#fff" },
    ab: { alignSelf: "flex-start", maxWidth: "85%", padding: "9px 13px", borderRadius: "13px 13px 13px 3px", fontSize: 13, lineHeight: 1.5, background: P.bubbleAsst, color: P.text2, border: "1px solid " + P.bubbleAsstBorder },
    ia: { padding: "9px 12px", borderTop: "1px solid " + P.goldBorder, background: P.bg2, flexShrink: 0 },
    ir: { display: "flex", gap: 7, alignItems: "flex-end" },
    ta: (f) => ({ flex: 1, resize: "none", border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), borderRadius: 10, padding: "9px 12px", fontSize: 14, lineHeight: 1.5, background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", minHeight: f ? 140 : 42, maxHeight: 300, overflow: "auto", boxSizing: "border-box", transition: "min-height 0.3s, border-color 0.2s" }),
    sb: (d) => ({ width: 40, height: 40, borderRadius: 10, border: "none", cursor: d ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: d ? (isDark ? "#333" : "#ccc") : "linear-gradient(135deg,#c4973c,#a07830)", color: "#fff", fontSize: 15, flexShrink: 0 }),
    ht: { fontSize: 10, color: P.text4, marginTop: 3 },
    rh: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid " + P.reportHeaderBorder, background: P.reportHeader, flexShrink: 0, flexWrap: "wrap", gap: 5 },
    rt: { fontSize: 13, fontWeight: 600, color: P.reportTitleColor, letterSpacing: 0.5, textTransform: "uppercase" },
    rc: { flex: 1, overflowY: "auto", padding: "20px 24px", background: P.reportBg },
    cb: (v, a) => ({ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", background: a ? "#22c55e" : v === "p" ? P.gold : P.goldBg, color: a ? "#fff" : v === "p" ? "#fff" : P.gold }),
    lg: { display: "flex", gap: 10, flexWrap: "wrap", padding: "7px 14px", borderTop: "1px solid " + P.legendBorder, background: P.legendBg, flexShrink: 0 },
    ld: (c) => ({ width: 7, height: 7, borderRadius: "50%", background: c }),
    li: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: P.text3 },
    aBtn: { padding: "11px 22px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontFamily: "inherit" },
    ph: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, opacity: 0.6, textAlign: "center", padding: 28 },
    phI: { fontSize: 40 },
    phT: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 18, color: P.gold },
    phD: { fontSize: 13, color: P.text3, maxWidth: 260, lineHeight: 1.5 },
    er: { padding: "7px 12px", margin: "0 12px 6px", borderRadius: 7, background: P.errorBg, color: P.errorText, fontSize: 13, border: "1px solid " + P.errorBorder },
  };

  return (
    <div style={S.root}>
      <div style={S.hdr}>
        <div><div style={S.logo}>asistente_de_radiolog<span style={{ color: isDark ? "#e8c547" : "#b8860b", textShadow: isDark ? "0 0 8px rgba(232,197,71,0.4)" : "none" }}>IA</span></div><div style={S.sub}>Estación de trabajo <span style={{ letterSpacing: 1, opacity: 0.7 }}>·</span> <span style={{ fontStyle: "italic", letterSpacing: 1, fontSize: 9, opacity: 0.6 }}>by Alexis Espinosa</span></div></div>
        <div style={S.hdrR}>
          <ThemeToggle themePref={themePref} setThemePref={setThemePref} P={P} />
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMP(!showMP)} style={S.mBtn}>{sm?.cost} {sm?.label} ▾</button>
            {showMP && <div style={S.mDrop}>{MODELS.map(m => (
              <div key={m.id} style={S.mOpt(m.id === model)} onClick={() => { setModel(m.id); setShowMP(false); }}><span>{m.cost} {m.label}</span><span style={{ fontSize: 11, opacity: 0.6 }}>{m.desc}</span></div>
            ))}</div>}
          </div>
          <button onClick={clearAll} style={S.clr}>Nueva sesión</button>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.lp}>
          <div style={S.tb}>
            <Tab active={lTab === "context"} icon="📋" label="Qué sabemos" onClick={() => setLTab("context")} P={P} />
            <Tab active={lTab === "findings"} icon="🔎" label="Qué vemos" badge={!!report && lTab !== "findings"} onClick={() => setLTab("findings")} P={P} />
          </div>
          {lTab === "context" ? (
            <div style={S.cs}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ ...S.fg, flex: 1 }}><label style={S.lb}>Edad</label><input type="number" placeholder="—" value={ctx.age} onChange={e => setCtx({ ...ctx, age: e.target.value })} onFocus={() => setFf("ag")} onBlur={() => setFf("")} style={S.inp(ff === "ag")} /></div>
                <div style={{ ...S.fg, flex: 1 }}><label style={S.lb}>Género</label><select value={ctx.gender} onChange={e => setCtx({ ...ctx, gender: e.target.value })} style={S.sel}><option value="">—</option><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option></select></div>
              </div>
              <div style={S.fg}><label style={S.lb}>Estudio solicitado</label><input type="text" placeholder="Ej: TC tórax con CIV, RM lumbar..." value={ctx.studyRequested} onChange={e => setCtx({ ...ctx, studyRequested: e.target.value })} onFocus={() => setFf("st")} onBlur={() => setFf("")} style={S.inp(ff === "st")} /></div>
              <div style={S.fg}><label style={S.lb}>Prioridad</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {[["programado", "Programado"], ["urgente", "🔴 Urgente"], ["codigo_ictus", "🚨 Código Ictus"]].map(([v, l]) => (<button key={v} onClick={() => setCtx({ ...ctx, priority: v })} style={S.chip(v, ctx.priority)}>{l}</button>))}
                </div></div>
              <div style={S.fg}><label style={S.lb}>Motivo de petición</label><input type="text" placeholder="Justificación clínica..." value={ctx.reason} onChange={e => setCtx({ ...ctx, reason: e.target.value })} onFocus={() => setFf("re")} onBlur={() => setFf("")} style={S.inp(ff === "re")} /></div>
              <div style={S.fg}><label style={S.lb}>Antecedentes clínicos</label><textarea placeholder="Patologías, cirugías, tratamientos..." value={ctx.clinicalHistory} onChange={e => setCtx({ ...ctx, clinicalHistory: e.target.value })} onFocus={() => setFf("hi")} onBlur={() => setFf("")} style={S.taf(ff === "hi")} /></div>
              <div style={S.fg}><label style={S.lb}>Informes radiológicos previos</label><textarea placeholder="Pegar informes anteriores..." value={ctx.priorRadiology} onChange={e => setCtx({ ...ctx, priorRadiology: e.target.value })} onFocus={() => setFf("ra")} onBlur={() => setFf("")} style={S.taf(ff === "ra", 220)} /></div>
              <div style={S.fg}><label style={S.lb}>Informes clínicos</label><textarea placeholder="Altas, consultas, analíticas..." value={ctx.clinicalReports} onChange={e => setCtx({ ...ctx, clinicalReports: e.target.value })} onFocus={() => setFf("cl")} onBlur={() => setFf("")} style={S.taf(ff === "cl", 220)} /></div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={S.ca}>
                {fMsgs.length === 0 && <div style={S.ph}><div style={S.phI}>✍️</div><div style={S.phT}>Dicta tus hallazgos</div><div style={S.phD}>Escribe lo que ves en las imágenes.</div></div>}
                {fMsgs.map((m, i) => m.role === "user" ? <div key={i} style={S.ub}>{m.content}</div> : <div key={i} style={S.ab}>✅ Informe {i === fMsgs.length - 1 ? "generado" : "actualizado"}</div>)}
                {ldReport && <div style={S.ab}><LoadingDots text="Redactando informe..." /></div>}
                <div ref={fEndRef} />
              </div>
              {err && <div style={S.er}>{err}</div>}
              <div style={S.ia}><div style={S.ir}>
                <textarea ref={fInpRef} value={fInput} onChange={e => setFInput(e.target.value)} onKeyDown={e => hk(e, sendFindings)} onFocus={() => setFf("fi")} onBlur={() => setFf("")} placeholder='Hallazgos, "completa", "plagia"...' style={S.ta(ff === "fi")} rows={2} disabled={ldReport} />
                <button onClick={sendFindings} disabled={ldReport || !fInput.trim()} style={S.sb(ldReport || !fInput.trim())}>▶</button>
              </div><div style={S.ht}>Shift+Enter nueva línea</div></div>
            </div>
          )}
        </div>

        <div style={S.rp}>
          <div style={S.tb}>
            <Tab active={rTab === "report"} icon="📄" label="Informe" badge={!!report && rTab !== "report"} onClick={() => setRTab("report")} P={P} />
            <Tab active={rTab === "analysis"} icon="🔍" label="Análisis" badge={!!analysis && rTab !== "analysis"} onClick={() => setRTab("analysis")} P={P} />
            <Tab active={rTab === "chat"} icon="💬" label="Chat" badge={cMsgs.length > 0 && rTab !== "chat"} onClick={() => setRTab("chat")} P={P} />
          </div>

          {rTab === "report" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={S.rh}><span style={S.rt}>Informe</span>{report && <div style={{ display: "flex", gap: 5 }}><button onClick={cpText} style={S.cb("p", copied === "t")}>{copied === "t" ? "✓ Copiado" : "📋 Texto"}</button><button onClick={cpHtml} style={S.cb("s", copied === "h")}>{copied === "h" ? "✓ Copiado" : "HTML"}</button></div>}</div>
            <div style={S.rc}>{report ? <div dangerouslySetInnerHTML={{ __html: report }} /> : <div style={S.ph}><div style={S.phI}>📄</div><div style={S.phT}>El informe aparecerá aquí</div><div style={S.phD}>Dicta hallazgos en "Qué vemos".</div></div>}</div>
            {report && <div style={S.lg}>{[["#CC0000", "Grave"], ["#D2691E", "Leve"], ["#2E8B57", "Normal rel."], ["#444", "Normal"]].map(([c, l]) => <div key={c} style={S.li}><div style={S.ld(c)} /><span>{l}</span></div>)}</div>}
          </div>}

          {rTab === "analysis" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.analysisHeader, borderColor: P.analysisHeaderBorder }}><span style={{ ...S.rt, color: P.analysisTitleColor }}>Análisis del caso</span>{analysis && <button onClick={genAnalysis} disabled={ldAnalysis} style={{ ...S.cb("s"), color: P.analysisTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.analysisBg }}>{ldAnalysis ? <div style={S.ph}><LoadingDots text="Analizando..." /></div> : analysis ? <div dangerouslySetInnerHTML={{ __html: analysis }} /> : <div style={S.ph}><div style={S.phI}>🔍</div><div style={{ ...S.phT, color: P.analysisTitleColor }}>Análisis bajo demanda</div><div style={S.phD}>{report ? "Genera diferencial, escalas y recomendaciones." : "Genera primero un informe."}</div>{report && <button onClick={genAnalysis} style={S.aBtn}>🔍 Analizar caso</button>}</div>}</div>
          </div>}

          {rTab === "chat" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.chatHeader, borderColor: P.chatHeaderBorder }}><span style={{ ...S.rt, color: P.chatTitleColor }}>Chat libre</span></div>
            <div style={{ ...S.ca, background: P.chatPanelBg }}>
              {cMsgs.length === 0 && <div style={S.ph}><div style={S.phI}>💬</div><div style={{ ...S.phT, color: P.chatTitleColor }}>Consulta lo que necesites</div><div style={S.phD}>Con todo el contexto del caso.</div></div>}
              {cMsgs.map((m, i) => m.role === "user" ? <div key={i} style={{ ...S.ub, background: P.chatBubbleUser }}>{m.content}</div> : <div key={i} style={{ ...S.ab, background: P.chatBubbleAsst, borderColor: P.chatBubbleAsstBorder, color: P.chatBubbleText }}><div dangerouslySetInnerHTML={{ __html: m.content }} /></div>)}
              {ldChat && <div style={S.ab}><LoadingDots text="Pensando..." /></div>}
              <div ref={cEndRef} />
            </div>
            <div style={{ ...S.ia, background: P.chatInputAreaBg }}><div style={S.ir}>
              <textarea ref={cInpRef} value={cInput} onChange={e => setCInput(e.target.value)} onKeyDown={e => hk(e, sendChat)} onFocus={() => setFf("ch")} onBlur={() => setFf("")} placeholder="¿Recomendar PET-TC? ¿Seguimiento?..." style={{ ...S.ta(ff === "ch"), borderColor: ff === "ch" ? P.chatInputBorderFocus : P.chatInputBorder, background: P.chatInputBg, color: P.chatInputColor }} rows={2} disabled={ldChat} />
              <button onClick={sendChat} disabled={ldChat || !cInput.trim()} style={{ ...S.sb(ldChat || !cInput.trim()), background: ldChat || !cInput.trim() ? (isDark ? "#333" : "#ccc") : P.chatSendBg }}>▶</button>
            </div></div>
          </div>}
        </div>
      </div>
    </div>
  );
}
