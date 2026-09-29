// Genera portal_web/*.html desde el snapshot revisado del informe.
// Uso: node scripts/build_portal_web.mjs
// - Fuente de datos: informe_analitica_2026_2_p1/src/data.json
// - Normaliza nombres de programas y cursos: inicial en mayúscula, resto en minúscula, con tildes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "informe_analitica_2026_2_p1", "src", "data.json");
const out = path.join(root, "portal_web");

// Palabras (en mayúsculas sin tilde) con su forma correcta en minúscula.
const ACC = {
  ACADEMICOS: "académicos", ADMINISTRACION: "administración", AGROECOLOGIA: "agroecología",
  AGROSTOLOGIA: "agrostología", ALGEBRA: "álgebra", ANALISIS: "análisis", ANATOMIA: "anatomía",
  ANIMACION: "animación", ANTROPOLOGIA: "antropología", ARGUMENTACION: "argumentación",
  BACTERIOLOGIA: "bacteriología", BASICAS: "básicas", BIOFISICA: "biofísica", BIOLOGIA: "biología",
  BIOMECANICA: "biomecánica", BIOQUIMICA: "bioquímica", BIOTECNOLOGIA: "biotecnología",
  CALCULO: "cálculo", CIRUGIA: "cirugía", CLINICA: "clínica", CLINICO: "clínico",
  COMPUTACION: "computación", COMUNICACION: "comunicación", CONTADURIA: "contaduría",
  CORRELACION: "correlación", DIAGNOSTICAS: "diagnósticas", DIALOGO: "diálogo", DISENO: "diseño",
  EDUCACION: "educación", ELECTRICA: "eléctrica", EMBRIOLOGIA: "embriología", ENDOSCOPIA: "endoscopía",
  ENERGIAS: "energías", ENFERMERIA: "enfermería", ESTADISTICA: "estadística",
  ESTRUCTURACION: "estructuración", ETICA: "ética", EXITO: "éxito", FARMACOLOGIA: "farmacología",
  FISICA: "física", FONOAUDIOLOGIA: "fonoaudiología", FOTOVOLTAICOS: "fotovoltaicos",
  GENETICA: "genética", GEOLOGIA: "geología", GESTION: "gestión", GINECOLOGIA: "ginecología",
  GRAFICA: "gráfica", GRAFICO: "gráfico", HISTOEMBRIOLOGIA: "histoembriología", HISTOLOGIA: "histología",
  IMAGENES: "imágenes", IMAGENOLOGIA: "imagenología", INFOGRAFIAS: "infografías",
  INFORMATICA: "informática", INFORMATICAS: "informáticas", INFORMATICOS: "informáticos",
  INGENIERIA: "ingeniería", INGENIERIAS: "ingenierías", INGLES: "inglés", INMUNOLOGIA: "inmunología",
  INNOVACION: "innovación", INSTALACION: "instalación", INSTRUMENTACION: "instrumentación",
  INVESTIGACION: "investigación", JURIDICA: "jurídica", LOGICA: "lógica", LOGISTICA: "logística",
  MATEMATICAS: "matemáticas", MECANICA: "mecánica", METODOLOGIA: "metodología", METODOS: "métodos",
  MICROBIOLOGIA: "microbiología", MORFOFISIOLOGIA: "morfofisiología", MORFOLOGIA: "morfología",
  OPERACION: "operación", OPTIMIZACION: "optimización", PARASITOLOGIA: "parasitología",
  PATOKINESIOLOGIA: "patokinesiología", PEQUENOS: "pequeños", PERCEPCION: "percepción",
  PETROQUIMICA: "petroquímica", PSICOLOGIA: "psicología", PUBLICA: "pública", QUIMICA: "química",
  QUIRURGICA: "quirúrgica", QUIRURGICOS: "quirúrgicos", REPRODUCCION: "reproducción",
  SUPERVISION: "supervisión", TECNICO: "técnico", TECNOLOGIA: "tecnología",
  TERIOGENOLOGIA: "teriogenología", TOXICOLOGIA: "toxicología", TRIGONOMETRIA: "trigonometría",
  VIDEOCIRUGIA: "videocirugía", ZOOTECNIA: "zootecnia", ELEC: "elec.",
};
// Nombres propios y siglas que conservan su mayúscula dentro del nombre.
const KEEP = { COLOMBIA: "Colombia", WORD: "Word", "2D": "2D", XIX: "XIX", XV: "XV", I: "I", II: "II", III: "III", IV: "IV", V: "V", VI: "VI" };

export function sentenceCase(s) {
  if (s == null) return s;
  let first = true;
  return String(s).replace(/[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/g, (w) => {
    const u = w.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let r = KEEP[u] ?? ACC[u] ?? w.toLowerCase();
    if (first) { r = r.charAt(0).toUpperCase() + r.slice(1); first = false; }
    return r;
  });
}

const snap = JSON.parse(fs.readFileSync(src, "utf8"));
for (const key of ["programs", "critical_courses"]) {
  for (const row of snap.queries[key].rows) {
    if (row.programa) row.programa = sentenceCase(row.programa);
    if (row.materia) row.materia = sentenceCase(row.materia);
  }
}

// El exportador usa una versión reducida del snapshot.
const slim = { report: snap.report };
for (const [k, q] of Object.entries(snap.queries)) slim[k] = { label: q.label, rows: q.rows };
slim.institutional.source = snap.queries.institutional.source;

// Las plantillas son fragmentos (título + estilos + contenido); aquí se envuelven en un documento completo.
const wrap = (fragment, extra = "") => {
  const title = fragment.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? "";
  fragment = fragment.replace(title, "");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
${title}
<style>html{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${fragment}${extra}
</body>
</html>
`;
};
const NAV = `
<nav aria-label="Otras vistas" style="max-width:1100px;margin:0 auto;padding:24px 16px 40px;font:14px/1.5 system-ui,sans-serif;color:var(--muted);display:flex;flex-wrap:wrap;gap:8px 20px">
<span>Otras vistas:</span><a href="/presentacion" style="color:inherit">Presentación</a><a href="/exportar" style="color:inherit">Exportar reportes</a>
</nav>`;

const embed = (o) => JSON.stringify(o).replace(/</g, "\u003c");
const extras = { portal: NAV };
const pages = { portal: ["index.html", snap], presentacion: ["presentacion.html", snap], exportar: ["exportar.html", slim] };

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "data.normalizada.json"), JSON.stringify(snap, null, 2));
for (const [tpl, [file, data]] of Object.entries(pages)) {
  let html = fs.readFileSync(path.join(out, "src", `${tpl}.tpl.html`), "utf8").replace("__DATA__", () => embed(data));
  html = wrap(html, extras[tpl] ?? "");
  fs.writeFileSync(path.join(out, file), html);
  console.log(file, html.length);
}
