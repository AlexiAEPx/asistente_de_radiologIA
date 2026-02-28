"use client";
import { useState, useRef, useEffect, useMemo } from "react";

const MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Haiku", cost: "💰", desc: "Rápido" },
  { id: "claude-sonnet-4-20250514", label: "Sonnet", cost: "💰💰", desc: "Equilibrado" },
  { id: "claude-opus-4-6", label: "Opus", cost: "💰💰💰", desc: "Máxima calidad" },
];

// Pricing per million tokens (USD) — https://docs.anthropic.com/en/docs/about-claude/pricing
const PRICING = {
  "claude-haiku-4-5-20251001":  { input: 0.80, output: 4.00 },
  "claude-sonnet-4-20250514":   { input: 3.00, output: 15.00 },
  "claude-opus-4-6":            { input: 15.00, output: 75.00 },
};

const palette = (dark) => dark ? {
  bg: "#0e0e18", bg2: "#111120", bg3: "#1a1a2e",
  text: "#e0ddd5", text2: "#aaa", text3: "#777", text4: "#555",
  gold: "#c4973c", goldDim: "rgba(196,151,60,0.5)", goldBorder: "rgba(196,151,60,0.2)", goldBg: "rgba(196,151,60,0.08)", goldBgActive: "rgba(196,151,60,0.12)", goldBorderFocus: "rgba(196,151,60,0.5)",
  tabShellBg: "linear-gradient(135deg,rgba(196,151,60,0.12),rgba(255,255,255,0.02))", tabShellBorder: "rgba(196,151,60,0.22)", tabBtnBg: "rgba(255,255,255,0.02)", tabBtnBgActive: "linear-gradient(135deg,rgba(196,151,60,0.24),rgba(196,151,60,0.1))", tabBtnBorder: "rgba(196,151,60,0.1)",
  inputBg: "rgba(255,255,255,0.04)", inputBgFocus: "rgba(255,255,255,0.07)", inputBorder: "rgba(196,151,60,0.2)",
  bubbleUser: "linear-gradient(135deg,#c4973c,#a07830)", bubbleAsst: "rgba(255,255,255,0.06)", bubbleAsstBorder: "rgba(255,255,255,0.08)",
  reportBg: "linear-gradient(180deg,#1e1e2a,#1a1a28)", reportHeader: "#161622", reportHeaderBorder: "rgba(196,151,60,0.15)", reportTitleColor: "#c4973c",
  legendBg: "#161622", legendBorder: "rgba(196,151,60,0.15)",
  analysisBg: "linear-gradient(180deg,#141428,#12122a)", analysisHeader: "#161630", analysisHeaderBorder: "rgba(99,102,241,0.2)", analysisTitleColor: "#818cf8",
  chatPanelBg: "linear-gradient(180deg,#0e1a14,#0e1818)", chatHeader: "#0f1f16", chatHeaderBorder: "rgba(34,197,94,0.2)", chatTitleColor: "#4ade80",
  recoPanelBg: "linear-gradient(180deg,#1a1628,#151425)", recoPanelBorder: "rgba(168,85,247,0.25)", recoTitleColor: "#c084fc",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.08)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#ccc",
  chatInputBg: "rgba(255,255,255,0.04)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#e0ddd5",
  chatInputAreaBg: "#0f1f16", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  codesPanelBg: "linear-gradient(180deg,#1a1018,#1a1420)", codesHeader: "#1f1424", codesHeaderBorder: "rgba(220,38,38,0.2)", codesTitleColor: "#f87171",
  codesCardBg: "rgba(220,38,38,0.06)", codesCardBorder: "rgba(220,38,38,0.15)", codesCardHeaderBg: "rgba(220,38,38,0.08)",
  codesItemBg: "rgba(255,255,255,0.04)", codesItemBorder: "rgba(255,255,255,0.08)",
  keyIdeasBg: "linear-gradient(180deg,#1a1520,#181422)", keyIdeasHeader: "#1c1628", keyIdeasHeaderBorder: "rgba(217,119,6,0.2)", keyIdeasTitleColor: "#fbbf24",
  justifBg: "linear-gradient(180deg,#1a1424,#18122a)", justifHeader: "#1e1630", justifHeaderBorder: "rgba(168,85,247,0.2)", justifTitleColor: "#c084fc",
  diffDiagBg: "linear-gradient(180deg,#141a1e,#121820)", diffDiagHeader: "#161e24", diffDiagHeaderBorder: "rgba(239,68,68,0.2)", diffDiagTitleColor: "#f87171",
  historyBg: "linear-gradient(180deg,#161620,#141418)", historyHeader: "#1a1a24", historyHeaderBorder: "rgba(196,151,60,0.2)", historyTitleColor: "#c4973c",
  historyCardBg: "rgba(255,255,255,0.04)", historyCardBorder: "rgba(196,151,60,0.15)", historyCardHover: "rgba(196,151,60,0.08)",
  historyDate: "#c4973c", historyStudy: "#e0ddd5", historySummary: "#aaa", historyEmpty: "#555",
  historyDeleteBtn: "rgba(239,68,68,0.7)", historyDeleteHover: "#ef4444", historyClearBg: "rgba(239,68,68,0.1)", historyClearBorder: "rgba(239,68,68,0.2)",
  mindMapBg: "linear-gradient(180deg,#161820,#141622)", mindMapHeader: "#181a26", mindMapHeaderBorder: "rgba(56,189,248,0.2)", mindMapTitleColor: "#38bdf8",
  dropdownBg: "#1a1a2e", dropdownShadow: "0 8px 24px rgba(0,0,0,0.5)",
  errorBg: "rgba(204,0,0,0.1)", errorBorder: "rgba(204,0,0,0.2)", errorText: "#ff6b6b",
  urgentBg: "rgba(220,38,38,0.15)", ictusBg: "rgba(220,38,38,0.25)",
} : {
  bg: "#f5f3ef", bg2: "#faf8f5", bg3: "#fafaf8",
  text: "#1a1a1a", text2: "#555", text3: "#888", text4: "#aaa",
  gold: "#96722a", goldDim: "rgba(150,114,42,0.5)", goldBorder: "rgba(150,114,42,0.2)", goldBg: "rgba(150,114,42,0.06)", goldBgActive: "rgba(150,114,42,0.12)", goldBorderFocus: "rgba(150,114,42,0.45)",
  tabShellBg: "linear-gradient(135deg,rgba(150,114,42,0.1),rgba(255,255,255,0.65))", tabShellBorder: "rgba(150,114,42,0.28)", tabBtnBg: "rgba(255,255,255,0.55)", tabBtnBgActive: "linear-gradient(135deg,rgba(150,114,42,0.2),rgba(150,114,42,0.08))", tabBtnBorder: "rgba(150,114,42,0.22)",
  inputBg: "#f7f5f0", inputBgFocus: "#faf7f0", inputBorder: "rgba(150,114,42,0.25)",
  bubbleUser: "linear-gradient(135deg,#96722a,#7a5c1f)", bubbleAsst: "#f0ece4", bubbleAsstBorder: "#e0dbd0",
  reportBg: "linear-gradient(180deg,#fdfbf7,#f9f6f0)", reportHeader: "#f5f1ea", reportHeaderBorder: "#e8e4dc", reportTitleColor: "#8a7a60",
  legendBg: "#f5f1ea", legendBorder: "#e8e4dc",
  analysisBg: "linear-gradient(180deg,#fafbff,#f5f7ff)", analysisHeader: "#eef2ff", analysisHeaderBorder: "#c7d2fe", analysisTitleColor: "#4338ca",
  chatPanelBg: "linear-gradient(180deg,#fafdfb,#f5faf6)", chatHeader: "#f0fdf4", chatHeaderBorder: "#bbf7d0", chatTitleColor: "#166534",
  recoPanelBg: "linear-gradient(180deg,#fcfaff,#f7f3ff)", recoPanelBorder: "rgba(168,85,247,0.25)", recoTitleColor: "#7c3aed",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.06)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#555",
  chatInputBg: "rgba(255,255,255,0.8)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#333",
  chatInputAreaBg: "#f0fdf4", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  codesPanelBg: "linear-gradient(180deg,#fffbfb,#fdf5f5)", codesHeader: "#fef2f2", codesHeaderBorder: "#fecaca", codesTitleColor: "#b91c1c",
  codesCardBg: "rgba(220,38,38,0.04)", codesCardBorder: "rgba(220,38,38,0.15)", codesCardHeaderBg: "rgba(220,38,38,0.06)",
  codesItemBg: "#fff", codesItemBorder: "#f0e0e0",
  keyIdeasBg: "linear-gradient(180deg,#fffbf5,#fef7ed)", keyIdeasHeader: "#fef3e2", keyIdeasHeaderBorder: "#fde68a", keyIdeasTitleColor: "#92400e",
  justifBg: "linear-gradient(180deg,#fdf8ff,#f5f0ff)", justifHeader: "#f3e8ff", justifHeaderBorder: "#d8b4fe", justifTitleColor: "#6b21a8",
  diffDiagBg: "linear-gradient(180deg,#fef9f9,#fdf5f5)", diffDiagHeader: "#fef2f2", diffDiagHeaderBorder: "#fecaca", diffDiagTitleColor: "#991b1b",
  historyBg: "linear-gradient(180deg,#fdfbf7,#f9f6f0)", historyHeader: "#f5f1ea", historyHeaderBorder: "rgba(150,114,42,0.2)", historyTitleColor: "#7a6840",
  historyCardBg: "#fff", historyCardBorder: "rgba(150,114,42,0.15)", historyCardHover: "rgba(150,114,42,0.06)",
  historyDate: "#96722a", historyStudy: "#1a1a1a", historySummary: "#555", historyEmpty: "#aaa",
  historyDeleteBtn: "rgba(239,68,68,0.6)", historyDeleteHover: "#dc2626", historyClearBg: "rgba(239,68,68,0.06)", historyClearBorder: "rgba(239,68,68,0.15)",
  mindMapBg: "linear-gradient(180deg,#f8fbff,#f0f7ff)", mindMapHeader: "#e8f4ff", mindMapHeaderBorder: "#7dd3fc", mindMapTitleColor: "#0369a1",
  dropdownBg: "#faf8f5", dropdownShadow: "0 8px 24px rgba(0,0,0,0.12)",
  errorBg: "rgba(204,0,0,0.06)", errorBorder: "rgba(204,0,0,0.15)", errorText: "#cc0000",
  urgentBg: "rgba(220,38,38,0.08)", ictusBg: "rgba(220,38,38,0.12)",
};

const CORRECTIONS = `"sin defectos de reflexión"→"sin defectos de repleción"|"angiotomografía"→"AngioTC"|"quiste de tallo"→"quiste de Tarlov"|"protusiones discotróficas"→"protusiones disco-osteofitarias"|"lobo"→"lóbulo"|"baso"/"vaso"(abdominal)→"bazo"|"células mastoideas"→"celdillas mastoideas"|"L2-S1"→"L5-S1"|"ángulo de Kopp"→"ángulo de Cobb"|"ECografía"→"ecografía"|"edema opaco"→"enema opaco"|"TAG"→"TAC"|"perifysural"→"perifisural"|"alopatia"→"adenopatía"|"Dickson"→"DIXON"|"vaso accesorio"→"bazo accesorio"|"FLIR"→"FLAIR"|"eco-degradiente"→"eco de gradiente"|"reflexión"(digestivo)→"repleción"|"Mattera"→"masetero"`;

const newEntry = () => ({ text: "", collapsed: false, images: [] });

const normalizeEntry = (entry = {}) => ({
  text: entry.text || "",
  collapsed: !!entry.collapsed,
  images: Array.isArray(entry.images) ? entry.images : [],
});

const normalizeCtx = (ctx = {}) => ({
  age: ctx.age || "",
  birthYear: ctx.birthYear || "",
  gender: ctx.gender || "",
  studyRequested: ctx.studyRequested || "",
  priority: ctx.priority || "programado",
  reason: ctx.reason || "",
  reasonImages: Array.isArray(ctx.reasonImages) ? ctx.reasonImages : [],
  clinicalHistory: (ctx.clinicalHistory || [newEntry()]).map(normalizeEntry),
  priorRadiology: (ctx.priorRadiology || [newEntry()]).map(normalizeEntry),
  clinicalReports: (ctx.clinicalReports || [newEntry()]).map(normalizeEntry),
  freeText: ctx.freeText || "",
  freeTextImages: Array.isArray(ctx.freeTextImages) ? ctx.freeTextImages : [],
});

const getEntryImageNote = (entry) => {
  const count = Array.isArray(entry?.images) ? entry.images.length : 0;
  return count ? ` [${count} imagen${count > 1 ? "es" : ""} pegada${count > 1 ? "s" : ""}]` : "";
};

const joinEntries = (arr) => {
  if (!Array.isArray(arr)) return arr || "";
  const items = arr.filter(e => (e.text && e.text.trim()) || (Array.isArray(e.images) && e.images.length));
  if (!items.length) return "";
  const renderEntry = (e) => `${(e.text || "").trim() || "[Sin texto]"}${getEntryImageNote(e)}`;
  if (items.length === 1) return renderEntry(items[0]);
  return items.map((e, i) => `[${i + 1}] ${renderEntry(e)}`).join("\n\n");
};

const getPriorityLabel = (priority) => {
  if (!priority || priority === "programado") return "";
  const codeLabels = {
    urgente: "URGENTE",
    codigo_ictus: "CÓDIGO ICTUS",
    codigo_trauma: "CÓDIGO TRAUMA",
    codigo_tep: "CÓDIGO TEP",
    codigo_medula: "CÓDIGO MÉDULA",
    codigo_hemostasis: "CÓDIGO HEMOSTASIS",
  };
  return codeLabels[priority] || priority.toUpperCase();
};

const buildCtxBlock = (c) => {
  const p = [];
  if (c.freeText) p.push("Información clínica general (sin clasificar):\n" + c.freeText);
  if (c.age) p.push("Edad: " + c.age + " años");
  if (c.gender) p.push("Género: " + c.gender);
  if (c.studyRequested) p.push("Estudio solicitado: " + c.studyRequested);
  const priorityLabel = getPriorityLabel(c.priority);
  if (priorityLabel) p.push("Prioridad: " + priorityLabel);
  if (c.reason) p.push("Motivo: " + c.reason);
  if (c.reasonImages?.length) p.push(`Motivo: ${c.reasonImages.length} imagen${c.reasonImages.length > 1 ? "es" : ""} clínica${c.reasonImages.length > 1 ? "s" : ""} pegada${c.reasonImages.length > 1 ? "s" : ""}.`);
  const ch = joinEntries(c.clinicalHistory);
  if (ch) p.push("Antecedentes:\n" + ch);
  const pr = joinEntries(c.priorRadiology);
  if (pr) p.push("Informes radiológicos previos:\n" + pr);
  const cr = joinEntries(c.clinicalReports);
  if (cr) p.push("Informes clínicos:\n" + cr);
  if (c.freeTextImages?.length) p.push(`Información clínica general con ${c.freeTextImages.length} imagen${c.freeTextImages.length > 1 ? "es" : ""} pegada${c.freeTextImages.length > 1 ? "s" : ""}.`);
  return p.length ? "\n\n## CONTEXTO CLÍNICO\n" + p.join("\n\n") : "";
};


