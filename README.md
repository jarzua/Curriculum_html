# Hoja de vida — Javier David Ripoll

**Ver en línea:** https://jarzua.github.io/Curriculum_html/

Página de un solo scroll (tema oscuro, animaciones al hacer scroll) basada en el diseño de la hoja de vida en PDF.
HTML + CSS + JavaScript puro, sin dependencias ni compilación.

## Estructura

```
index.html                 Página
styles.css                 Estilos (tema blackout)
script.js                  Interacciones y animaciones
assets/img/javier.jpg      Foto
assets/docs/HV_Javier_David_Ripoll.pdf   Hoja de vida descargable (versión optimizada, 2 MB)
certificados/              Aquí van los PDF de certificados (ver certificados/LEEME.md)
```

## Ver en local

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en https://github.com/new (`Curriculum_html`, público).
2. En esta carpeta:
   ```bash
   git remote add origin https://github.com/jarzua/Curriculum_html.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)` → **Save**.
4. En 1–2 minutos la página queda en https://jarzua.github.io/Curriculum_html/.

## Agregar certificados

Copia los PDF a `certificados/` con los nombres indicados en `certificados/LEEME.md` y luego:

```bash
git add certificados
git commit -m "Agregar certificados"
git push
```
