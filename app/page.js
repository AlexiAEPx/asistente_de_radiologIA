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
  inputBg: "rgba(255,255,255,0.04)", inputBgFocus: "rgba(255,255,255,0.07)", inputBorder: "rgba(196,151,60,0.2)",
  bubbleUser: "linear-gradient(135deg,#c4973c,#a07830)", bubbleAsst: "rgba(255,255,255,0.06)", bubbleAsstBorder: "rgba(255,255,255,0.08)",
  reportBg: "linear-gradient(180deg,#1e1e2a,#1a1a28)", reportHeader: "#161622", reportHeaderBorder: "rgba(196,151,60,0.15)", reportTitleColor: "#c4973c",
  legendBg: "#161622", legendBorder: "rgba(196,151,60,0.15)",
  analysisBg: "linear-gradient(180deg,#141428,#12122a)", analysisHeader: "#161630", analysisHeaderBorder: "rgba(99,102,241,0.2)", analysisTitleColor: "#818cf8",
  chatPanelBg: "linear-gradient(180deg,#0e1a14,#0e1818)", chatHeader: "#0f1f16", chatHeaderBorder: "rgba(34,197,94,0.2)", chatTitleColor: "#4ade80",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.08)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#ccc",
  chatInputBg: "rgba(255,255,255,0.04)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#e0ddd5",
  chatInputAreaBg: "#0f1f16", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  keyIdeasBg: "linear-gradient(180deg,#1a1520,#181422)", keyIdeasHeader: "#1c1628", keyIdeasHeaderBorder: "rgba(217,119,6,0.2)", keyIdeasTitleColor: "#fbbf24",
  justifBg: "linear-gradient(180deg,#1a1424,#18122a)", justifHeader: "#1e1630", justifHeaderBorder: "rgba(168,85,247,0.2)", justifTitleColor: "#c084fc",
  diffDiagBg: "linear-gradient(180deg,#141a1e,#121820)", diffDiagHeader: "#161e24", diffDiagHeaderBorder: "rgba(239,68,68,0.2)", diffDiagTitleColor: "#f87171",
  dropdownBg: "#1a1a2e", dropdownShadow: "0 8px 24px rgba(0,0,0,0.5)",
  errorBg: "rgba(204,0,0,0.1)", errorBorder: "rgba(204,0,0,0.2)", errorText: "#ff6b6b",
  urgentBg: "rgba(220,38,38,0.15)", ictusBg: "rgba(220,38,38,0.25)",
} : {
  bg: "#f5f3ef", bg2: "#faf8f5", bg3: "#fafaf8",
  text: "#1a1a1a", text2: "#555", text3: "#888", text4: "#aaa",
  gold: "#96722a", goldDim: "rgba(150,114,42,0.5)", goldBorder: "rgba(150,114,42,0.2)", goldBg: "rgba(150,114,42,0.06)", goldBgActive: "rgba(150,114,42,0.12)", goldBorderFocus: "rgba(150,114,42,0.45)",
  inputBg: "#f7f5f0", inputBgFocus: "#faf7f0", inputBorder: "rgba(150,114,42,0.25)",
  bubbleUser: "linear-gradient(135deg,#96722a,#7a5c1f)", bubbleAsst: "#f0ece4", bubbleAsstBorder: "#e0dbd0",
  reportBg: "linear-gradient(180deg,#fdfbf7,#f9f6f0)", reportHeader: "#f5f1ea", reportHeaderBorder: "#e8e4dc", reportTitleColor: "#8a7a60",
  legendBg: "#f5f1ea", legendBorder: "#e8e4dc",
  analysisBg: "linear-gradient(180deg,#fafbff,#f5f7ff)", analysisHeader: "#eef2ff", analysisHeaderBorder: "#c7d2fe", analysisTitleColor: "#4338ca",
  chatPanelBg: "linear-gradient(180deg,#fafdfb,#f5faf6)", chatHeader: "#f0fdf4", chatHeaderBorder: "#bbf7d0", chatTitleColor: "#166534",
  chatBubbleUser: "linear-gradient(135deg,#22c55e,#16a34a)", chatBubbleAsst: "rgba(34,197,94,0.06)", chatBubbleAsstBorder: "rgba(34,197,94,0.15)", chatBubbleText: "#555",
  chatInputBg: "rgba(255,255,255,0.8)", chatInputBorder: "rgba(34,197,94,0.3)", chatInputBorderFocus: "rgba(34,197,94,0.5)", chatInputColor: "#333",
  chatInputAreaBg: "#f0fdf4", chatSendBg: "linear-gradient(135deg,#22c55e,#16a34a)",
  keyIdeasBg: "linear-gradient(180deg,#fffbf5,#fef7ed)", keyIdeasHeader: "#fef3e2", keyIdeasHeaderBorder: "#fde68a", keyIdeasTitleColor: "#92400e",
  justifBg: "linear-gradient(180deg,#fdf8ff,#f5f0ff)", justifHeader: "#f3e8ff", justifHeaderBorder: "#d8b4fe", justifTitleColor: "#6b21a8",
  diffDiagBg: "linear-gradient(180deg,#fef9f9,#fdf5f5)", diffDiagHeader: "#fef2f2", diffDiagHeaderBorder: "#fecaca", diffDiagTitleColor: "#991b1b",
  dropdownBg: "#faf8f5", dropdownShadow: "0 8px 24px rgba(0,0,0,0.12)",
  errorBg: "rgba(204,0,0,0.06)", errorBorder: "rgba(204,0,0,0.15)", errorText: "#cc0000",
  urgentBg: "rgba(220,38,38,0.08)", ictusBg: "rgba(220,38,38,0.12)",
};