const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const buildClinicalContextData = (c, fMsgs, cMsgs) => {
  const nonEmpty = (v) => (v || "").trim();
  const take = (arr) => (arr || []).map(e => nonEmpty(e.text)).filter(Boolean);
  const motivo = nonEmpty(c.reason);
  const antecedentes = take(c.clinicalHistory);
  const prevRad = take(c.priorRadiology);
  const informes = take(c.clinicalReports);
  const libre = nonEmpty(c.freeText);
  const chatPrevio = (cMsgs || []).filter(m => m.role === "user").map(m => nonEmpty(m.content)).filter(Boolean);
  const hallazgosAportados = (fMsgs || []).filter(m => m.role === "user").map(m => nonEmpty(m.content)).filter(Boolean);

  const textoOrigen = [motivo, libre, ...chatPrevio, ...hallazgosAportados].join(" ").trim();
  const priorityLabel = getPriorityLabel(c.priority);
  const hasAny = [motivo, c.age, c.gender, c.studyRequested, ...antecedentes, ...prevRad, ...informes, libre, ...chatPrevio, ...hallazgosAportados, c.reasonImages?.length, c.freeTextImages?.length].some(Boolean);
  if (!hasAny) {
    return {
      hasAny: false,
      structuredText: "",
      originalRequestText: "",
    };
  }

  const inferGender = () => {
    const g = (c.gender || "").trim().toLowerCase();
    if (["mujer", "femenino", "femenina"].includes(g)) return "mujer";
    if (["hombre", "masculino", "masculina", "varón", "varon"].includes(g)) return "hombre";
    if (/\bpaciente\s+var[oó]n\b|\bvar[oó]n\b|\bhombre\b|\bmasculino\b/i.test(textoOrigen)) return "hombre";
    if (/\bpaciente\s+mujer\b|\bmujer\b|\bfemenina\b|\bfemenino\b/i.test(textoOrigen)) return "mujer";
    return "";
  };

  const inferAge = () => {
    if (c.age) return `${c.age} años`;
    const match = textoOrigen.match(/\b(\d{1,3})\s*a[nñ]os\b/i);
    if (match) return `${match[1]} años`;
    return "";
  };

  const sanitizeReason = (text) => text
    .replace(/^[-•\s]*/g, "")
    .replace(/^(justificaci[oó]n cl[ií]nica|motivo de petici[oó]n|sospecha diagn[oó]stica)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const inferStudy = () => {
    if (nonEmpty(c.studyRequested)) return nonEmpty(c.studyRequested);
    const source = [motivo, libre].join(" ");
    const modalities = ["TC", "TAC", "RM", "RX", "Ecografía", "PET", "AngioTC"];
    const found = modalities.find(mod => new RegExp(`\\b${mod}\\b`, "i").test(source));
    return found ? `${found} solicitado` : "";
  };

  const reasonLines = motivo
    ? motivo.split(/\n+/).map(sanitizeReason).filter(Boolean)
    : [];
  const reasonSummary = reasonLines.length ? reasonLines.join(". ") : "";

  const clinicalFocus = [];
  if (priorityLabel) clinicalFocus.push(`Prioridad asistencial marcada: ${priorityLabel}.`);
  if (antecedentes.length) clinicalFocus.push(`Antecedentes útiles para interpretación: ${antecedentes.join("; ")}.`);
  if (prevRad.length) clinicalFocus.push(`Comparativa potencial con estudios previos: ${prevRad.join("; ")}.`);
  if (informes.length) clinicalFocus.push(`Información clínica complementaria aportada: ${informes.join("; ")}.`);
  if (c.reasonImages?.length) clinicalFocus.push(`Se han adjuntado ${c.reasonImages.length} imágenes en el motivo clínico.`);
  if (c.freeTextImages?.length) clinicalFocus.push(`Se han adjuntado ${c.freeTextImages.length} imágenes en el campo de texto libre.`);

  const intro = [inferGender(), inferAge()].filter(Boolean).join(", ");
  const contextParts = [
    intro,
    inferStudy(),
    priorityLabel && priorityLabel !== "Programado" ? priorityLabel : "",
    reasonSummary,
    antecedentes.length ? `Antecedentes relevantes: ${antecedentes.join("; ")}.` : "",
    prevRad.length ? `Comparativa con previos: ${prevRad.join("; ")}.` : "",
    informes.length ? `Datos clínicos adicionales: ${informes.join("; ")}.` : "",
  ].filter(Boolean);

  return {
    hasAny: true,
    originalRequestText: motivo,
    structuredText: [
      `CONTEXTO CLÍNICO: ${contextParts.join(" ") || "Información clínica no concluyente con los datos aportados."}`,
      clinicalFocus.length ? `Claves para interpretación radiológica: ${clinicalFocus.join(" ")}` : "",
    ].filter(Boolean).join("\n\n"),
  };
};

const CLINICAL_CONTEXT_POLISH_SYS = `Eres un redactor clínico-radiológico experto.

Reescribe y corrige el texto clínico de entrada para dejarlo listo para un informe radiológico profesional.

Objetivo de estilo:
- Español médico impecable, breve y esquemático.
- Corregir ortografía, gramática y puntuación.
- Evitar mayúsculas innecesarias.
- Sintetizar sin perder información clínica relevante.
- No usar etiquetas tipo "género:", "edad:", "procesado", "síntesis de IA".
- Integrar datos como texto natural (ejemplo: "mujer, 46 años").

Formato de salida obligatorio:
- Entregar únicamente texto plano.
- Empezar exactamente por "CONTEXTO CLÍNICO: ".
- Sin listas con guiones ni numeración.
- No añadir notas, advertencias ni explicaciones meta.`;

const CLINICAL_RECOMMENDATIONS_SYS = `Eres un asistente de radiología orientado a la práctica.

A partir del contexto clínico recibido, devuelve recomendaciones concretas y sintetizadas de qué buscar en la prueba solicitada.

Objetivo:
- Ayudar al radiólogo a enfocar la lectura con hallazgos clave.
- Ser práctico, breve y accionable.
- Basarte solo en lo aportado; no inventar datos del paciente.

Formato de salida obligatorio:
- Texto plano en español.
- Máximo 6 viñetas con guion simple "- ".
- Cada viñeta debe ser una recomendación concreta de búsqueda o correlación.
- Incluir umbrales/criterios cuando sea útil (ej.: medidas, signos, comparativas).
- Evitar explicaciones largas, disclaimers o metacomentarios.`;

const REPORT_SYS = (c, isDark) => `Eres "Asistente de Radiología", asistente de informes radiológicos profesionales en español.
${buildCtxBlock(c)}

## COLORES (OBLIGATORIO en cada fragmento)
- Patológico importante: <span style="color:#CC0000;font-style:italic;font-weight:bold;">texto</span>
- Patológico leve: <span style="color:#D2691E;font-style:italic;">texto</span>
- Normal VINCULADO a la patología del paciente: <span style="color:#2E8B57;">texto</span>
- Normal relleno (no vinculado): <span style="color:${isDark ? '#aaa' : '#444'};">texto</span>

## CRITERIO VERDE vs NEGRO (IMPORTANTE)
El verde (#2E8B57) es SOLO para hallazgos normales cuya normalidad sea CLÍNICAMENTE SIGNIFICATIVA para la patología o motivo de estudio concreto de este paciente. Si un hallazgo normal no tiene relevancia especial para la patología en estudio, va en color de relleno (negro/gris).
Ejemplos:
- Estudio por ISQUEMIA MESENTÉRICA: "sin adenopatías" → NEGRO (relleno, las adenopatías no son relevantes para isquemia mesentérica)
- Estudio por CÁNCER COLORRECTAL: "sin adenopatías" → VERDE (la ausencia de afectación ganglionar es clave para estadiaje)
- Estudio por CÁNCER DE PULMÓN: "sin derrame pleural" → VERDE (el derrame es complicación frecuente y relevante)
- Estudio por LUMBALGIA MECÁNICA: "sin derrame pleural" → NEGRO (no tiene relación con la patología)
- Estudio por TEP: "sin cardiomegalia, sin derrame pericárdico" → VERDE (repercusión hemodinámica del TEP)
- Estudio por LITIASIS RENAL: "sin cardiomegalia" → NEGRO (irrelevante para litiasis)
Piensa SIEMPRE: ¿este hallazgo normal es relevante para el diagnóstico, estadiaje, pronóstico o manejo de la patología concreta de este paciente? Si SÍ → verde. Si NO → negro/relleno.

## HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',Calibri,sans-serif;line-height:1.7;font-size:14px;">
<p style="font-weight:bold;font-size:1.15em;margin-bottom:0.3em;">[TIPO ESTUDIO] [URGENTE/CÓDIGO ICTUS]</p>
<p style="font-size:0.95em;opacity:0.7;">[Técnica]</p>
<p style="font-size:0.95em;opacity:0.7;">[Referencia previo]</p>
<p style="font-weight:bold;margin-top:1.2em;font-size:1.05em;padding-bottom:4px;">HALLAZGOS</p>
<div style="margin-top:0.8em;">
<p style="font-weight:bold;text-transform:uppercase;font-size:0.95em;letter-spacing:0.5px;opacity:0.65;">Estructura</p>
<p>[Descripción con spans colores]</p>
</div>
<div style="margin-top:1.5em;">
<p style="font-size:1.25em;font-weight:bold;">CONCLUSIÓN:</p>
<ul style="margin-top:0.5em;padding-left:1.2em;">
<li style="margin-bottom:0.4em;"><strong style="color:#CC0000;">[Hallazgo]</strong></li>
</ul>
</div>
<div style="margin-top:0.8em;"><p style="font-weight:bold;opacity:0.65;">RECOMENDACIÓN:</p><p style="font-size:0.95em;">[Si procede]</p></div>
</div>

## REGLAS
- Separación visual amplia entre regiones
- Frases concisas, precisas y profesionales (evitar relleno innecesario)
- Longitud por defecto: INFORME INTERMEDIO (ni telegráfico ni extenso), priorizando lo clave
- Estilo esquemático, legible y radiológicamente impecable
- Conclusión: SOLO patología, negrita, mayor→menor gravedad
- TODAS las estructuras evaluables con normalidad detallada
- Si informes previos: COMPARAR hallazgos
- Código ictus→"CÓDIGO ICTUS"+ASPECTS | Código trauma→"CÓDIGO TRAUMA" body-TC | Código TEP→"CÓDIGO TEP" AngioTC pulmonar, ratio VD/VI | Código médula→"CÓDIGO MÉDULA" RM urgente | Código hemostasis→"CÓDIGO HEMOSTASIS" AngioTC, sangrado activo | Urgente→"URGENTE"
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

const REPORT_ADJUST_SYS = (mode, isDark) => `Eres "Asistente de Radiología". Tu tarea es REESCRIBIR un informe radiológico HTML existente manteniendo formato y rigor.

## OBJETIVO
${mode === "essential"
  ? `Modo "Dejar lo esencial":
- Quita texto de relleno y redundancias.
- Conserva SIEMPRE toda la información clínica y radiológica clave.
- Mantén un informe claro, corto y útil para decisión clínica.`
  : `Modo "Añadir detalles":
- Amplía el informe con normalidad estructurada de las estructuras evaluables que no se hayan mencionado.
- Añade "cromo" útil (detalle profesional), sin inventar patología.
- Mantén todos los hallazgos patológicos ya presentes y su relevancia.`}

## REGLAS CRÍTICAS
- NO perder hallazgos patológicos existentes.
- NO inventar lesiones ni datos no sustentados.
- Mantener el bloque de CONCLUSIÓN coherente con HALLAZGOS.
- Mantener el estilo HTML profesional del informe.
- Respetar código de colores:
  * Grave: #CC0000
  * Leve: #D2691E
  * Normal vinculado: #2E8B57
  * Relleno normal: ${isDark ? "#aaa" : "#444"}

## RESPUESTA
Devuelve SOLO HTML del informe completo, sin markdown ni explicaciones.`;

const ANALYSIS_SYS = (c, report) => `Eres un consultor experto en radiología diagnóstica con un toque de humor sutil y un puntito sarcástico que hace la lectura entretenida. Eres ese compañero brillante que te explica las cosas con rigor científico pero sin aburrir. Usas comentarios ingeniosos, analogías cotidianas y algún guiño cómplice, pero SIEMPRE manteniendo la precisión clínica. No eres un payaso, eres un crack con gracia.
${buildCtxBlock(c)}

## INFORME ACTUAL
${report}

## TONO Y ESTILO
- Humor sutil y sarcasmo ligero: como el radiólogo veterano que ha visto de todo y te lo cuenta con una media sonrisa. Ejemplo: "Spoiler alert: ese nódulo no pinta bien" o "La pleura dice: estoy bien, gracias por preguntar".
- Usa expresiones coloquiales médicas que conecten con el lector. Puedes tutear al lector.
- Intercala comentarios ingeniosos entre la información seria. Que se note que hay un humano (bueno, casi) detrás.
- Haz que el diagnóstico principal sea DRAMÁTICO visualmente (grande, en color, llamativo).
- Usa analogías cuando ayuden: "ese derrame es más grande que mi ego".
- Las perlas radiológicas deben sonar como consejos de mentor experimentado, con un toque de "esto no te lo enseñan en los libros".
- IMPORTANTE: El humor NUNCA debe comprometer la precisión médica. Los datos clínicos son sagrados.

## ESTRUCTURA HTML (usa estilos inline, juega con tamaños, colores, negritas, subrayados y formato visual variado)
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.8;font-size:14px;color:#333;">

<div style="margin-bottom:2em;padding:20px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);border-left:5px solid #4f46e5;border-radius:0 12px 12px 0;box-shadow:0 2px 8px rgba(79,70,229,0.1);">
<p style="font-weight:800;font-size:1.3em;color:#3730a3;margin-bottom:10px;letter-spacing:-0.02em;">📋 RESUMEN DEL CASO</p>
<p style="font-size:15px;color:#1e1b4b;line-height:1.8;">[Resumen conciso pero con personalidad. Empieza con algo que enganche, ej: "Nos llega un/a paciente de X años que..." con un toque narrativo breve]</p></div>

<div style="margin-bottom:2em;">
<p style="font-weight:800;font-size:1.35em;color:#111;border-bottom:3px solid #6366f1;padding-bottom:8px;margin-bottom:16px;">🔍 DIAGNÓSTICO DIFERENCIAL</p>
<p style="font-size:13px;color:#6b7280;margin-bottom:14px;font-style:italic;">[Comentario introductorio con humor, ej: "Vamos al grano, que la lista de sospechosos es interesante..."]</p>

<div style="margin:14px 0;padding:18px 20px;background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:12px;border:2px solid #fca5a5;box-shadow:0 2px 6px rgba(239,68,68,0.08);">
<p style="font-weight:800;font-size:1.2em;color:#dc2626;margin-bottom:6px;">🥇 1. [Diagnóstico principal] — <span style="background:#dc2626;color:#fff;padding:2px 10px;border-radius:20px;font-size:0.85em;">[X%]</span></p>
<p style="font-size:13px;color:#991b1b;font-style:italic;margin-bottom:10px;">[Comentario con personalidad sobre este diagnóstico]</p>
<p style="margin:4px 0;"><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">✅ A FAVOR</span> [argumentos]</p>
<p style="margin:4px 0;"><span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">❌ EN CONTRA</span> [argumentos]</p>
<p style="margin:4px 0;"><span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">🔑 CLAVE</span> <span style="text-decoration:underline;text-decoration-color:#6366f1;font-weight:600;">[dato decisivo]</span></p></div>

<div style="margin:14px 0;padding:16px 20px;background:#fafafa;border-radius:12px;border:1px solid #e5e7eb;">
<p style="font-weight:700;font-size:1.05em;color:#ea580c;">🥈 2. [Diagnóstico] — <span style="background:#ea580c;color:#fff;padding:2px 10px;border-radius:20px;font-size:0.8em;">[X%]</span></p>
<p style="margin:4px 0;"><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">✅ A FAVOR</span> [...]</p>
<p style="margin:4px 0;"><span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">❌ EN CONTRA</span> [...]</p>
<p style="margin:4px 0;"><span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;">🔑 CLAVE</span> <span style="text-decoration:underline;text-decoration-color:#6366f1;font-weight:600;">[...]</span></p></div>

[Repetir para más diagnósticos con estilo similar, reduciendo intensidad visual progresivamente]
</div>

<div style="margin-bottom:2em;padding:18px 20px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;border:1px solid #86efac;">
<p style="font-weight:800;font-size:1.2em;color:#166534;margin-bottom:6px;">⚠️ <span style="text-decoration:underline;">DIAGNÓSTICOS "CAN'T MISS"</span></p>
<p style="font-size:13px;color:#15803d;font-style:italic;margin-bottom:10px;">[Comentario tipo: "Estos son los que no te puedes permitir pasar por alto, o tendrás una charla incómoda con el jefe..."]</p>
<p>[Lista con los diagnósticos que aunque menos probables serían catastróficos si se pasan por alto, con <strong>negrita</strong> en lo importante]</p></div>

<div style="margin-bottom:2em;">
<p style="font-weight:800;font-size:1.2em;color:#222;border-bottom:3px solid #a78bfa;padding-bottom:8px;margin-bottom:12px;">📐 ESCALAS Y GRADUACIONES</p>
<p style="font-size:13px;color:#6b7280;font-style:italic;margin-bottom:10px;">[Comentario introductorio, ej: "Hora de poner números a las sensaciones..."]</p>
<div style="padding:14px 18px;background:#faf5ff;border-radius:10px;border:1px solid #d8b4fe;">
<p>[Escalas aplicables con valores <span style="font-size:1.1em;font-weight:800;color:#7c3aed;">[resaltados]</span> y su interpretación. Usa <strong>negrita</strong> para los valores y <span style="color:#7c3aed;">color</span> para las categorías]</p></div></div>

<div style="margin-bottom:2em;">
<p style="font-weight:800;font-size:1.2em;color:#222;border-bottom:3px solid #67e8f9;padding-bottom:8px;margin-bottom:12px;">👁️ SIGNOS RADIOLÓGICOS CLAVE</p>
<p style="font-size:13px;color:#6b7280;font-style:italic;margin-bottom:10px;">[Comentario introductorio, ej: "Aquí es donde se separan los radiólogos de los que simplemente miran placas..."]</p>
<div style="padding:14px 18px;background:#ecfeff;border-radius:10px;border:1px solid #a5f3fc;">
<p>[Lista de signos con nombre en <strong style="color:#0e7490;">negrita y color</strong>, descripción de qué buscar, y por qué importa. Usa formato visual variado: algunos como bullets, otros como mini-tarjetas]</p></div></div>

<div style="margin-bottom:2em;">
<p style="font-weight:800;font-size:1.2em;color:#222;border-bottom:3px solid #86efac;padding-bottom:8px;margin-bottom:12px;">🎯 RECOMENDACIONES</p>
<p style="font-size:13px;color:#6b7280;font-style:italic;margin-bottom:10px;">[Comentario, ej: "Y ahora la parte en la que decimos lo que toca hacer..."]</p>
<div style="padding:14px 18px;background:#f0fdf4;border-radius:10px;border:1px solid #86efac;">
<p>[Recomendaciones priorizadas. Usa <span style="font-weight:800;color:#dc2626;">URGENTE</span> / <span style="font-weight:700;color:#ea580c;">IMPORTANTE</span> / <span style="color:#16a34a;">RUTINARIO</span> como etiquetas de prioridad. Incluye plazos sugeridos en <strong>negrita</strong>]</p></div></div>

<div style="padding:20px;background:linear-gradient(135deg,#fefce8,#fef9c3);border-left:5px solid #eab308;border-radius:0 12px 12px 0;box-shadow:0 2px 8px rgba(234,179,8,0.1);">
<p style="font-weight:800;font-size:1.2em;color:#854d0e;margin-bottom:10px;">💡 PERLAS RADIOLÓGICAS</p>
<p style="font-size:13px;color:#92400e;font-style:italic;margin-bottom:12px;">[Intro tipo: "De esas cosas que aprendes después de ver 10.000 estudios..."]</p>
<div style="padding:12px 16px;background:rgba(255,255,255,0.6);border-radius:8px;margin-bottom:8px;">
<p>[2-4 perlas con formato variado: alguna con <strong>negrita</strong>, otra con <span style="text-decoration:underline;">subrayado</span>, datos numéricos <span style="font-size:1.15em;font-weight:800;color:#b45309;">resaltados</span>. Que suenen a consejo de mentor experimentado con un guiño]</p></div></div>

</div>

SOLO HTML con estilos inline. Probabilidades numéricas obligatorias. Diagnósticos "can't miss" siempre. El humor es el vehículo, la medicina es el destino. NUNCA sacrifiques precisión por un chiste.`;

const CHAT_SYS = (c, report, analysis) => `Eres consultor de radiología experto.
${buildCtxBlock(c)}
${report ? "\n## INFORME\n" + report : ""}
${analysis ? "\n## ANÁLISIS\n" + analysis : ""}
Responde directo, profesional. HTML para complejas, texto para breves. Español.`;


const KEY_IDEAS_SYS = (c, report, analysis) => `Eres consultor experto en radiología diagnóstica. A partir del informe y análisis del caso, genera exactamente 10 ideas clave que un radiólogo debe llevarse de este caso. Genera HTML profesional con estilos inline. JUEGA CON EL FORMATO: usa negritas, MAYÚSCULAS, subrayados, tamaños variados y colores para que la lectura sea ágil y visualmente atractiva.
${buildCtxBlock(c)}

## INFORME
${report}
${analysis ? "\n## ANÁLISIS\n" + analysis : ""}

## FORMATO HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.8;font-size:14px;color:#333;">
<p style="font-weight:800;font-size:1.2em;color:#92400e;margin-bottom:14px;border-bottom:3px solid #fde68a;padding-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">💡 10 IDEAS CLAVE DEL CASO</p>

<div style="margin-bottom:12px;padding:14px 18px;background:#fffbeb;border-left:5px solid #dc2626;border-radius:0 10px 10px 0;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
<p style="margin-bottom:4px;"><strong style="color:#dc2626;font-size:1.15em;">1.</strong> <span style="font-weight:800;text-transform:uppercase;color:#991b1b;font-size:0.95em;letter-spacing:0.3px;">[TÍTULO BREVE DE LA IDEA]</span></p>
<p style="margin:0;font-size:13.5px;color:#444;line-height:1.6;">[Explicación concisa con <strong>términos clave en negrita</strong>, <span style="text-decoration:underline;text-decoration-color:#f59e0b;">datos importantes subrayados</span> y <span style="font-weight:700;color:#b45309;">valores numéricos resaltados</span>]</p>
</div>

... (repetir para las 10 ideas, alternando colores de borde según gravedad)
</div>

## FORMATO DE CADA IDEA (OBLIGATORIO)
- Línea 1: NÚMERO + TÍTULO EN MAYÚSCULAS Y NEGRITA (resume la idea en 3-6 palabras)
- Línea 2: Explicación de 1-2 frases con formato variado:
  · Términos médicos clave en <strong>negrita</strong>
  · Valores numéricos y medidas con <span style="font-weight:700;color:#b45309;">peso visual</span>
  · Datos críticos con <span style="text-decoration:underline;">subrayado</span>
  · Diagnósticos importantes en MAYÚSCULAS

## REGLAS
- Exactamente 10 ideas, numeradas
- Cada idea: título en MAYÚSCULAS + explicación con formato rico
- Enfocadas en lo que el radiólogo debe recordar: hallazgos críticos, diagnóstico, seguimiento, errores a evitar, correlaciones clínico-radiológicas
- Ordenadas de mayor a menor relevancia clínica
- Incluir si aplica: diagnóstico principal, hallazgos incidentales, recomendaciones de seguimiento, signos radiológicos clave, diagnósticos diferenciales importantes, errores frecuentes a evitar
- Color del borde izquierdo según gravedad: #dc2626 para patología grave, #f59e0b para hallazgos moderados, #16a34a para normalidad relevante
- Variar el formato visual entre ideas para evitar monotonía

SOLO HTML. Sin explicaciones adicionales.`;

const JUSTIFICATION_SYS = (c, report) => `Eres un experto en justificación de pruebas de imagen y radioprotección. Analiza si la prueba radiológica solicitada estaba clínicamente justificada según las guías de práctica clínica, criterios de adecuación y principios ALARA. Genera HTML profesional con estilos inline.
${buildCtxBlock(c)}

${report ? `## INFORME RADIOLÓGICO\n${report}` : "## INFORME RADIOLÓGICO\nNo disponible (análisis solo con la información de 'Qué sabemos')."}

## FORMATO HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.7;font-size:14px;color:#333;">
<div style="margin-bottom:1.5em;padding:16px;border-radius:8px;border-left:4px solid [COLOR_SEGÚN_VEREDICTO];">
<p style="font-weight:bold;font-size:1.2em;margin-bottom:8px;">[VEREDICTO_ICONO] VEREDICTO: [JUSTIFICADA / PARCIALMENTE JUSTIFICADA / NO JUSTIFICADA / INSUFICIENTE INFORMACIÓN]</p>
<p style="font-size:0.95em;">[Resumen breve del veredicto]</p>
</div>

<div style="margin-bottom:1.5em;">
<p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">📋 ANÁLISIS DE LA INDICACIÓN</p>
<p>[Análisis del motivo clínico vs prueba solicitada]</p>
</div>

<div style="margin-bottom:1.5em;">
<p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">📐 CRITERIOS DE ADECUACIÓN</p>
<p>[Referencia a guías: ACR Appropriateness Criteria, ESR iGuide, guías nacionales]</p>
<p>[Puntuación de adecuación si aplica: 1-9]</p>
</div>

<div style="margin-bottom:1.5em;">
<p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">⚖️ BALANCE RIESGO-BENEFICIO</p>
<p>[Dosis estimada si radiación ionizante]</p>
<p>[Beneficio diagnóstico obtenido vs riesgo]</p>
</div>

<div style="margin-bottom:1.5em;">
<p style="font-weight:bold;font-size:1.1em;color:#222;border-bottom:2px solid #e5e7eb;padding-bottom:6px;">🔄 ALTERNATIVAS</p>
<p>[¿Había alternativas con menor radiación o más adecuadas?]</p>
</div>

<div style="padding:16px;background:#f0f7ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;">
<p style="font-weight:bold;color:#1e40af;">📝 CONCLUSIÓN</p>
<p>[Resumen final y recomendación para futuras solicitudes similares]</p>
</div>
</div>

## COLORES VEREDICTO
- Justificada: verde #16a34a, icono ✅
- Parcialmente justificada: naranja #d97706, icono ⚠️
- No justificada: rojo #dc2626, icono ❌
- Insuficiente información: gris #6b7280, icono ❓

## REGLAS
- Sé objetivo y basado en evidencia
- Cita guías específicas cuando sea posible (ACR, ESR, SERAM)
- Considera edad, género, contexto clínico, prioridad
- Si es urgente/código ictus, valorar la urgencia en la justificación
- Si hay informe, evalúa si los hallazgos encontrados respaldan la indicación
- Si no hay informe, centra el análisis exclusivamente en la indicación clínica y su adecuación
- Menciona dosis efectiva aproximada si aplica (mSv)

SOLO HTML. Sin explicaciones adicionales.`;

const DIFF_DIAG_SYS = (c, report, analysis) => `Eres consultor experto en radiología diagnóstica. Genera un diagnóstico diferencial exhaustivo para este caso usando un sistema de semáforo de probabilidades. Genera HTML profesional con estilos inline. JUEGA CON EL FORMATO: usa negritas, MAYÚSCULAS, subrayados, tamaños variados y colores para que la lectura sea ágil, visual y fácil de escanear rápidamente.
${buildCtxBlock(c)}

## INFORME
${report}
${analysis ? "\n## ANÁLISIS PREVIO\n" + analysis : ""}

## FORMATO HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.8;font-size:14px;color:#333;">
<p style="font-weight:800;font-size:1.25em;color:#222;margin-bottom:14px;border-bottom:3px solid #e5e7eb;padding-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">🚦 DIAGNÓSTICO DIFERENCIAL</p>

<!-- Para cada diagnóstico, usar el color de semáforo correspondiente -->
<div style="margin:12px 0;padding:16px 20px;background:rgba(220,38,38,0.06);border-left:6px solid #dc2626;border-radius:0 10px 10px 0;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:#dc2626;box-shadow:0 0 6px rgba(220,38,38,0.4);"></span>
<strong style="color:#dc2626;font-size:1.15em;text-transform:uppercase;letter-spacing:0.3px;">1. [DIAGNÓSTICO MÁS PROBABLE]</strong>
<span style="background:#dc2626;color:#fff;padding:2px 10px;border-radius:20px;font-size:0.8em;font-weight:700;">[X%]</span>
</div>
<p style="margin:6px 0;font-size:13.5px;"><span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-weight:800;font-size:12px;text-transform:uppercase;">✅ A FAVOR</span> [argumentos con <strong>términos clave en negrita</strong> y <span style="text-decoration:underline;">hallazgos subrayados</span>]</p>
<p style="margin:6px 0;font-size:13.5px;"><span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:800;font-size:12px;text-transform:uppercase;">❌ EN CONTRA</span> [argumentos]</p>
<p style="margin:6px 0;font-size:13.5px;"><span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:4px;font-weight:800;font-size:12px;text-transform:uppercase;">🔑 DATO CLAVE</span> <span style="text-decoration:underline;text-decoration-color:#6366f1;font-weight:700;">[signo o hallazgo determinante]</span></p>
<p style="margin:6px 0;font-size:13px;"><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:4px;font-weight:800;font-size:11px;text-transform:uppercase;">🔬 CONFIRMAR CON</span> [prueba confirmatoria]</p>
</div>

[Repetir con colores naranja #ea580c, amarillo #ca8a04, verde #16a34a — reduciendo intensidad visual progresivamente]

<div style="margin-top:1.8em;padding:18px 20px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:10px;border:2px solid #e2e8f0;">
<p style="font-weight:800;color:#1e293b;margin-bottom:8px;font-size:1.1em;text-transform:uppercase;letter-spacing:0.3px;">🎯 RESUMEN Y CONDUCTA</p>
<p>[Diagnóstico principal en <strong style="font-size:1.05em;text-decoration:underline;">NEGRITA MAYÚSCULA SUBRAYADO</strong> y conducta recomendada con <strong>pasos priorizados</strong>]</p>
</div>
</div>

## FORMATO DE CADA DIAGNÓSTICO (OBLIGATORIO)
- Nombre del diagnóstico siempre en MAYÚSCULAS y negrita
- Porcentaje en badge/pill de color
- Etiquetas (A FAVOR, EN CONTRA, DATO CLAVE, CONFIRMAR CON) en MAYÚSCULAS como badges
- Hallazgos relevantes en <strong>negrita</strong> dentro del texto
- Datos determinantes con <span style="text-decoration:underline;">subrayado</span>
- Valores numéricos y medidas con peso visual (font-weight:700, color)

## CÓDIGO DE SEMÁFORO (OBLIGATORIO)
- 🔴 ROJO (#dc2626): Más probable (>50% o diagnóstico principal)
- 🟠 NARANJA (#ea580c): Algo menos probable (20-50%)
- 🟡 AMARILLO (#ca8a04): Menos probable aún (5-20%)
- 🟢 VERDE (#16a34a): Prácticamente descartado (<5%)

## REGLAS
- Mínimo 4 diagnósticos, máximo 8
- Cada diagnóstico con: argumentos a favor, en contra, dato clave, prueba confirmatoria
- Las probabilidades deben sumar ~100%
- Ordenar de mayor a menor probabilidad
- El color del borde izquierdo y del texto DEBE corresponder al semáforo
- Incluir diagnósticos "can't miss" aunque sean poco probables
- Usar formato variado entre diagnósticos para evitar monotonía visual

SOLO HTML. Sin explicaciones adicionales.`;

const MIND_MAP_SYS = (c, report, analysis) => `Eres consultor experto en radiología diagnóstica y comunicación visual. A partir del informe y análisis del caso, genera un MAPA MENTAL visual en HTML puro (sin JavaScript, sin SVG, sin canvas) que organice toda la información del caso de forma jerárquica y visualmente clara.
${buildCtxBlock(c)}

## INFORME
${report}
${analysis ? "\n## ANÁLISIS\n" + analysis : ""}

## ESTRUCTURA DEL MAPA MENTAL
El nodo central es el CASO/PACIENTE. De ahí salen ramas principales:

1. 🏥 DATOS CLÍNICOS — edad, sexo, antecedentes, motivo
2. 🔬 HALLAZGOS — hallazgos principales y secundarios del informe
3. 🎯 DIAGNÓSTICO PRINCIPAL — diagnóstico más probable con probabilidad
4. 🔀 DIFERENCIAL — otros diagnósticos posibles (con probabilidades)
5. ⚠️ CAN'T MISS — diagnósticos que no se pueden pasar por alto
6. 📐 ESCALAS — escalas y graduaciones aplicables
7. 📋 RECOMENDACIONES — seguimiento, pruebas adicionales
8. 💡 PERLAS — datos clave para recordar

## FORMATO HTML (CSS puro, SIN JavaScript)
Usa un diseño de árbol/mapa visual con:
- Un nodo central grande y llamativo (el caso)
- Ramas que salen radialmente usando flexbox y CSS
- Cada rama con un color temático diferente
- Sub-nodos con bordes redondeados y colores de fondo suaves
- Conectores visuales usando bordes CSS (border-left, border-top)
- Tipografía variada: MAYÚSCULAS para categorías, negrita para términos clave, subrayado para datos críticos
- Tamaños de fuente decrecientes según nivel de profundidad

## EJEMPLO DE ESTRUCTURA HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;padding:20px;">

<!-- NODO CENTRAL -->
<div style="text-align:center;margin-bottom:30px;">
<div style="display:inline-block;padding:16px 28px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:16px;font-weight:800;font-size:1.2em;text-transform:uppercase;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
🧠 [TIPO DE ESTUDIO] — [DIAGNÓSTICO PRINCIPAL]
</div>
</div>

<!-- GRID DE RAMAS (2 columnas) -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

<!-- RAMA: cada una con su color temático -->
<div style="padding:14px 16px;border-radius:12px;border-left:5px solid [COLOR];background:[BG_SUAVE];">
<p style="font-weight:800;font-size:0.9em;text-transform:uppercase;letter-spacing:0.5px;color:[COLOR];margin-bottom:8px;">[ICONO] [CATEGORÍA]</p>
<div style="padding-left:12px;border-left:2px dashed [COLOR_SUAVE];">
<p style="margin:4px 0;font-size:13px;">• <strong>[Concepto clave]</strong>: [detalle con <span style="text-decoration:underline;">subrayado</span> en datos importantes]</p>
<p style="margin:4px 0;font-size:13px;">• [Sub-nodo con <span style="font-weight:700;color:[COLOR];">valores resaltados</span>]</p>
</div>
</div>

</div>
</div>

## COLORES POR RAMA (OBLIGATORIO)
- Datos clínicos: #6366f1 (índigo)
- Hallazgos: #0891b2 (cyan)
- Diagnóstico principal: #dc2626 (rojo)
- Diferencial: #ea580c (naranja)
- Can't miss: #b91c1c (rojo oscuro)
- Escalas: #7c3aed (púrpura)
- Recomendaciones: #16a34a (verde)
- Perlas: #d97706 (ámbar)

## REGLAS
- NO usar JavaScript, SVG ni canvas. Solo HTML + CSS inline
- Diseño visual tipo mapa mental con nodo central y ramas
- Usar grid de 2 columnas para las ramas
- Formato rico: MAYÚSCULAS en categorías, negrita en términos, subrayado en datos críticos
- Información concisa: cada punto del mapa en 1 línea máximo
- El diagnóstico principal debe destacar visualmente sobre todo lo demás
- Incluir probabilidades numéricas en el diferencial
- Los sub-nodos deben tener indentación visual (padding-left + border-left)
- Omitir ramas que no apliquen al caso (ej: si no hay escalas, no incluir esa rama)

SOLO HTML. Sin explicaciones adicionales.`;

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

function Tab({ active, icon, label, status, onClick, onRun, canRun, isRunning, P, compact }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: compact ? 3 : 5, padding: compact ? "7px 9px" : "9px 14px",
      background: active ? P.tabBtnBgActive : P.tabBtnBg,
      border: "1px solid " + (active ? P.tabShellBorder : P.tabBtnBorder),
      borderBottom: active ? "1px solid " + P.gold : "1px solid " + P.tabBtnBorder,
      color: active ? P.gold : P.text3, fontSize: compact ? 11 : 13, fontWeight: active ? 700 : 500,
      cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", fontFamily: "inherit",
      flexShrink: 0, borderRadius: 10, boxShadow: active ? "0 8px 18px rgba(0,0,0,0.12)" : "none",
    }}>
      <span>{icon}</span><span>{label}</span>
      {status && <span title={status === "unread" ? "Nuevo pendiente de revisar" : "Ya revisado"} style={{ width: 8, height: 8, borderRadius: "50%", background: status === "unread" ? "#22c55e" : "#fff", border: "1px solid " + (status === "unread" ? "#16a34a" : "rgba(255,255,255,0.6)") }} />}
      {onRun && (
        <span
          role="button"
          title={isRunning ? "Generando..." : "Ejecutar IA"}
          onClick={(e) => { e.stopPropagation(); if (canRun && !isRunning) onRun(); }}
          style={{
            marginLeft: compact ? 2 : 4,
            width: compact ? 18 : 20,
            height: compact ? 18 : 20,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: compact ? 10 : 11,
            background: canRun ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
            color: canRun ? "#22c55e" : P.text4,
            border: "1px solid " + (canRun ? "rgba(34,197,94,0.35)" : P.goldBorder),
            cursor: canRun && !isRunning ? "pointer" : "not-allowed",
            opacity: isRunning ? 0.6 : 1,
            pointerEvents: "auto",
          }}
        >
          {isRunning ? "…" : "▶"}
        </span>
      )}
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

function MultiEntryGroup({ entries, onChange, label, singularLabel, placeholder, P, ff, setFf, fieldKey, bigH }) {
  const normalizedEntries = entries.map(entry => ({ ...entry, images: Array.isArray(entry.images) ? entry.images : [] }));

  const updateText = (idx, text) => {
    onChange(normalizedEntries.map((e, i) => i === idx ? { ...e, text } : e));
  };
  const toggleCollapse = (idx) => {
    onChange(normalizedEntries.map((e, i) => i === idx ? { ...e, collapsed: !e.collapsed } : e));
  };
  const removeEntry = (idx) => {
    if (normalizedEntries.length <= 1) { onChange([newEntry()]); return; }
    onChange(normalizedEntries.filter((_, i) => i !== idx));
  };
  const addEntry = () => {
    onChange([...normalizedEntries.map(e => e.text.trim() ? { ...e, collapsed: true } : e), newEntry()]);
  };

  const appendImages = (idx, files) => {
    if (!files.length) return;
    Promise.all(files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("No se pudo leer imagen pegada"));
      reader.readAsDataURL(file);
    }))).then(results => {
      onChange(normalizedEntries.map((e, i) => i === idx ? { ...e, images: [...(e.images || []), ...results] } : e));
    }).catch(() => {});
  };

  const onPasteImages = (idx, e) => {
    const files = Array.from(e.clipboardData?.items || [])
      .filter(item => item.type.startsWith("image/"))
      .map(item => item.getAsFile())
      .filter(Boolean);
    if (!files.length) return;
    e.preventDefault();
    appendImages(idx, files);
  };

  const removeImage = (idx, imageIdx) => {
    onChange(normalizedEntries.map((entry, i) => {
      if (i !== idx) return entry;
      return { ...entry, images: entry.images.filter((_, j) => j !== imageIdx) };
    }));
  };

  const hasMultiple = normalizedEntries.length > 1 || normalizedEntries[0].text.trim() || normalizedEntries[0].images.length;

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: P.text3, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </label>
      {normalizedEntries.map((entry, idx) => {
        const itemKey = `${fieldKey}_${idx}`;
        const focused = ff === itemKey;
        const num = normalizedEntries.length > 1 ? ` ${idx + 1}` : "";
        const imageCount = entry.images.length;

        if (entry.collapsed && entry.text.trim()) {
          return (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", marginBottom: 5,
              borderRadius: 7, border: "1px solid " + P.goldBorder, background: P.goldBg,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: P.gold, whiteSpace: "nowrap" }}>
                {singularLabel}{num}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: P.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.text.trim().substring(0, 80)}{entry.text.trim().length > 80 ? "…" : ""}
              </span>
              {!!imageCount && <span style={{ fontSize: 11, color: P.text3, whiteSpace: "nowrap" }}>🖼️ {imageCount}</span>}
              <button onClick={() => toggleCollapse(idx)} title="Editar" style={{
                background: "none", border: "none", cursor: "pointer", color: P.gold,
                fontSize: 13, padding: "2px 5px", lineHeight: 1,
              }}>✏️</button>
              <button onClick={() => removeEntry(idx)} title="Eliminar" style={{
                background: "none", border: "none", cursor: "pointer", color: P.errorText,
                fontSize: 13, fontWeight: 700, padding: "2px 5px", lineHeight: 1,
              }}>✕</button>
            </div>
          );
        }

        return (
          <div key={idx} style={{ marginBottom: 5 }}>
            {hasMultiple && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: P.text3, fontWeight: 500 }}>{singularLabel}{num}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {entry.text.trim() && (
                    <button onClick={() => toggleCollapse(idx)} style={{
                      background: "none", border: "none", cursor: "pointer", color: P.gold,
                      fontSize: 11, fontFamily: "inherit", padding: "1px 4px",
                    }}>▲ Guardar</button>
                  )}
                  {normalizedEntries.length > 1 && (
                    <button onClick={() => removeEntry(idx)} style={{
                      background: "none", border: "none", cursor: "pointer", color: P.errorText,
                      fontSize: 11, fontFamily: "inherit", padding: "1px 4px", fontWeight: 700,
                    }}>✕</button>
                  )}
                </div>
              </div>
            )}
            <textarea
              placeholder={placeholder}
              value={entry.text}
              onChange={e => updateText(idx, e.target.value)}
              onPaste={e => onPasteImages(idx, e)}
              onFocus={() => setFf(itemKey)}
              onBlur={() => setFf("")}
              style={{
                width: "100%", padding: "7px 10px", borderRadius: 7,
                border: "1px solid " + (focused ? P.goldBorderFocus : P.inputBorder),
                background: focused ? P.inputBgFocus : P.inputBg,
                color: P.text, fontSize: 13, fontFamily: "inherit", outline: "none",
                resize: "vertical", minHeight: focused ? (bigH || 180) : 56, lineHeight: 1.5,
                boxSizing: "border-box", transition: "min-height 0.3s, border-color 0.2s, background 0.2s",
              }}
            />
            {!!imageCount && (
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {entry.images.map((img, imageIdx) => (
                  <div key={`${idx}_${imageIdx}`} style={{ position: "relative" }}>
                    <img src={img} alt={`Imagen pegada ${imageIdx + 1}`} style={{ width: 78, height: 78, objectFit: "cover", borderRadius: 8, border: "1px solid " + P.goldBorder }} />
                    <button
                      onClick={() => removeImage(idx, imageIdx)}
                      title="Eliminar imagen"
                      style={{
                        position: "absolute", top: -6, right: -6, borderRadius: 999, border: "none", width: 18, height: 18,
                        background: P.errorText, color: "#fff", fontSize: 11, lineHeight: 1, cursor: "pointer",
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: P.text4, marginTop: 4 }}>💡 Puedes pegar imágenes con Ctrl/Cmd+V en este campo.</div>
          </div>
        );
      })}
      <button onClick={addEntry} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        width: "100%", marginTop: 2, padding: "5px 10px", borderRadius: 7,
        border: "1px dashed " + P.goldBorder, background: "transparent",
        color: P.gold, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
        opacity: 0.7, transition: "opacity 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
      >
        + Añadir {singularLabel.toLowerCase()}
      </button>
    </div>
  );
}

function CollapsibleSection({ title, subtitle, isOpen, onToggle, P, children }) {
  return (
    <div style={{ marginBottom: 14, borderRadius: 10, border: "1px solid " + P.goldBorder, background: P.goldBg }}>
      <button onClick={onToggle} style={{
        width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
        color: P.text, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit",
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.gold }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: P.text3, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <span style={{ fontSize: 14, color: P.gold }}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <div style={{ padding: "0 12px 10px" }}>{children}</div>}
    </div>
  );
}

export default function Page() {
  const emptyCtx = normalizeCtx({ age: "", birthYear: "", gender: "", studyRequested: "", priority: "programado", reason: "", clinicalHistory: [newEntry()], priorRadiology: [newEntry()], clinicalReports: [newEntry()], freeText: "" });

  const [themePref, setThemePref] = useState("auto");
  const [systemDark, setSystemDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState("left"); // "left" or "right"

  useEffect(() => {
    setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
  const [ldReportAdjust, setLdReportAdjust] = useState(false);
  const [ldAnalysis, setLdAnalysis] = useState(false);
  const [ldChat, setLdChat] = useState(false);
  const [keyIdeas, setKeyIdeas] = useState("");
  const [ldKeyIdeas, setLdKeyIdeas] = useState(false);
  const [justification, setJustification] = useState("");
  const [ldJustification, setLdJustification] = useState(false);
  const [diffDiag, setDiffDiag] = useState("");
  const [ldDiffDiag, setLdDiffDiag] = useState(false);
  const [mindMap, setMindMap] = useState("");
  const [ldMindMap, setLdMindMap] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReport, setEditedReport] = useState("");
  const [copied, setCopied] = useState("");
  const [err, setErr] = useState("");
  const [showMP, setShowMP] = useState(false);
  const [showCodeDrop, setShowCodeDrop] = useState(false);
  const [showTotum, setShowTotum] = useState(false);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [showPriorRadiology, setShowPriorRadiology] = useState(false);
  const [showClinicalReports, setShowClinicalReports] = useState(false);
  const [ff, setFf] = useState("");
  const [spending, setSpending] = useState({ totalCost: 0, inputTokens: 0, outputTokens: 0, calls: 0 });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [tabStatus, setTabStatus] = useState({
    clinicalContext: "idle",
    report: "idle",
    analysis: "idle",
    keyIdeas: "idle",
    justification: "idle",
    diffDiag: "idle",
    mindMap: "idle",
  });
  const rightTabbarRef = useRef(null);

  const clinicalContextData = useMemo(() => buildClinicalContextData(ctx, fMsgs, cMsgs), [ctx, fMsgs, cMsgs]);
  const [clinicalContextDraft, setClinicalContextDraft] = useState("");
  const [ldClinicalPolish, setLdClinicalPolish] = useState(false);
  const [clinicalRecommendations, setClinicalRecommendations] = useState("");
  const [ldClinicalRecommendations, setLdClinicalRecommendations] = useState(false);
  useEffect(() => {
    setClinicalContextDraft(clinicalContextData.structuredText || "");
    setClinicalRecommendations("");
  }, [clinicalContextData.structuredText]);


  const getAgeFromBirthYear = (yearValue) => {
    const year = Number(yearValue);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1900 || year > currentYear) return "";
    return String(currentYear - year);
  };

  const readImagesFromPaste = (e) => Array.from(e.clipboardData?.items || [])
    .filter(item => item.type.startsWith("image/"))
    .map(item => item.getAsFile())
    .filter(Boolean);

  const filesToDataUrls = (files) => Promise.all(files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer imagen pegada"));
    reader.readAsDataURL(file);
  })));

  const appendPastedImagesToCtx = async (ctxKey, files) => {
    if (!files.length) return;
    try {
      const images = await filesToDataUrls(files);
      setCtx(prev => ({ ...prev, [ctxKey]: [...(prev[ctxKey] || []), ...images] }));
    } catch {}
  };

  const removeCtxImage = (ctxKey, idx) => {
    setCtx(prev => ({ ...prev, [ctxKey]: (prev[ctxKey] || []).filter((_, i) => i !== idx) }));
  };

  const collectContextImageBlocks = () => {
    const blocks = [];
    const pushImages = (arr, label) => {
      (arr || []).forEach((url, idx) => {
        if (!url || typeof url !== "string" || !url.startsWith("data:image/")) return;
        const [meta, data] = url.split(",");
        if (!meta || !data) return;
        const mediaType = meta.match(/data:(image\/[a-zA-Z0-9+.-]+);base64/)?.[1] || "image/png";
        blocks.push({ type: "text", text: `${label} ${idx + 1}:` });
        blocks.push({ type: "image", source: { type: "base64", media_type: mediaType, data } });
      });
    };
    pushImages(ctx.reasonImages, "Imagen del motivo clínico");
    pushImages(ctx.freeTextImages, "Imagen del totum revolutum");
    (ctx.clinicalHistory || []).forEach((entry, i) => pushImages(entry.images, `Imagen de antecedente ${i + 1}`));
    (ctx.priorRadiology || []).forEach((entry, i) => pushImages(entry.images, `Imagen de informe radiológico previo ${i + 1}`));
    (ctx.clinicalReports || []).forEach((entry, i) => pushImages(entry.images, `Imagen de informe clínico ${i + 1}`));
    return blocks;
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("radiology_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem("radiology_history", JSON.stringify(history)); } catch {}
  }, [history]);

  // Extract a plain-text summary from the report HTML conclusion
  const extractSummary = (html) => {
    try {
      const d = document.createElement("div");
      d.innerHTML = html;
      const fullText = d.innerText || d.textContent || "";
      // Try to find the CONCLUSIÓN section
      const idx = fullText.indexOf("CONCLUSIÓN");
      if (idx !== -1) {
        const after = fullText.substring(idx + "CONCLUSIÓN".length).replace(/^[:\s]+/, "");
        // Get up to RECOMENDACIÓN or end, and cap at 200 chars
        const endIdx = after.indexOf("RECOMENDACIÓN");
        const conclusion = (endIdx !== -1 ? after.substring(0, endIdx) : after).trim();
        if (conclusion.length > 0) return conclusion.length > 200 ? conclusion.substring(0, 200) + "…" : conclusion;
      }
      // Fallback: first 200 chars of full text
      const clean = fullText.trim();
      return clean.length > 200 ? clean.substring(0, 200) + "…" : clean;
    } catch {
      return "Sin resumen disponible";
    }
  };

  const htmlToText = (html) => {
    if (!html) return "";
    const d = document.createElement("div");
    d.innerHTML = html;
    return (d.innerText || d.textContent || "").trim();
  };

  const sanitizeFilename = (value) => (value || "caso-radiologia")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "caso-radiologia";

  const buildExportPayload = () => {
    const when = new Date();
    const dateText = when.toLocaleString("es-ES");
    const reportText = htmlToText(isEditingReport ? editedReport : report);
    const analysisText = htmlToText(analysis);
    const keyIdeasText = htmlToText(keyIdeas);
    const justificationText = htmlToText(justification);
    const diffDiagText = htmlToText(diffDiag);
    const mindMapText = htmlToText(mindMap);
    const ctxText = clinicalContextDraft.trim() || clinicalContextData.structuredText || "Sin contexto clínico estructurado.";
    const findingsMsgs = fMsgs.filter(m => m.role === "user").map((m, i) => `- ${i + 1}. ${m.content}`).join("\n");
    const chatMsgs = cMsgs.map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`).join("\n\n");

    const sections = [
      `# Caso radiológico`,
      `- Fecha de exportación: ${dateText}`,
      `- Estudio solicitado: ${ctx.studyRequested || "No especificado"}`,
      `- Prioridad: ${getPriorityLabel(ctx.priority)}`,
      "",
      "## Contexto clínico",
      ctxText,
      "",
      "## Recomendaciones contextuales",
      clinicalRecommendations || "No generado.",
      "",
      "## Informe final",
      reportText || "Sin informe.",
      "",
      "## Hallazgos aportados por el usuario",
      findingsMsgs || "Sin hallazgos aportados.",
      "",
      "## Chat del caso",
      chatMsgs || "Sin chat libre.",
      "",
      "## Análisis",
      analysisText || "No generado.",
      "",
      "## Ideas clave",
      keyIdeasText || "No generado.",
      "",
      "## ¿Justificada?",
      justificationText || "No generado.",
      "",
      "## Diagnóstico diferencial",
      diffDiagText || "No generado.",
      "",
      "## Mapa mental",
      mindMapText || "No generado.",
    ];

    return {
      markdown: sections.join("\n"),
      baseName: `${sanitizeFilename(ctx.studyRequested || "caso-radiologia")}-${when.toISOString().slice(0, 10)}`,
    };
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const buildPdfBlobFromText = (text) => {
    const pageWidth = 595;
    const pageHeight = 842;
    const marginX = 50;
    const marginTop = 790;
    const maxChars = 95;
    const maxLinesPerPage = 52;
    const escapePdfText = (value) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const wrapLine = (line) => {
      if (!line.trim()) return [""];
      const words = line.split(/\s+/);
      const out = [];
      let current = "";
      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars) current = candidate;
        else {
          if (current) out.push(current);
          current = word;
        }
      });
      if (current) out.push(current);
      return out;
    };

    const wrappedLines = text.split("\n").flatMap(wrapLine);
    const pages = [];
    for (let i = 0; i < wrappedLines.length; i += maxLinesPerPage) pages.push(wrappedLines.slice(i, i + maxLinesPerPage));
    if (!pages.length) pages.push([""]);

    let pdf = "%PDF-1.4\n";
    const objects = [];
    const addObject = (body) => {
      const offset = pdf.length;
      const id = objects.length + 1;
      pdf += `${id} 0 obj\n${body}\nendobj\n`;
      objects.push({ id, offset });
      return id;
    };

    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pageIds = [];
    const contentIds = [];

    pages.forEach((lines) => {
      const streamLines = ["BT", `/F1 11 Tf`, `${marginX} ${marginTop} Td`];
      lines.forEach((line, idx) => {
        if (idx === 0) streamLines.push(`(${escapePdfText(line)}) Tj`);
        else streamLines.push(`T* (${escapePdfText(line)}) Tj`);
      });
      streamLines.push("ET");
      const content = streamLines.join("\n");
      const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      contentIds.push(contentId);
      pageIds.push(null);
    });

    const pagesId = objects.length + pages.length + 1;

    pages.forEach((_, idx) => {
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[idx]} 0 R >>`);
      pageIds[idx] = pageId;
    });

    addObject(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] >>`);
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    objects.forEach((obj) => {
      pdf += `${String(obj.offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  };

  const buildCaseSnapshot = () => ({
    ctx,
    fMsgs,
    cMsgs,
    report,
    analysis,
    keyIdeas,
    justification,
    diffDiag,
    mindMap,
    editedReport,
    isEditingReport,
    fInput,
    cInput,
    lTab,
    rTab,
    model,
    spending,
    tabStatus,
    showClinicalHistory,
    showPriorRadiology,
    showClinicalReports,
    showTotum,
    clinicalContextDraft,
    clinicalRecommendations,
  });

  const saveToHistory = (reportHtml, caseCtx) => {
    const now = new Date();
    const entry = {
      id: Date.now(),
      date: now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
      time: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      study: caseCtx.studyRequested || "Estudio no especificado",
      summary: extractSummary(reportHtml),
      snapshot: { ...buildCaseSnapshot(), report: reportHtml },
    };
    setHistory(prev => [entry, ...prev]);
  };

  const loadHistoryEntry = (entry) => {
    if (!entry?.snapshot) return;
    const snap = entry.snapshot;
    const normalizedSnapCtx = normalizeCtx(snap.ctx || emptyCtx);
    setCtx(normalizedSnapCtx);
    setCtxSnap(JSON.stringify(normalizedSnapCtx));
    setFMsgs(snap.fMsgs || []);
    setCMsgs(snap.cMsgs || []);
    setReport(snap.report || "");
    setAnalysis(snap.analysis || "");
    setKeyIdeas(snap.keyIdeas || "");
    setJustification(snap.justification || "");
    setDiffDiag(snap.diffDiag || "");
    setMindMap(snap.mindMap || "");
    setEditedReport(snap.editedReport || snap.report || "");
    setIsEditingReport(!!snap.isEditingReport);
    setFInput(snap.fInput || "");
    setCInput(snap.cInput || "");
    setLTab(snap.lTab || "context");
    setRTab(snap.rTab || "report");
    setModel(snap.model || MODELS[1].id);
    setSpending(snap.spending || { totalCost: 0, inputTokens: 0, outputTokens: 0, calls: 0 });
    setTabStatus(snap.tabStatus || { clinicalContext: "idle", report: "idle", analysis: "idle", keyIdeas: "idle", justification: "idle", diffDiag: "idle", mindMap: "idle" });
    setShowClinicalHistory(!!snap.showClinicalHistory);
    setShowPriorRadiology(!!snap.showPriorRadiology);
    setShowClinicalReports(!!snap.showClinicalReports);
    setShowTotum(!!snap.showTotum);
    setClinicalContextDraft(snap.clinicalContextDraft || "");
    setClinicalRecommendations(snap.clinicalRecommendations || "");
    setErr("");
    setShowHistory(false);
  };

  const deleteHistoryEntry = (id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const [lpWidth, setLpWidth] = useState(42);
  const [lpCollapsed, setLpCollapsed] = useState(false);
  const lpWidthBeforeCollapse = useRef(42);
  const dragging = useRef(false);
  const mainRef = useRef(null);

  const fEndRef = useRef(null);
  const cEndRef = useRef(null);
  const fInpRef = useRef(null);
  const cInpRef = useRef(null);
  const reportEditorRef = useRef(null);

  useEffect(() => {
    if (!isEditingReport) setEditedReport(report);
  }, [report, isEditingReport]);

  useEffect(() => { fEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [fMsgs, ldReport]);
  useEffect(() => { cEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cMsgs, ldChat]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const pct = (x / rect.width) * 100;
      setLpWidth(Math.min(75, Math.max(20, pct)));
    };
    const onUp = () => { dragging.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
  }, []);

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
    const ctxImageBlocks = collectContextImageBlocks();
    const apiMessages = msgs.map((m, idx) => {
      const baseText = typeof m.content === "string"
        ? [{ type: "text", text: m.content }]
        : Array.isArray(m.content)
          ? m.content
          : [{ type: "text", text: String(m.content || "") }];

      if (idx === 0 && ctxImageBlocks.length && m.role === "user") {
        return { role: m.role, content: [...ctxImageBlocks, ...baseText] };
      }
      return { role: m.role, content: baseText };
    });

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: mt, system: sys, messages: apiMessages }),
    });
    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      throw new Error(errData.error || `Error ${r.status}`);
    }
    const d = await r.json();
    const text = (d.content || []).map(b => b.text || "").join("");
    // Track spending from usage data returned by the Anthropic API
    if (d.usage) {
      const p = PRICING[model] || PRICING["claude-sonnet-4-20250514"];
      const inTok = d.usage.input_tokens || 0;
      const outTok = d.usage.output_tokens || 0;
      const cost = (inTok * p.input + outTok * p.output) / 1_000_000;
      setSpending(prev => ({
        totalCost: prev.totalCost + cost,
        inputTokens: prev.inputTokens + inTok,
        outputTokens: prev.outputTokens + outTok,
        calls: prev.calls + 1,
      }));
    }
    return text;
  };

  const clean = (s) => { let t = s.trim(); if (t.startsWith("```html")) t = t.slice(7); else if (t.startsWith("```")) t = t.slice(3); if (t.endsWith("```")) t = t.slice(0, -3); return t.trim(); };

  const sendFindings = async () => {
    const t = fInput.trim(); if (!t || ldReport) return;
    setErr(""); const um = { role: "user", content: t }; const nm = [...fMsgs, um];
    setFMsgs(nm); setFInput(""); setLdReport(true); setRTab("report");
    if (isMobile) setMobilePanel("right");
    try { const h = clean(await callAPI(REPORT_SYS(ctx, isDark), nm)); setFMsgs(p => [...p, { role: "assistant", content: h }]); setReport(h); setCtxSnap(JSON.stringify(ctx)); saveToHistory(h, ctx); }
    catch (e) { setErr("Error informe: " + e.message); } setLdReport(false);
  };
  const regenReport = async () => {
    if (!fMsgs.length || ldReport) return; setLdReport(true); setErr(""); setRTab("report");
    try { const h = clean(await callAPI(REPORT_SYS(ctx, isDark), fMsgs)); setReport(h); }
    catch (e) { setErr("Error regenerar: " + e.message); } setLdReport(false);
  };
  const adjustReport = async (mode) => {
    if (!report || ldReportAdjust || isEditingReport) return;
    setErr("");
    setLdReportAdjust(true);
    setRTab("report");
    try {
      const userInstruction = mode === "essential"
        ? "Reescribe este informe dejando solo lo esencial, sin perder información clave."
        : "Reescribe este informe añadiendo normalidad estructurada y más detalle profesional útil sin inventar patología.";
      const adjusted = clean(await callAPI(
        REPORT_ADJUST_SYS(mode, isDark),
        [{ role: "user", content: `${userInstruction}

INFORME ACTUAL:
${report}` }],
        4096
      ));
      setReport(adjusted);
      if (isEditingReport) {
        setEditedReport(adjusted);
      }
    } catch (e) {
      setErr("Error al ajustar informe: " + e.message);
    }
    setLdReportAdjust(false);
  };
  const genAnalysis = async (focusTab = true) => {
    if (!report || ldAnalysis) return; setLdAnalysis(true); setErr(""); if (focusTab) setRTab("analysis");
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
  const genKeyIdeas = async (focusTab = true) => {
    if (!report || ldKeyIdeas) return; setLdKeyIdeas(true); setErr(""); if (focusTab) setRTab("keyIdeas");
    try { setKeyIdeas(clean(await callAPI(KEY_IDEAS_SYS(ctx, report, analysis), [{ role: "user", content: "Genera las 10 ideas clave de este caso radiológico." }]))); }
    catch (e) { setErr("Error ideas clave: " + e.message); } setLdKeyIdeas(false);
  };
  const genJustification = async (focusTab = true) => {
    if (!clinicalContextData.hasAny || ldJustification) return; setLdJustification(true); setErr(""); if (focusTab) setRTab("justification");
    try { setJustification(clean(await callAPI(JUSTIFICATION_SYS(ctx, report), [{ role: "user", content: "Analiza la justificación de esta prueba radiológica." }]))); }
    catch (e) { setErr("Error justificación: " + e.message); } setLdJustification(false);
  };
  const genDiffDiag = async (focusTab = true) => {
    if (!report || ldDiffDiag) return; setLdDiffDiag(true); setErr(""); if (focusTab) setRTab("diffDiag");
    try { setDiffDiag(clean(await callAPI(DIFF_DIAG_SYS(ctx, report, analysis), [{ role: "user", content: "Genera el diagnóstico diferencial con código semáforo para este caso." }]))); }
    catch (e) { setErr("Error diagnóstico diferencial: " + e.message); } setLdDiffDiag(false);
  };
  const genMindMap = async (focusTab = true) => {
    if (!report || ldMindMap) return; setLdMindMap(true); setErr(""); if (focusTab) setRTab("mindMap");
    try { setMindMap(clean(await callAPI(MIND_MAP_SYS(ctx, report, analysis), [{ role: "user", content: "Genera un mapa mental visual completo de este caso radiológico." }]))); }
    catch (e) { setErr("Error mapa mental: " + e.message); } setLdMindMap(false);
  };

  const cpText = async () => { if (!report) return; const d = document.createElement("div"); d.innerHTML = report; await navigator.clipboard.writeText(d.innerText || d.textContent); setCopied("t"); setTimeout(() => setCopied(""), 2500); };
  const cpClinicalContext = async () => { if (!clinicalContextDraft.trim()) return; await navigator.clipboard.writeText(clinicalContextDraft); setCopied("clinical"); setTimeout(() => setCopied(""), 2500); };
  const polishClinicalContext = async () => {
    if (!clinicalContextDraft.trim() || ldClinicalPolish) return;
    setErr("");
    setLdClinicalPolish(true);
    try {
      const polished = clean(await callAPI(
        CLINICAL_CONTEXT_POLISH_SYS,
        [{ role: "user", content: clinicalContextDraft }],
        700
      ));
      setClinicalContextDraft(polished);
    } catch (e) {
      setErr("Error al procesar contexto clínico: " + e.message);
    }
    setLdClinicalPolish(false);
  };
  const genClinicalRecommendations = async () => {
    const text = clinicalContextDraft.trim() || clinicalContextData.structuredText || "";
    if (!text || ldClinicalRecommendations) return;
    setErr("");
    setLdClinicalRecommendations(true);
    try {
      const reco = (await callAPI(
        CLINICAL_RECOMMENDATIONS_SYS,
        [{ role: "user", content: text }],
        550
      )).trim();
      setClinicalRecommendations(reco);
    } catch (e) {
      setErr("Error al generar recomendaciones: " + e.message);
    }
    setLdClinicalRecommendations(false);
  };
  const cpHtml = async () => { if (!report) return; try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([report], { type: "text/html" }), "text/plain": new Blob([report], { type: "text/plain" }) })]); } catch { await navigator.clipboard.writeText(report); } setCopied("h"); setTimeout(() => setCopied(""), 2500); };
  const startEditReport = () => {
    setEditedReport(report);
    setIsEditingReport(true);
  };
  const cancelEditReport = () => {
    setEditedReport(report);
    setIsEditingReport(false);
  };
  const exportCaseAsMarkdown = () => {
    const payload = buildExportPayload();
    downloadFile(new Blob([payload.markdown], { type: "text/markdown;charset=utf-8" }), `${payload.baseName}.md`);
  };

  const exportCaseAsPdf = () => {
    const payload = buildExportPayload();
    const pdfBlob = buildPdfBlobFromText(payload.markdown);
    downloadFile(pdfBlob, `${payload.baseName}.pdf`);
  };

  const saveEditedReport = () => {
    const html = reportEditorRef.current?.innerHTML ?? editedReport;
    setReport(html);
    setEditedReport(html);
    setIsEditingReport(false);
    setTimeout(() => {
      try { exportCaseAsPdf(); }
      catch (e) { setErr("No se pudo exportar el PDF automáticamente: " + e.message); }
    }, 0);
  };
  const clearAll = () => {
    setCtx(emptyCtx);
    setFMsgs([]);
    setCMsgs([]);
    setReport("");
    setAnalysis("");
    setKeyIdeas("");
    setJustification("");
    setDiffDiag("");
    setMindMap("");
    setClinicalRecommendations("");
    setIsEditingReport(false);
    setEditedReport("");
    setFInput("");
    setCInput("");
    setErr("");
    setCtxSnap("");
    setLTab("context");
    setRTab("report");
    setShowCodeDrop(false);
    setShowTotum(false);
    setShowClinicalHistory(false);
    setShowPriorRadiology(false);
    setShowClinicalReports(false);
    setLdReportAdjust(false);
    setSpending({ totalCost: 0, inputTokens: 0, outputTokens: 0, calls: 0 });
    setTabStatus({ clinicalContext: "idle", report: "idle", analysis: "idle", keyIdeas: "idle", justification: "idle", diffDiag: "idle", mindMap: "idle" });
  };
  const hk = (e, fn) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fn(); } };
  const markTabRead = (tabKey) => {
    setTabStatus(prev => prev[tabKey] === "unread" ? { ...prev, [tabKey]: "read" } : prev);
  };
  const openRightTab = (tabKey) => {
    setRTab(tabKey);
    markTabRead(tabKey);
  };
  const setTabSeenState = (tabKey, hasContent) => {
    if (!hasContent) return;
    setTabStatus(prev => ({ ...prev, [tabKey]: rTab === tabKey ? "read" : "unread" }));
  };
  useEffect(() => { setTabSeenState("report", !!report); }, [report, rTab]);
  useEffect(() => { setTabSeenState("analysis", !!analysis); }, [analysis, rTab]);
  useEffect(() => { setTabSeenState("keyIdeas", !!keyIdeas); }, [keyIdeas, rTab]);
  useEffect(() => { setTabSeenState("justification", !!justification); }, [justification, rTab]);
  useEffect(() => { setTabSeenState("diffDiag", !!diffDiag); }, [diffDiag, rTab]);
  useEffect(() => { setTabSeenState("mindMap", !!mindMap); }, [mindMap, rTab]);

  const scrollRightTabs = (delta) => {
    if (!rightTabbarRef.current) return;
    rightTabbarRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const rightTabsConfig = [
    { key: "clinicalContext", icon: "🩺", label: "Contexto clínico", run: null, loading: false, canRun: false },
    { key: "report", icon: "📄", label: "Informe", run: null, loading: ldReport, canRun: false },
    { key: "analysis", icon: "🔍", label: "Análisis", run: () => genAnalysis(false), loading: ldAnalysis, canRun: !!report },
    { key: "keyIdeas", icon: "💡", label: "Ideas Clave", run: () => genKeyIdeas(false), loading: ldKeyIdeas, canRun: !!report },
    { key: "justification", icon: "❓", label: "¿Justificada?", run: () => genJustification(false), loading: ldJustification, canRun: !!report },
    { key: "diffDiag", icon: "🚦", label: "Diferencial", run: () => genDiffDiag(false), loading: ldDiffDiag, canRun: !!report },
    { key: "mindMap", icon: "🧠", label: "Mapa Mental", run: () => genMindMap(false), loading: ldMindMap, canRun: !!report },
  ];

  const sm = MODELS.find(m => m.id === model);
  const S = {
    root: { display: "flex", flexDirection: "column", height: isMobile ? "auto" : "100vh", minHeight: isMobile ? "100vh" : undefined, width: "100%", background: P.bg, color: P.text, fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", overflow: isMobile ? "auto" : "hidden", transition: "background 0.3s, color 0.3s" },
    hdr: { display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", padding: isMobile ? "8px 12px" : "10px 18px", borderBottom: "1px solid " + P.goldBorder, background: isDark ? "linear-gradient(135deg,#12121e,#1a1a2e)" : "linear-gradient(135deg,#f8f6f1,#f0ece2)", flexShrink: 0, gap: isMobile ? 6 : 10, flexWrap: "wrap" },
    logo: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 17 : 20, fontWeight: 700, color: P.gold, letterSpacing: 0.5 },
    sub: { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 8 : 10, color: P.goldDim, letterSpacing: isMobile ? 2 : 3, textTransform: "uppercase", marginTop: 1 },
    hdrR: { display: "flex", alignItems: "center", gap: isMobile ? 5 : 8, flexWrap: "wrap" },
    mBtn: { display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: 7, border: "1px solid " + P.goldBorder, background: P.goldBg, color: P.gold, fontSize: isMobile ? 11 : 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", position: "relative" },
    mDrop: { position: "absolute", top: "calc(100% + 4px)", right: 0, background: P.dropdownBg, border: "1px solid " + P.goldBorder, borderRadius: 10, padding: 5, zIndex: 100, minWidth: 170, boxShadow: P.dropdownShadow },
    mOpt: (a) => ({ display: "flex", justifyContent: "space-between", padding: "7px 10px", borderRadius: 6, cursor: "pointer", background: a ? P.goldBgActive : "transparent", color: a ? P.gold : P.text2, fontSize: 13, fontWeight: a ? 600 : 400 }),
    clr: { padding: isMobile ? "4px 8px" : "5px 10px", borderRadius: 7, border: "1px solid " + P.goldBorder, background: "transparent", color: P.gold, fontSize: isMobile ? 11 : 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" },
    main: { display: "flex", flexDirection: isMobile ? "column" : "row", flex: 1, overflow: isMobile ? "visible" : "hidden" },
    lp: isMobile
      ? { display: mobilePanel === "left" ? "flex" : "none", flexDirection: "column", width: "100%", minHeight: "calc(100vh - 110px)" }
      : { display: lpCollapsed ? "none" : "flex", flexDirection: "column", width: lpWidth + "%", minWidth: 200, flexShrink: 0, transition: "width 0.2s" },
    divider: isMobile
      ? { display: "none" }
      : { width: 6, cursor: lpCollapsed ? "default" : "col-resize", background: "transparent", flexShrink: 0, position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" },
    dividerLine: { width: lpCollapsed ? 0 : 2, height: "100%", background: P.goldBorder, borderRadius: 1, transition: "background 0.2s, width 0.2s" },
    collapseBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 20, height: 40, borderRadius: 4, border: "1px solid " + P.goldBorder, background: P.bg2, color: P.gold, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontFamily: "inherit", zIndex: 11, transition: "background 0.2s" },
    rp: isMobile
      ? { display: mobilePanel === "right" ? "flex" : "none", flexDirection: "column", width: "100%", minHeight: "calc(100vh - 110px)" }
      : { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
    tb: { display: "flex", borderBottom: "1px solid " + P.tabShellBorder, background: P.tabShellBg, flexShrink: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth", gap: 6, padding: isMobile ? "6px 6px 5px" : "8px 8px 7px", backdropFilter: "blur(10px)" },
    tabNavBtn: { width: 30, border: "1px solid " + P.tabShellBorder, borderRadius: 8, margin: isMobile ? "6px 2px 5px" : "8px 3px 7px", background: P.tabBtnBg, color: P.gold, cursor: "pointer", fontSize: 14, flexShrink: 0 },
    cs: { flex: 1, overflowY: "auto", padding: isMobile ? "12px 10px" : "14px 16px" },
    fg: { marginBottom: 14 },
    lb: { display: "block", fontSize: 11, fontWeight: 600, color: P.text3, marginBottom: 4, letterSpacing: 0.3, textTransform: "uppercase" },
    inp: (f) => ({ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s" }),
    sel: { width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + P.inputBorder, background: isDark ? P.inputBg : "#ece7db", color: P.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", cursor: "pointer" },
    selOpt: { background: isDark ? "#1a1a2e" : "#ece7db", color: P.text },
    taf: (f, bigH) => ({ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", minHeight: f ? (bigH || 180) : 56, lineHeight: 1.5, boxSizing: "border-box", transition: "min-height 0.3s, border-color 0.2s, background 0.2s" }),
    chip: (v, cur) => { const isCode = cur && cur.startsWith("codigo_"); const active = v === "codigo" ? isCode : v === cur; const isUrgentType = v === "urgente" || v === "codigo"; return { padding: "5px 12px", borderRadius: 18, border: active ? "2px solid" : "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: "inherit",
      background: active ? (isUrgentType ? P.ictusBg : P.goldBg) : "transparent",
      color: active ? (isUrgentType ? "#ef4444" : P.gold) : P.text3,
      borderColor: active ? (isUrgentType ? "#ef4444" : P.gold) : P.goldBorder }; },
    ca: { flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 9 },
    ub: { alignSelf: "flex-end", maxWidth: "85%", padding: "9px 13px", borderRadius: "13px 13px 3px 13px", fontSize: 14, lineHeight: 1.5, background: P.bubbleUser, color: "#fff" },
    ab: { alignSelf: "flex-start", maxWidth: "85%", padding: "9px 13px", borderRadius: "13px 13px 13px 3px", fontSize: 13, lineHeight: 1.5, background: P.bubbleAsst, color: P.text2, border: "1px solid " + P.bubbleAsstBorder },
    ia: { padding: "9px 12px", borderTop: "1px solid " + P.goldBorder, background: P.bg2, flexShrink: 0 },
    ir: { display: "flex", gap: 7, alignItems: "flex-end" },
    ta: (f) => ({ flex: 1, resize: "none", border: "1px solid " + (f ? P.goldBorderFocus : P.inputBorder), borderRadius: 10, padding: "9px 12px", fontSize: 14, lineHeight: 1.5, background: f ? P.inputBgFocus : P.inputBg, color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", minHeight: f ? 140 : 42, maxHeight: 300, overflow: "auto", boxSizing: "border-box", transition: "min-height 0.3s, border-color 0.2s" }),
    sb: (d) => ({ width: 40, height: 40, borderRadius: 10, border: "none", cursor: d ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: d ? (isDark ? "#333" : "#ccc") : "linear-gradient(135deg,#c4973c,#a07830)", color: "#fff", fontSize: 15, flexShrink: 0 }),
    ht: { fontSize: 10, color: P.text4, marginTop: 3 },
    rh: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "8px 10px" : "9px 14px", borderBottom: "1px solid " + P.reportHeaderBorder, background: P.reportHeader, flexShrink: 0, flexWrap: "wrap", gap: 5 },
    rt: { fontSize: isMobile ? 12 : 13, fontWeight: 600, color: P.reportTitleColor, letterSpacing: 0.5, textTransform: "uppercase" },
    rc: { flex: 1, overflowY: "auto", padding: isMobile ? "14px 12px" : "20px 24px", background: P.reportBg, color: P.text },
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
      {isMobile && <style>{`
        /* Hide scrollbar for mobile tab bars */
        div[data-tabbar] { -ms-overflow-style: none; scrollbar-width: none; }
        div[data-tabbar]::-webkit-scrollbar { display: none; }
        /* Ensure HTML content from AI adapts to mobile */
        .rpt-content div[style], .rpt-content p[style] { max-width: 100% !important; overflow-wrap: break-word !important; word-wrap: break-word !important; }
        .rpt-content img { max-width: 100% !important; height: auto !important; }
        .rpt-content table { max-width: 100% !important; display: block !important; overflow-x: auto !important; }
        .rpt-content pre { max-width: 100% !important; overflow-x: auto !important; }
      `}</style>}
      <div style={S.hdr}>
        <div><div style={S.logo}>asistente_de_radiolog<span style={{ color: isDark ? "#e8c547" : "#b8860b", textShadow: isDark ? "0 0 8px rgba(232,197,71,0.4)" : "none" }}>IA</span></div><div style={S.sub}>Estación de trabajo <span style={{ letterSpacing: 1, opacity: 0.7 }}>·</span> <span style={{ fontStyle: "italic", letterSpacing: 1, fontSize: 9, opacity: 0.6 }}>by Alexis Espinosa</span></div></div>
        <div style={S.hdrR}>
          {spending.calls > 0 && <div style={{
            display: isMobile ? "none" : "flex", alignItems: "center", gap: 8, padding: "4px 12px",
            borderRadius: 8, border: "1px dashed " + P.goldBorder,
            background: isDark ? "rgba(196,151,60,0.06)" : "rgba(150,114,42,0.04)",
            fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11, color: P.text2,
          }}>
            <span style={{ fontSize: 14 }}>🧾</span>
            <span style={{ fontWeight: 700, color: spending.totalCost >= 0.10 ? "#e67e22" : P.gold, fontSize: 13 }}>
              {spending.totalCost < 0.01
                ? (spending.totalCost * 1000).toFixed(2) + " milésimas $"
                : spending.totalCost < 1
                  ? (spending.totalCost * 100).toFixed(2) + "¢"
                  : "$" + spending.totalCost.toFixed(2)}
            </span>
            <span style={{ color: P.text4 }}>|</span>
            <span title={`${spending.inputTokens.toLocaleString()} entrada + ${spending.outputTokens.toLocaleString()} salida`}>
              {((spending.inputTokens + spending.outputTokens) / 1000).toFixed(1)}k tok
            </span>
            <span style={{ color: P.text4 }}>|</span>
            <span>{spending.calls} {spending.calls === 1 ? "llamada" : "llamadas"}</span>
          </div>}
          <ThemeToggle themePref={themePref} setThemePref={setThemePref} P={P} />
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMP(!showMP)} style={S.mBtn}>{sm?.cost} {sm?.label} ▾</button>
            {showMP && <div style={S.mDrop}>{MODELS.map(m => (
              <div key={m.id} style={S.mOpt(m.id === model)} onClick={() => { setModel(m.id); setShowMP(false); }}><span>{m.cost} {m.label}</span><span style={{ fontSize: 11, opacity: 0.6 }}>{m.desc}</span></div>
            ))}</div>}
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ ...S.clr, display: "flex", alignItems: "center", gap: 5 }}>
              <span>Historial</span>
              {history.length > 0 && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 9, background: P.gold, color: isDark ? "#111" : "#fff", fontSize: 10, fontWeight: 700, padding: "0 4px" }}>{history.length}</span>}
            </button>
            {showHistory && <>
              <div onClick={() => setShowHistory(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
              <div style={{ position: isMobile ? "fixed" : "absolute", top: isMobile ? "auto" : "calc(100% + 6px)", bottom: isMobile ? 0 : "auto", left: isMobile ? 0 : "auto", right: isMobile ? 0 : 0, width: isMobile ? "100%" : 370, maxHeight: isMobile ? "60vh" : "70vh", background: P.dropdownBg, border: "1px solid " + P.goldBorder, borderRadius: isMobile ? "12px 12px 0 0" : 12, boxShadow: P.dropdownShadow, zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid " + P.historyHeaderBorder, background: P.historyHeader }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: P.historyTitleColor }}>Historial de casos</span>
                  {history.length > 0 && <button onClick={clearHistory} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid " + P.historyClearBorder, background: P.historyClearBg, color: P.historyDeleteHover, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Borrar todo</button>}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
                  {history.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 10px", color: P.historyEmpty }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.historyTitleColor, marginBottom: 4 }}>Sin historial</div>
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>Los casos que informes se guardarán aquí automáticamente.</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 11, color: P.historyEmpty, marginBottom: 2 }}>{history.length} {history.length === 1 ? "caso guardado" : "casos guardados"}</div>
                      {history.map(entry => (
                        <div key={entry.id} style={{
                          padding: "10px 12px", borderRadius: 8,
                          background: P.historyCardBg, border: "1px solid " + P.historyCardBorder,
                          transition: "background 0.2s", cursor: entry.snapshot ? "pointer" : "default",
                        }}
                          onClick={() => loadHistoryEntry(entry)}
                          onMouseEnter={e => e.currentTarget.style.background = P.historyCardHover}
                          onMouseLeave={e => e.currentTarget.style.background = P.historyCardBg}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: P.historyDate }}>{entry.date}</span>
                              <span style={{ fontSize: 10, color: P.historyEmpty }}>{entry.time}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.id); }} title="Eliminar" style={{
                              background: "none", border: "none", cursor: "pointer", color: P.historyDeleteBtn,
                              fontSize: 13, padding: "1px 3px", lineHeight: 1, transition: "color 0.2s",
                            }}
                              onMouseEnter={e => e.currentTarget.style.color = P.historyDeleteHover}
                              onMouseLeave={e => e.currentTarget.style.color = P.historyDeleteBtn}
                            >✕</button>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: P.historyStudy, marginBottom: 4 }}>{entry.study}</div>
                          <div style={{ fontSize: 11, color: P.historySummary, lineHeight: 1.4 }}>{entry.summary}</div>
                          {entry.snapshot && <div style={{ marginTop: 6, fontSize: 10, color: P.historyEmpty }}>Abrir caso guardado</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>}
          </div>
          <button onClick={clearAll} style={S.clr}>Nueva sesión</button>
        </div>
      </div>

      {isMobile && (
        <div style={{
          display: "flex", borderBottom: "1px solid " + P.goldBorder, background: P.bg2, flexShrink: 0,
        }}>
          <button
            onClick={() => setMobilePanel("left")}
            style={{
              flex: 1, padding: "10px 0", border: "none", fontFamily: "inherit",
              fontSize: 13, fontWeight: mobilePanel === "left" ? 700 : 400, cursor: "pointer",
              background: mobilePanel === "left" ? P.goldBgActive : "transparent",
              color: mobilePanel === "left" ? P.gold : P.text3,
              borderBottom: mobilePanel === "left" ? "2px solid " + P.gold : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            Contexto
          </button>
          <button
            onClick={() => setMobilePanel("right")}
            style={{
              flex: 1, padding: "10px 0", border: "none", fontFamily: "inherit",
              fontSize: 13, fontWeight: mobilePanel === "right" ? 700 : 400, cursor: "pointer",
              background: mobilePanel === "right" ? P.goldBgActive : "transparent",
              color: mobilePanel === "right" ? P.gold : P.text3,
              borderBottom: mobilePanel === "right" ? "2px solid " + P.gold : "2px solid transparent",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            Resultados
            {report && mobilePanel === "left" && <span style={{ position: "absolute", top: 6, right: "20%", width: 7, height: 7, borderRadius: "50%", background: P.gold }} />}
          </button>
        </div>
      )}

      <div ref={mainRef} style={S.main}>
        <div style={S.lp}>
          <div data-tabbar="" style={S.tb}>
            <Tab active={lTab === "context"} icon="📋" label="Qué sabemos" onClick={() => setLTab("context")} P={P} compact={isMobile} />
            <Tab active={lTab === "findings"} icon="🔎" label="Qué vemos" badge={!!report && lTab !== "findings"} onClick={() => setLTab("findings")} P={P} compact={isMobile} />
            <Tab active={lTab === "chat"} icon="💬" label="Chat" badge={cMsgs.length > 0 && lTab !== "chat"} onClick={() => setLTab("chat")} P={P} compact={isMobile} />
          </div>
          {lTab === "context" ? (
            <div style={S.cs}>
              <CollapsibleSection
                title="🍲 El Totum Revolutum"
                subtitle="No te compliques: pega aquí todo el churro (edad, informes, lo que sea) y nosotros nos apañamos"
                isOpen={showTotum}
                onToggle={() => setShowTotum(v => !v)}
                P={P}
              >
                <textarea
                  placeholder="Pega aquí todo lo que tengas: edad, sexo, antecedentes, informes previos, informes clínicos, motivo... todo revuelto, sin orden ni concierto."
                  value={ctx.freeText}
                  onChange={e => setCtx({ ...ctx, freeText: e.target.value })}
                  onPaste={async (e) => {
                    const files = readImagesFromPaste(e);
                    if (!files.length) return;
                    e.preventDefault();
                    await appendPastedImagesToCtx("freeTextImages", files);
                  }}
                  onFocus={() => setFf("ft")}
                  onBlur={() => setFf("")}
                  style={{ ...S.taf(ff === "ft", 120), borderStyle: "dashed", marginBottom: 0 }}
                />
                {!!ctx.freeTextImages?.length && (
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ctx.freeTextImages.map((img, idx) => (
                      <div key={`ft_img_${idx}`} style={{ position: "relative" }}>
                        <img src={img} alt={`Imagen totum ${idx + 1}`} style={{ width: 78, height: 78, objectFit: "cover", borderRadius: 8, border: "1px solid " + P.goldBorder }} />
                        <button onClick={() => removeCtxImage("freeTextImages", idx)} style={{ position: "absolute", top: -6, right: -6, borderRadius: 999, border: "none", width: 18, height: 18, background: P.errorText, color: "#fff", fontSize: 11, lineHeight: 1, cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: P.text4, marginTop: 6 }}>💡 También puedes pegar imágenes con Ctrl/Cmd+V aquí.</div>
              </CollapsibleSection>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: P.goldBorder }} />
                <span style={{ fontSize: 10, color: P.text4, textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" }}>o si eres buen@ y quieres separar</span>
                <div style={{ flex: 1, height: 1, background: P.goldBorder }} />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ ...S.fg, flex: 1, minWidth: 120 }}>
                  <label style={S.lb}>Edad</label>
                  <input
                    type="number"
                    placeholder="—"
                    value={ctx.age}
                    onChange={e => setCtx({ ...ctx, age: e.target.value, birthYear: "" })}
                    onFocus={() => setFf("ag")}
                    onBlur={() => setFf("")}
                    style={S.inp(ff === "ag")}
                  />
                </div>
                <div style={{ ...S.fg, flex: 1, minWidth: 120 }}>
                  <label style={S.lb}>Año de nacimiento</label>
                  <input
                    type="number"
                    placeholder="Ej: 1984"
                    value={ctx.birthYear || ""}
                    onChange={e => {
                      const birthYear = e.target.value;
                      setCtx({ ...ctx, birthYear, age: getAgeFromBirthYear(birthYear) });
                    }}
                    onFocus={() => setFf("by")}
                    onBlur={() => setFf("")}
                    style={S.inp(ff === "by")}
                  />
                </div>
                <div style={{ ...S.fg, flex: 1, minWidth: 120 }}><label style={S.lb}>Género</label><select value={ctx.gender} onChange={e => setCtx({ ...ctx, gender: e.target.value })} style={S.sel}><option value="" style={S.selOpt}>—</option><option value="Hombre" style={S.selOpt}>Hombre</option><option value="Mujer" style={S.selOpt}>Mujer</option></select></div>
              </div>
              <div style={S.fg}><label style={S.lb}>Estudio solicitado</label><input type="text" placeholder="Ej: TC tórax con CIV, RM lumbar..." value={ctx.studyRequested} onChange={e => setCtx({ ...ctx, studyRequested: e.target.value })} onFocus={() => setFf("st")} onBlur={() => setFf("")} style={S.inp(ff === "st")} /></div>
              <div style={S.fg}><label style={S.lb}>Prioridad</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => { setCtx({ ...ctx, priority: "programado" }); setShowCodeDrop(false); }} style={S.chip("programado", ctx.priority)}>Programado</button>
                  <button onClick={() => { setCtx({ ...ctx, priority: "urgente" }); setShowCodeDrop(false); }} style={S.chip("urgente", ctx.priority)}>🔴 Urgente</button>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowCodeDrop(!showCodeDrop)} style={{ ...S.chip("codigo", ctx.priority), display: "flex", alignItems: "center", gap: 4 }}>
                      🚨 {ctx.priority.startsWith("codigo_") ? { codigo_ictus: "C. Ictus", codigo_trauma: "C. Trauma", codigo_tep: "C. TEP", codigo_medula: "C. Médula", codigo_hemostasis: "C. Hemostasis" }[ctx.priority] : "Código"} ▾
                    </button>
                    {showCodeDrop && <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: P.dropdownBg, border: "1px solid " + P.goldBorder, borderRadius: 10, padding: 5, zIndex: 100, minWidth: 200, boxShadow: P.dropdownShadow }}>
                      {[["codigo_ictus", "🧠 Código Ictus"], ["codigo_trauma", "🩸 Código Trauma"], ["codigo_tep", "🫁 Código TEP"], ["codigo_medula", "🦴 Código Médula"], ["codigo_hemostasis", "🔴 Código Hemostasis"]].map(([v, l]) => (
                        <div key={v} onClick={() => { setCtx({ ...ctx, priority: v }); setShowCodeDrop(false); }} style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: ctx.priority === v ? 600 : 400, background: ctx.priority === v ? P.ictusBg : "transparent", color: ctx.priority === v ? "#ef4444" : P.text2 }}>{l}</div>
                      ))}
                    </div>}
                  </div>
                </div></div>
              <div style={S.fg}><label style={S.lb}>Motivo de petición</label><textarea placeholder="Justificación clínica..." value={ctx.reason} onChange={e => setCtx({ ...ctx, reason: e.target.value })} onPaste={async (e) => {
                const files = readImagesFromPaste(e);
                if (!files.length) return;
                e.preventDefault();
                await appendPastedImagesToCtx("reasonImages", files);
              }} onFocus={() => setFf("re")} onBlur={() => setFf("")} style={{ ...S.taf(ff === "re", 84), minHeight: 84 }} /></div>
              {!!ctx.reasonImages?.length && <div style={{ marginTop: -8, marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>{ctx.reasonImages.map((img, idx) => <div key={`re_img_${idx}`} style={{ position: "relative" }}><img src={img} alt={`Imagen motivo ${idx + 1}`} style={{ width: 78, height: 78, objectFit: "cover", borderRadius: 8, border: "1px solid " + P.goldBorder }} /><button onClick={() => removeCtxImage("reasonImages", idx)} style={{ position: "absolute", top: -6, right: -6, borderRadius: 999, border: "none", width: 18, height: 18, background: P.errorText, color: "#fff", fontSize: 11, lineHeight: 1, cursor: "pointer" }}>✕</button></div>)}</div>}
              <CollapsibleSection title="Antecedentes clínicos" isOpen={showClinicalHistory} onToggle={() => setShowClinicalHistory(v => !v)} P={P}>
                <MultiEntryGroup entries={ctx.clinicalHistory} onChange={v => setCtx({ ...ctx, clinicalHistory: v })} label="Antecedentes clínicos" singularLabel="Antecedente" placeholder="Patologías, cirugías, tratamientos..." P={P} ff={ff} setFf={setFf} fieldKey="hi" />
              </CollapsibleSection>
              <CollapsibleSection title="Informes radiológicos previos" isOpen={showPriorRadiology} onToggle={() => setShowPriorRadiology(v => !v)} P={P}>
                <MultiEntryGroup entries={ctx.priorRadiology} onChange={v => setCtx({ ...ctx, priorRadiology: v })} label="Informes radiológicos previos" singularLabel="Informe radiológico" placeholder="Pegar informe anterior..." P={P} ff={ff} setFf={setFf} fieldKey="ra" bigH={220} />
              </CollapsibleSection>
              <CollapsibleSection title="Informes clínicos" isOpen={showClinicalReports} onToggle={() => setShowClinicalReports(v => !v)} P={P}>
                <MultiEntryGroup entries={ctx.clinicalReports} onChange={v => setCtx({ ...ctx, clinicalReports: v })} label="Informes clínicos" singularLabel="Informe clínico" placeholder="Altas, consultas, analíticas..." P={P} ff={ff} setFf={setFf} fieldKey="cl" bigH={220} />
              </CollapsibleSection>
            </div>
          ) : lTab === "findings" ? (
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
            </div>
          )}
        </div>

        <div
          style={S.divider}
          onMouseDown={(e) => { if (e.target.closest("[data-collapse]")) return; if (!lpCollapsed) { dragging.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; } }}
          onTouchStart={(e) => { if (e.target.closest("[data-collapse]")) return; if (!lpCollapsed) { dragging.current = true; document.body.style.userSelect = "none"; } }}
          onMouseEnter={e => { const line = e.currentTarget.querySelector("[data-divline]"); if (line && !lpCollapsed) { line.style.width = "4px"; line.style.background = P.gold; } }}
          onMouseLeave={e => { const line = e.currentTarget.querySelector("[data-divline]"); if (line && !dragging.current && !lpCollapsed) { line.style.width = "2px"; line.style.background = P.goldBorder; } }}
        >
          {!lpCollapsed && <div data-divline="" style={S.dividerLine} />}
          <button
            data-collapse=""
            onClick={() => {
              if (lpCollapsed) { setLpCollapsed(false); setLpWidth(lpWidthBeforeCollapse.current); }
              else { lpWidthBeforeCollapse.current = lpWidth; setLpCollapsed(true); }
            }}
            style={S.collapseBtn}
            title={lpCollapsed ? "Expandir panel izquierdo" : "Colapsar panel izquierdo"}
          >{lpCollapsed ? "\u25B6" : "\u25C0"}</button>
        </div>

        <div style={S.rp}>
          <div style={{ display: "flex", alignItems: "stretch", minWidth: 0 }}>
            <button onClick={() => scrollRightTabs(-220)} style={S.tabNavBtn} title="Ver pestañas anteriores">◀</button>
            <div
              data-tabbar=""
              ref={rightTabbarRef}
              style={{
                ...S.tb,
                borderBottom: "none",
                flex: 1,
                overflowX: "hidden",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {rightTabsConfig.map(t => (
                <Tab
                  key={t.key}
                  active={rTab === t.key}
                  icon={t.icon}
                  label={t.label}
                  status={tabStatus[t.key] === "unread" ? "unread" : tabStatus[t.key] === "read" ? "read" : null}
                  onClick={() => openRightTab(t.key)}
                  onRun={t.run}
                  canRun={t.canRun}
                  isRunning={t.loading}
                  P={P}
                  compact={isMobile}
                />
              ))}
            </div>
            <button onClick={() => scrollRightTabs(220)} style={S.tabNavBtn} title="Ver pestañas siguientes">▶</button>
          </div>

          {rTab === "clinicalContext" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.chatHeader, borderColor: P.chatHeaderBorder }}>
              <span style={{ ...S.rt, color: P.chatTitleColor }}>Contexto clínico</span>
              {!!clinicalContextData.hasAny && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={genClinicalRecommendations}
                  disabled={ldClinicalRecommendations || !(clinicalContextDraft.trim() || clinicalContextData.structuredText)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: ldClinicalRecommendations ? "wait" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}
                >
                  {ldClinicalRecommendations ? "⏳ Recomendando..." : "🧭 Recomendaciones"}
                </button>
                <button
                  onClick={polishClinicalContext}
                  disabled={ldClinicalPolish || !clinicalContextDraft.trim()}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: ldClinicalPolish ? "wait" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: ldClinicalPolish ? (isDark ? "#333" : "#ccc") : "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff" }}
                >
                  {ldClinicalPolish ? "⏳ Procesando..." : "✨ Corregir con IA"}
                </button>
                <button
                  onClick={cpClinicalContext}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: copied === "clinical" ? "#22c55e" : P.chatSendBg, color: "#fff" }}
                >
                  {copied === "clinical" ? "✓ Copiado" : "📋 Copiar y pegar"}
                </button>
              </div>}
            </div>
            <div style={{ ...S.rc, background: P.chatPanelBg }}>
              {clinicalContextData.hasAny
                ? <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ padding: "14px 16px", background: P.inputBgFocus, border: "1px solid " + P.chatInputBorderFocus, borderRadius: 10 }}>
                      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: P.chatTitleColor }}>Contexto clínico (editable)</div>
                      <textarea
                        value={clinicalContextDraft}
                        onChange={(e) => setClinicalContextDraft(e.target.value)}
                        style={{ width: "100%", minHeight: 220, resize: "vertical", borderRadius: 8, border: "1px solid " + P.chatInputBorder, background: P.chatInputBg, color: P.chatInputColor, padding: "10px 12px", fontFamily: "inherit", fontSize: 14, lineHeight: 1.5, outline: "none" }}
                      />
                    </div>
                    <div style={{ padding: "14px 16px", background: P.recoPanelBg, border: "1px solid " + P.recoPanelBorder, borderRadius: 10 }}>
                      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: P.recoTitleColor }}>Recomendaciones para este caso</div>
                      <div style={{ whiteSpace: "pre-wrap", color: P.text }}>{clinicalRecommendations || "Genera recomendaciones para ver un listado breve de hallazgos clave a buscar según este contexto clínico."}</div>
                    </div>
                    <div style={{ padding: "14px 16px", background: P.inputBg, border: "1px solid " + P.inputBorder, borderRadius: 10 }}>
                      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: P.text2 }}>Motivo de petición original (sin procesar)</div>
                      <div style={{ whiteSpace: "pre-wrap", color: P.text }}>{clinicalContextData.originalRequestText || "Sin motivo de petición pegado todavía."}</div>
                    </div>
                  </div>
                : <div style={S.ph}><div style={S.phI}>🩺</div><div style={{ ...S.phT, color: P.chatTitleColor }}>Contexto clínico pendiente</div><div style={S.phD}>Cuando aportes datos del paciente, aquí verás un resumen estructurado editable y el motivo de petición original.</div></div>}
            </div>
          </div>}

          {rTab === "report" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={S.rh}><span style={S.rt}>Informe</span>{report && <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {isEditingReport ? (
                <>
                  <button onClick={saveEditedReport} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff" }}>💾 Guardar</button>
                  <button onClick={cancelEditReport} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: "transparent", color: P.text2 }}>↩️ Cancelar</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => adjustReport("essential")}
                    disabled={ldReportAdjust || ldReport}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + P.goldBorder, cursor: ldReportAdjust || ldReport ? "wait" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: P.goldBg, color: P.gold }}
                    title="Quita texto de relleno y deja solo lo clave"
                  >
                    {ldReportAdjust ? "⏳ Ajustando..." : "✂️ Dejar lo esencial"}
                  </button>
                  <button
                    onClick={() => adjustReport("enhance")}
                    disabled={ldReportAdjust || ldReport}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: ldReportAdjust || ldReport ? "wait" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff" }}
                    title="Añade normalidad estructurada y más detalle profesional"
                  >
                    {ldReportAdjust ? "⏳ Ajustando..." : "🧩 Añadir detalles"}
                  </button>
                  <button onClick={startEditReport} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: P.goldBg, color: P.gold }}>✏️ Editar</button>
                </>
              )}
              <button onClick={cpText} style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: copied === "t" ? "#22c55e" : "linear-gradient(135deg,#c4973c,#a07830)", color: "#fff", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{copied === "t" ? "✓ Copiado" : "📋 Copiar Informe"}</button>
              <button onClick={exportCaseAsMarkdown} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: P.goldBg, color: P.gold }}>⬇️ Markdown</button>
              <button onClick={exportCaseAsPdf} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + P.goldBorder, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: P.goldBgActive, color: P.gold }}>⬇️ PDF</button>
            </div>}</div>
            <div className="rpt-content" style={S.rc}><style>{`
.rpt-content [style*="border-top:1px solid #eee"],.rpt-content [style*="border-top:2px solid #888"]{border-top-color:transparent!important}
.rpt-content [style*="border-bottom:1px solid #ccc"]{border-bottom-color:transparent!important}
.rpt-content p{margin-top:0.35em!important;margin-bottom:0.55em!important}
${isDark ? `.rpt-content p[style*="color:#222"],.rpt-content p[style*="color:#333"]{color:inherit!important}
.rpt-content p[style*="color:#555"],.rpt-content p[style*="color:#666"]{color:${P.text3}!important}
.rpt-content p[style*="color:#444"]{color:${P.text2}!important}
.rpt-content span[style*="color:#444"]{color:#aaa!important}` : ''}
`}</style>{report ? (isEditingReport ? <div>
                <div style={{ fontSize: 12, marginBottom: 10, color: P.text3 }}>Modo edición: modifica el contenido directamente manteniendo colores y formato.</div>
                <div
                  ref={reportEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setEditedReport(e.currentTarget.innerHTML)}
                  style={{ border: "1px dashed " + P.goldBorderFocus, borderRadius: 10, padding: isMobile ? 10 : 14, background: P.inputBgFocus, minHeight: 240, outline: "none" }}
                  dangerouslySetInnerHTML={{ __html: editedReport }}
                />
              </div> : <div dangerouslySetInnerHTML={{ __html: report }} />) : <div style={S.ph}><div style={S.phI}>📄</div><div style={S.phT}>El informe aparecerá aquí</div><div style={S.phD}>Dicta hallazgos en "Qué vemos".</div></div>}</div>
            {report && <div style={S.lg}>{[["#CC0000", "Grave"], ["#D2691E", "Leve"], ["#2E8B57", "Normal vinculado"], [isDark ? "#aaa" : "#444", "Relleno"]].map(([c, l]) => <div key={c} style={S.li}><div style={S.ld(c)} /><span>{l}</span></div>)}</div>}
          </div>}

          {rTab === "analysis" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.analysisHeader, borderColor: P.analysisHeaderBorder }}><span style={{ ...S.rt, color: P.analysisTitleColor }}>Análisis del caso</span>{analysis && <button onClick={genAnalysis} disabled={ldAnalysis} style={{ ...S.cb("s"), color: P.analysisTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.analysisBg }}>{ldAnalysis ? <div style={S.ph}><LoadingDots text="Analizando..." /></div> : analysis ? <div dangerouslySetInnerHTML={{ __html: analysis }} /> : <div style={S.ph}><div style={S.phI}>🔍</div><div style={{ ...S.phT, color: P.analysisTitleColor }}>Análisis bajo demanda</div><div style={S.phD}>{report ? "Genera diferencial, escalas y recomendaciones." : "Genera primero un informe."}</div>{report && <button onClick={genAnalysis} style={S.aBtn}>🔍 Analizar caso</button>}</div>}</div>
          </div>}

          {rTab === "keyIdeas" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.keyIdeasHeader, borderColor: P.keyIdeasHeaderBorder }}><span style={{ ...S.rt, color: P.keyIdeasTitleColor }}>Ideas Clave</span>{keyIdeas && <button onClick={genKeyIdeas} disabled={ldKeyIdeas} style={{ ...S.cb("s"), color: P.keyIdeasTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.keyIdeasBg }}>{ldKeyIdeas ? <div style={S.ph}><LoadingDots text="Extrayendo ideas clave..." /></div> : keyIdeas ? <div dangerouslySetInnerHTML={{ __html: keyIdeas }} /> : <div style={S.ph}><div style={S.phI}>💡</div><div style={{ ...S.phT, color: P.keyIdeasTitleColor }}>Ideas clave bajo demanda</div><div style={S.phD}>{report ? "Genera un resumen de 10 ideas clave que llevarte de este caso." : "Genera primero un informe."}</div>{report && <button onClick={genKeyIdeas} style={{ ...S.aBtn, background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>💡 Generar Ideas Clave</button>}</div>}</div>
          </div>}

          {rTab === "justification" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.justifHeader, borderColor: P.justifHeaderBorder }}><span style={{ ...S.rt, color: P.justifTitleColor }}>¿Justificada?</span>{justification && <button onClick={genJustification} disabled={ldJustification} style={{ ...S.cb("s"), color: P.justifTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.justifBg }}>{ldJustification ? <div style={S.ph}><LoadingDots text="Analizando justificación..." /></div> : justification ? <div dangerouslySetInnerHTML={{ __html: justification }} /> : <div style={S.ph}><div style={S.phI}>❓</div><div style={{ ...S.phT, color: P.justifTitleColor }}>Justificación bajo demanda</div><div style={S.phD}>{clinicalContextData.hasAny ? "Analiza la adecuación de la prueba con lo que ya sabemos. No hace falta esperar al informe." : "Completa antes la pestaña 'Qué sabemos'."}</div>{clinicalContextData.hasAny && <button onClick={genJustification} style={{ ...S.aBtn, background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>❓ Analizar Justificación</button>}</div>}</div>
          </div>}

          {rTab === "diffDiag" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.diffDiagHeader, borderColor: P.diffDiagHeaderBorder }}><span style={{ ...S.rt, color: P.diffDiagTitleColor }}>Diagnóstico Diferencial</span>{diffDiag && <button onClick={genDiffDiag} disabled={ldDiffDiag} style={{ ...S.cb("s"), color: P.diffDiagTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.diffDiagBg }}>{ldDiffDiag ? <div style={S.ph}><LoadingDots text="Generando diferencial..." /></div> : diffDiag ? <div dangerouslySetInnerHTML={{ __html: diffDiag }} /> : <div style={S.ph}><div style={S.phI}>🚦</div><div style={{ ...S.phT, color: P.diffDiagTitleColor }}>Diferencial bajo demanda</div><div style={S.phD}>{report ? "Diagnóstico diferencial con código semáforo de probabilidades." : "Genera primero un informe."}</div>{report && <button onClick={genDiffDiag} style={{ ...S.aBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>🚦 Generar Diferencial</button>}</div>}</div>
            {diffDiag && <div style={{ ...S.lg, borderColor: P.diffDiagHeaderBorder }}>{[["#dc2626", "Más probable"], ["#ea580c", "Probable"], ["#ca8a04", "Menos probable"], ["#16a34a", "Descartado"]].map(([c, l]) => <div key={c} style={S.li}><div style={S.ld(c)} /><span>{l}</span></div>)}</div>}
          </div>}

          {rTab === "mindMap" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.mindMapHeader, borderColor: P.mindMapHeaderBorder }}><span style={{ ...S.rt, color: P.mindMapTitleColor }}>Mapa Mental</span>{mindMap && <button onClick={genMindMap} disabled={ldMindMap} style={{ ...S.cb("s"), color: P.mindMapTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.mindMapBg }}>{ldMindMap ? <div style={S.ph}><LoadingDots text="Generando mapa mental..." /></div> : mindMap ? <div dangerouslySetInnerHTML={{ __html: mindMap }} /> : <div style={S.ph}><div style={S.phI}>🧠</div><div style={{ ...S.phT, color: P.mindMapTitleColor }}>Mapa mental bajo demanda</div><div style={S.phD}>{report ? "Genera un mapa mental visual que organiza toda la información del caso de forma jerárquica." : "Genera primero un informe."}</div>{report && <button onClick={genMindMap} style={{ ...S.aBtn, background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>🧠 Generar Mapa Mental</button>}</div>}</div>
          </div>}

        </div>
      </div>
    </div>
  );
}
