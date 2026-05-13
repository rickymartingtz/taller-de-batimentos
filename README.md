# Afinación activa · Método Aural

Taller interactivo de afinación por batimientos. React + Vite + Tailwind v4 + Web Audio API.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Build de producción

```bash
npm run build      # genera dist/
npm run preview    # previsualiza el build
```

## Deploy en Vercel (recomendado)

**Desde la web:**

1. Sube esta carpeta a un repositorio nuevo en GitHub.
2. Entra a https://vercel.com, conecta tu cuenta de GitHub.
3. Click en "Add New → Project", elige el repo.
4. Vercel detecta Vite automáticamente. Pulsa "Deploy".
5. En 30 segundos tienes una URL pública con HTTPS.

**Desde la terminal:**

```bash
npm install -g vercel
vercel
```

## Deploy en Netlify

**Drag & drop (más rápido):**

1. Corre `npm run build`.
2. Entra a https://app.netlify.com/drop
3. Arrastra la carpeta `dist/` al navegador.
4. Listo.

**Desde GitHub:**

1. Sube esta carpeta a un repo de GitHub.
2. En Netlify: "Add new site → Import from Git".
3. Build command: `npm run build` · Publish directory: `dist`
4. Deploy.

## Embeber en Hotmart

Una vez deployado, en una lección de tipo "Texto/HTML enriquecido" pega:

```html
<iframe
  src="https://TU-URL.vercel.app"
  width="100%"
  height="1400"
  frameborder="0"
  allow="autoplay"
  style="border: 0; min-height: 1400px;"
></iframe>
```

Ajusta `height` según necesites.

## Notas técnicas

- **Web Audio API requiere HTTPS en producción.** Vercel y Netlify lo dan automático.
- **Audífonos recomendados**: los batimientos viven en armónicos altos que las bocinas pequeñas no reproducen.
- No usa localStorage ni cookies.
- Bundle: ~67 kB JS gzipped, ~3.4 kB CSS gzipped.

## Estructura

```
src/
  App.jsx       — componente entero (audio + UI)
  main.jsx      — entry point
  index.css     — Tailwind base
index.html      — HTML con preload de Google Fonts
vite.config.js  — config con plugin de Tailwind v4
```

Toda la lógica está en `src/App.jsx`. Para modificar intervalos, timbres o paleta, edítalo ahí.
