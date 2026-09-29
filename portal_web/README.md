# Portal web · Mapa de riesgo académico UDES 2026-2 (corte P1)

Rediseño del informe como sitio estático (sin servidor ni dependencias de build):

| Archivo | Contenido |
|---|---|
| `index.html` | Portal con gráficos animados (GSAP), filtro por campus, búsqueda y orden de cursos críticos |
| `presentacion.html` | Presentación web 16:9 (flechas/espacio, swipe, índice con `O`, pantalla completa `F`, notas `N`, impresión 1 diapositiva por página) |
| `exportar.html` | Exportador de reportes con descarga real: PDF (diálogo de impresión → Guardar como PDF), CSV y XLSX; vista previa paginada y personalización |
| `data.normalizada.json` | Datos revisados con nombres en formato "Inicial mayúscula, resto minúscula" |

## Regenerar

```
node scripts/build_portal_web.mjs
```

Lee `informe_analitica_2026_2_p1/src/data.json`, normaliza nombres de programas y cursos
(diccionario de tildes en el script) e inyecta los datos en las plantillas `portal_web/src/*.tpl.html`.

Los datos son alertas tempranas al corte P1. Los cursos con menos de 5 matriculados están suprimidos.
La presentación tiene un botón de descarga PDF (una diapositiva por página, vía impresión del navegador).