const CORRECTIONS = `"sin defectos de reflexión"→"sin defectos de repleción"|"angiotomografía"→"AngioTC"|"quiste de tallo"→"quiste de Tarlov"|"protusiones discotróficas"→"protusiones disco-osteofitarias"|"lobo"→"lóbulo"|"baso"/"vaso"(abdominal)→"bazo"|"células mastoideas"→"celdillas mastoideas"|"L2-S1"→"L5-S1"|"ángulo de Kopp"→"ángulo de Cobb"|"ECografía"→"ecografía"|"edema opaco"→"enema opaco"|"TAG"→"TAC"|"perifysural"→"perifisural"|"alopatia"→"adenopatía"|"Dickson"→"DIXON"|"vaso accesorio"→"bazo accesorio"|"FLIR"→"FLAIR"|"eco-degradiente"→"eco de gradiente"|"reflexión"(digestivo)→"repleción"|"Mattera"→"masetero"`;

const joinEntries = (arr) => {
  if (!Array.isArray(arr)) return arr || "";
  const items = arr.filter(e => e.text && e.text.trim());
  if (!items.length) return "";
  if (items.length === 1) return items[0].text.trim();
  return items.map((e, i) => `[${i + 1}] ${e.text.trim()}`).join("\n\n");
};

const buildCtxBlock = (c) => {
  const p = [];
  if (c.freeText) p.push("Información clínica general (sin clasificar):\n" + c.freeText);
  if (c.age) p.push("Edad: " + c.age + " años");
  if (c.gender) p.push("Género: " + c.gender);
  if (c.studyRequested) p.push("Estudio solicitado: " + c.studyRequested);
  if (c.priority && c.priority !== "programado") p.push("Prioridad: " + c.priority.toUpperCase());
  if (c.reason) p.push("Motivo: " + c.reason);
  const ch = joinEntries(c.clinicalHistory);
  if (ch) p.push("Antecedentes:\n" + ch);
  const pr = joinEntries(c.priorRadiology);
  if (pr) p.push("Informes radiológicos previos:\n" + pr);
  const cr = joinEntries(c.clinicalReports);
  if (cr) p.push("Informes clínicos:\n" + cr);
  return p.length ? "\n\n## CONTEXTO CLÍNICO\n" + p.join("\n\n") : "";
};

const REPORT_SYS = (c, isDark) => `Eres "Asistente de Radiología", asistente de informes radiológicos profesionales en español.
${buildCtxBlock(c)}

## COLORES (OBLIGATORIO en cada fragmento)
- Patológico importante: <span style="color:#CC0000;font-style:italic;font-weight:bold;">texto</span>
- Patológico leve: <span style="color:#D2691E;font-style:italic;">texto</span>
- Normal relevante: <span style="color:#2E8B57;">texto</span>
- Normal relleno: <span style="color:${isDark ? '#aaa' : '#444'};">texto</span>

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

const KEY_IDEAS_SYS = (c, report, analysis) => `Eres consultor experto en radiología diagnóstica. A partir del informe y análisis del caso, genera exactamente 10 ideas clave que un radiólogo debe llevarse de este caso. Genera HTML profesional con estilos inline.
${buildCtxBlock(c)}

## INFORME
${report}
${analysis ? "\n## ANÁLISIS\n" + analysis : ""}

## FORMATO HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.7;font-size:14px;color:#333;">
<p style="font-weight:bold;font-size:1.1em;color:#92400e;margin-bottom:12px;border-bottom:2px solid #fde68a;padding-bottom:8px;">💡 10 IDEAS CLAVE DEL CASO</p>
<div style="margin-bottom:10px;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;">
<p><strong style="color:#b45309;">1.</strong> [Idea clave concisa y práctica]</p>
</div>
... (repetir para las 10 ideas)
</div>

## REGLAS
- Exactamente 10 ideas, numeradas
- Cada idea: 1-2 frases concisas y de alto valor práctico
- Enfocadas en lo que el radiólogo debe recordar: hallazgos críticos, diagnóstico, seguimiento, errores a evitar, correlaciones clínico-radiológicas
- Ordenadas de mayor a menor relevancia clínica
- Incluir si aplica: diagnóstico principal, hallazgos incidentales, recomendaciones de seguimiento, signos radiológicos clave, diagnósticos diferenciales importantes, errores frecuentes a evitar
- Usar colores en el número: #CC0000 para ideas sobre patología grave, #d97706 para hallazgos moderados, #2E8B57 para normalidad relevante

SOLO HTML. Sin explicaciones adicionales.`;

const JUSTIFICATION_SYS = (c, report) => `Eres un experto en justificación de pruebas de imagen y radioprotección. Analiza si la prueba radiológica solicitada estaba clínicamente justificada según las guías de práctica clínica, criterios de adecuación y principios ALARA. Genera HTML profesional con estilos inline.
${buildCtxBlock(c)}

## INFORME RADIOLÓGICO
${report}

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
- Evalúa si los hallazgos encontrados respaldan la indicación
- Menciona dosis efectiva aproximada si aplica (mSv)

SOLO HTML. Sin explicaciones adicionales.`;

const DIFF_DIAG_SYS = (c, report, analysis) => `Eres consultor experto en radiología diagnóstica. Genera un diagnóstico diferencial exhaustivo para este caso usando un sistema de semáforo de probabilidades. Genera HTML profesional con estilos inline.
${buildCtxBlock(c)}

## INFORME
${report}
${analysis ? "\n## ANÁLISIS PREVIO\n" + analysis : ""}

## FORMATO HTML
<div style="font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;line-height:1.7;font-size:14px;color:#333;">
<p style="font-weight:bold;font-size:1.1em;color:#222;margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">🚦 DIAGNÓSTICO DIFERENCIAL</p>

<!-- Para cada diagnóstico, usar el color de semáforo correspondiente -->
<div style="margin:10px 0;padding:14px 16px;background:rgba(220,38,38,0.06);border-left:5px solid #dc2626;border-radius:0 8px 8px 0;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#dc2626;"></span>
<strong style="color:#dc2626;font-size:1.05em;">1. [Diagnóstico más probable] — [%]</strong>
</div>
<p style="margin:4px 0;"><strong>A favor:</strong> [argumentos]</p>
<p style="margin:4px 0;"><strong>En contra:</strong> [argumentos]</p>
<p style="margin:4px 0;"><strong>Dato clave:</strong> [signo o hallazgo determinante]</p>
</div>

<div style="margin:10px 0;padding:14px 16px;background:rgba(234,88,12,0.06);border-left:5px solid #ea580c;border-radius:0 8px 8px 0;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#ea580c;"></span>
<strong style="color:#ea580c;font-size:1.05em;">2. [Diagnóstico algo menos probable] — [%]</strong>
</div>
<p>...</p>
</div>

<div style="margin:10px 0;padding:14px 16px;background:rgba(202,138,4,0.06);border-left:5px solid #ca8a04;border-radius:0 8px 8px 0;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#ca8a04;"></span>
<strong style="color:#ca8a04;font-size:1.05em;">3. [Diagnóstico menos probable] — [%]</strong>
</div>
<p>...</p>
</div>

<div style="margin:10px 0;padding:14px 16px;background:rgba(22,163,74,0.06);border-left:5px solid #16a34a;border-radius:0 8px 8px 0;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#16a34a;"></span>
<strong style="color:#16a34a;font-size:1.05em;">4. [Prácticamente descartado] — [%]</strong>
</div>
<p>...</p>
</div>

<div style="margin-top:1.5em;padding:16px;background:#fafafa;border-radius:8px;border:1px solid #e5e7eb;">
<p style="font-weight:bold;color:#222;margin-bottom:8px;">🎯 RESUMEN</p>
<p>[Diagnóstico principal y conducta recomendada]</p>
</div>
</div>

## CÓDIGO DE SEMÁFORO (OBLIGATORIO)
- 🔴 ROJO (#dc2626): Más probable (>50% o diagnóstico principal)
- 🟠 NARANJA (#ea580c): Algo menos probable (20-50%)
- 🟡 AMARILLO (#ca8a04): Menos probable aún (5-20%)
- 🟢 VERDE (#16a34a): Prácticamente descartado (<5%)

## REGLAS
- Mínimo 4 diagnósticos, máximo 8
- Cada diagnóstico con: argumentos a favor, en contra, dato clave
- Las probabilidades deben sumar ~100%
- Ordenar de mayor a menor probabilidad
- El color del borde izquierdo y del texto DEBE corresponder al semáforo
- Incluir diagnósticos "can't miss" aunque sean poco probables
- Para cada diagnóstico incluir qué prueba confirmaría/descartaría

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

function MultiEntryGroup({ entries, onChange, label, singularLabel, placeholder, P, ff, setFf, fieldKey, bigH }) {
  const updateText = (idx, text) => {
    onChange(entries.map((e, i) => i === idx ? { ...e, text } : e));
  };
  const toggleCollapse = (idx) => {
    onChange(entries.map((e, i) => i === idx ? { ...e, collapsed: !e.collapsed } : e));
  };
  const removeEntry = (idx) => {
    if (entries.length <= 1) { onChange([{ text: "", collapsed: false }]); return; }
    onChange(entries.filter((_, i) => i !== idx));
  };
  const addEntry = () => {
    onChange([...entries.map(e => e.text.trim() ? { ...e, collapsed: true } : e), { text: "", collapsed: false }]);
  };

  const hasMultiple = entries.length > 1 || entries[0].text.trim();

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: P.text3, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </label>
      {entries.map((entry, idx) => {
        const itemKey = `${fieldKey}_${idx}`;
        const focused = ff === itemKey;
        const num = entries.length > 1 ? ` ${idx + 1}` : "";

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
                  {entries.length > 1 && (
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

export default function Page() {
  const emptyCtx = { age: "", gender: "", studyRequested: "", priority: "programado", reason: "", clinicalHistory: [{ text: "", collapsed: false }], priorRadiology: [{ text: "", collapsed: false }], clinicalReports: [{ text: "", collapsed: false }], freeText: "" };

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
  const [keyIdeas, setKeyIdeas] = useState("");
  const [ldKeyIdeas, setLdKeyIdeas] = useState(false);
  const [justification, setJustification] = useState("");
  const [ldJustification, setLdJustification] = useState(false);
  const [diffDiag, setDiffDiag] = useState("");
  const [ldDiffDiag, setLdDiffDiag] = useState(false);
  const [copied, setCopied] = useState("");
  const [err, setErr] = useState("");
  const [showMP, setShowMP] = useState(false);
  const [ff, setFf] = useState("");
  const [spending, setSpending] = useState({ totalCost: 0, inputTokens: 0, outputTokens: 0, calls: 0 });

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
    try { const h = clean(await callAPI(REPORT_SYS(ctx, isDark), nm)); setFMsgs(p => [...p, { role: "assistant", content: h }]); setReport(h); setCtxSnap(JSON.stringify(ctx)); }
    catch (e) { setErr("Error informe: " + e.message); } setLdReport(false);
  };
  const regenReport = async () => {
    if (!fMsgs.length || ldReport) return; setLdReport(true); setErr(""); setRTab("report");
    try { const h = clean(await callAPI(REPORT_SYS(ctx, isDark), fMsgs)); setReport(h); }
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
  const genKeyIdeas = async () => {
    if (!report || ldKeyIdeas) return; setLdKeyIdeas(true); setErr(""); setRTab("keyIdeas");
    try { setKeyIdeas(clean(await callAPI(KEY_IDEAS_SYS(ctx, report, analysis), [{ role: "user", content: "Genera las 10 ideas clave de este caso radiológico." }]))); }
    catch (e) { setErr("Error ideas clave: " + e.message); } setLdKeyIdeas(false);
  };
  const genJustification = async () => {
    if (!report || ldJustification) return; setLdJustification(true); setErr(""); setRTab("justification");
    try { setJustification(clean(await callAPI(JUSTIFICATION_SYS(ctx, report), [{ role: "user", content: "Analiza la justificación de esta prueba radiológica." }]))); }
    catch (e) { setErr("Error justificación: " + e.message); } setLdJustification(false);
  };
  const genDiffDiag = async () => {
    if (!report || ldDiffDiag) return; setLdDiffDiag(true); setErr(""); setRTab("diffDiag");
    try { setDiffDiag(clean(await callAPI(DIFF_DIAG_SYS(ctx, report, analysis), [{ role: "user", content: "Genera el diagnóstico diferencial con código semáforo para este caso." }]))); }
    catch (e) { setErr("Error diagnóstico diferencial: " + e.message); } setLdDiffDiag(false);
  };

  const cpText = async () => { if (!report) return; const d = document.createElement("div"); d.innerHTML = report; await navigator.clipboard.writeText(d.innerText || d.textContent); setCopied("t"); setTimeout(() => setCopied(""), 2500); };
  const cpHtml = async () => { if (!report) return; try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([report], { type: "text/html" }), "text/plain": new Blob([report], { type: "text/plain" }) })]); } catch { await navigator.clipboard.writeText(report); } setCopied("h"); setTimeout(() => setCopied(""), 2500); };
  const clearAll = () => { setCtx(emptyCtx); setFMsgs([]); setCMsgs([]); setReport(""); setAnalysis(""); setKeyIdeas(""); setJustification(""); setDiffDiag(""); setFInput(""); setCInput(""); setErr(""); setCtxSnap(""); setLTab("context"); setRTab("report"); setSpending({ totalCost: 0, inputTokens: 0, outputTokens: 0, calls: 0 }); };
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
    sel: { width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid " + P.inputBorder, background: isDark ? P.inputBg : "#ece7db", color: P.text, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", cursor: "pointer" },
    selOpt: { background: isDark ? "#1a1a2e" : "#ece7db", color: P.text },
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
    rc: { flex: 1, overflowY: "auto", padding: "20px 24px", background: P.reportBg, color: P.text },
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
          {spending.calls > 0 && <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 12px",
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
              <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 12, border: "1px dashed " + P.goldBorder, background: P.goldBg }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: P.gold, marginBottom: 2 }}>🍲 El Totum Revolutum</label>
                <span style={{ display: "block", fontSize: 11, color: P.text3, marginBottom: 8, lineHeight: 1.4 }}>No te compliques: pega aquí todo el churro (edad, informes, lo que sea) y nosotros nos apañamos</span>
                <textarea placeholder="Pega aquí todo lo que tengas: edad, sexo, antecedentes, informes previos, informes clínicos, motivo... todo revuelto, sin orden ni concierto." value={ctx.freeText} onChange={e => setCtx({ ...ctx, freeText: e.target.value })} onFocus={() => setFf("ft")} onBlur={() => setFf("")} style={{ ...S.taf(ff === "ft", 120), borderStyle: "dashed" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: P.goldBorder }} />
                <span style={{ fontSize: 10, color: P.text4, textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" }}>o si eres buen@ y quieres separar</span>
                <div style={{ flex: 1, height: 1, background: P.goldBorder }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ ...S.fg, flex: 1 }}><label style={S.lb}>Edad</label><input type="number" placeholder="—" value={ctx.age} onChange={e => setCtx({ ...ctx, age: e.target.value })} onFocus={() => setFf("ag")} onBlur={() => setFf("")} style={S.inp(ff === "ag")} /></div>
                <div style={{ ...S.fg, flex: 1 }}><label style={S.lb}>Género</label><select value={ctx.gender} onChange={e => setCtx({ ...ctx, gender: e.target.value })} style={S.sel}><option value="" style={S.selOpt}>—</option><option value="Hombre" style={S.selOpt}>Hombre</option><option value="Mujer" style={S.selOpt}>Mujer</option></select></div>
              </div>
              <div style={S.fg}><label style={S.lb}>Estudio solicitado</label><input type="text" placeholder="Ej: TC tórax con CIV, RM lumbar..." value={ctx.studyRequested} onChange={e => setCtx({ ...ctx, studyRequested: e.target.value })} onFocus={() => setFf("st")} onBlur={() => setFf("")} style={S.inp(ff === "st")} /></div>
              <div style={S.fg}><label style={S.lb}>Prioridad</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {[["programado", "Programado"], ["urgente", "🔴 Urgente"], ["codigo_ictus", "🚨 Código Ictus"]].map(([v, l]) => (<button key={v} onClick={() => setCtx({ ...ctx, priority: v })} style={S.chip(v, ctx.priority)}>{l}</button>))}
                </div></div>
              <div style={S.fg}><label style={S.lb}>Motivo de petición</label><input type="text" placeholder="Justificación clínica..." value={ctx.reason} onChange={e => setCtx({ ...ctx, reason: e.target.value })} onFocus={() => setFf("re")} onBlur={() => setFf("")} style={S.inp(ff === "re")} /></div>
              <MultiEntryGroup entries={ctx.clinicalHistory} onChange={v => setCtx({ ...ctx, clinicalHistory: v })} label="Antecedentes clínicos" singularLabel="Antecedente" placeholder="Patologías, cirugías, tratamientos..." P={P} ff={ff} setFf={setFf} fieldKey="hi" />
              <MultiEntryGroup entries={ctx.priorRadiology} onChange={v => setCtx({ ...ctx, priorRadiology: v })} label="Informes radiológicos previos" singularLabel="Informe radiológico" placeholder="Pegar informe anterior..." P={P} ff={ff} setFf={setFf} fieldKey="ra" bigH={220} />
              <MultiEntryGroup entries={ctx.clinicalReports} onChange={v => setCtx({ ...ctx, clinicalReports: v })} label="Informes clínicos" singularLabel="Informe clínico" placeholder="Altas, consultas, analíticas..." P={P} ff={ff} setFf={setFf} fieldKey="cl" bigH={220} />
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
            <Tab active={rTab === "keyIdeas"} icon="💡" label="Ideas Clave" badge={!!keyIdeas && rTab !== "keyIdeas"} onClick={() => setRTab("keyIdeas")} P={P} />
            <Tab active={rTab === "justification"} icon="❓" label="¿Justificada?" badge={!!justification && rTab !== "justification"} onClick={() => setRTab("justification")} P={P} />
            <Tab active={rTab === "diffDiag"} icon="🚦" label="Diferencial" badge={!!diffDiag && rTab !== "diffDiag"} onClick={() => setRTab("diffDiag")} P={P} />
          </div>

          {rTab === "report" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={S.rh}><span style={S.rt}>Informe</span>{report && <button onClick={cpText} style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: copied === "t" ? "#22c55e" : "linear-gradient(135deg,#c4973c,#a07830)", color: "#fff", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{copied === "t" ? "✓ Copiado" : "📋 Copiar Informe"}</button>}</div>
            <div className="rpt-content" style={S.rc}><style>{`
.rpt-content [style*="border-top:1px solid #eee"],.rpt-content [style*="border-top:2px solid #888"]{border-top-color:transparent!important}
.rpt-content [style*="border-bottom:1px solid #ccc"]{border-bottom-color:transparent!important}
${isDark ? `.rpt-content p[style*="color:#222"],.rpt-content p[style*="color:#333"]{color:inherit!important}
.rpt-content p[style*="color:#555"],.rpt-content p[style*="color:#666"]{color:${P.text3}!important}
.rpt-content p[style*="color:#444"]{color:${P.text2}!important}
.rpt-content span[style*="color:#444"]{color:#aaa!important}` : ''}
`}</style>{report ? <div dangerouslySetInnerHTML={{ __html: report }} /> : <div style={S.ph}><div style={S.phI}>📄</div><div style={S.phT}>El informe aparecerá aquí</div><div style={S.phD}>Dicta hallazgos en "Qué vemos".</div></div>}</div>
            {report && <div style={S.lg}>{[["#CC0000", "Grave"], ["#D2691E", "Leve"], ["#2E8B57", "Normal rel."], [isDark ? "#aaa" : "#444", "Normal"]].map(([c, l]) => <div key={c} style={S.li}><div style={S.ld(c)} /><span>{l}</span></div>)}</div>}
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

          {rTab === "keyIdeas" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.keyIdeasHeader, borderColor: P.keyIdeasHeaderBorder }}><span style={{ ...S.rt, color: P.keyIdeasTitleColor }}>Ideas Clave</span>{keyIdeas && <button onClick={genKeyIdeas} disabled={ldKeyIdeas} style={{ ...S.cb("s"), color: P.keyIdeasTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.keyIdeasBg }}>{ldKeyIdeas ? <div style={S.ph}><LoadingDots text="Extrayendo ideas clave..." /></div> : keyIdeas ? <div dangerouslySetInnerHTML={{ __html: keyIdeas }} /> : <div style={S.ph}><div style={S.phI}>💡</div><div style={{ ...S.phT, color: P.keyIdeasTitleColor }}>Ideas clave bajo demanda</div><div style={S.phD}>{report ? "Genera un resumen de 10 ideas clave que llevarte de este caso." : "Genera primero un informe."}</div>{report && <button onClick={genKeyIdeas} style={{ ...S.aBtn, background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>💡 Generar Ideas Clave</button>}</div>}</div>
          </div>}

          {rTab === "justification" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.justifHeader, borderColor: P.justifHeaderBorder }}><span style={{ ...S.rt, color: P.justifTitleColor }}>¿Justificada?</span>{justification && <button onClick={genJustification} disabled={ldJustification} style={{ ...S.cb("s"), color: P.justifTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.justifBg }}>{ldJustification ? <div style={S.ph}><LoadingDots text="Analizando justificación..." /></div> : justification ? <div dangerouslySetInnerHTML={{ __html: justification }} /> : <div style={S.ph}><div style={S.phI}>❓</div><div style={{ ...S.phT, color: P.justifTitleColor }}>Justificación bajo demanda</div><div style={S.phD}>{report ? "Analiza si esta prueba radiológica estaba clínicamente justificada." : "Genera primero un informe."}</div>{report && <button onClick={genJustification} style={{ ...S.aBtn, background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>❓ Analizar Justificación</button>}</div>}</div>
          </div>}

          {rTab === "diffDiag" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ ...S.rh, background: P.diffDiagHeader, borderColor: P.diffDiagHeaderBorder }}><span style={{ ...S.rt, color: P.diffDiagTitleColor }}>Diagnóstico Diferencial</span>{diffDiag && <button onClick={genDiffDiag} disabled={ldDiffDiag} style={{ ...S.cb("s"), color: P.diffDiagTitleColor }}>🔄 Regenerar</button>}</div>
            <div style={{ ...S.rc, background: P.diffDiagBg }}>{ldDiffDiag ? <div style={S.ph}><LoadingDots text="Generando diferencial..." /></div> : diffDiag ? <div dangerouslySetInnerHTML={{ __html: diffDiag }} /> : <div style={S.ph}><div style={S.phI}>🚦</div><div style={{ ...S.phT, color: P.diffDiagTitleColor }}>Diferencial bajo demanda</div><div style={S.phD}>{report ? "Diagnóstico diferencial con código semáforo de probabilidades." : "Genera primero un informe."}</div>{report && <button onClick={genDiffDiag} style={{ ...S.aBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>🚦 Generar Diferencial</button>}</div>}</div>
            {diffDiag && <div style={{ ...S.lg, borderColor: P.diffDiagHeaderBorder }}>{[["#dc2626", "Más probable"], ["#ea580c", "Probable"], ["#ca8a04", "Menos probable"], ["#16a34a", "Descartado"]].map(([c, l]) => <div key={c} style={S.li}><div style={S.ld(c)} /><span>{l}</span></div>)}</div>}
          </div>}
        </div>
      </div>
    </div>
  );
}
