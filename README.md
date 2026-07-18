# StressLess

Aplicación web de **bienestar mental y manejo del estrés**. Es una SPA (Single Page
Application) construida con HTML, CSS y JavaScript puro, sin frameworks, y con
integración **opcional** a Supabase. Diseño pastel anti-estrés basado en psicología
del color.

## Características

- **Inicio**: saludo, métricas rápidas (racha estilo Duolingo, estrés, pantalla, ánimo) y mini-diario.
- **Evaluación**: test dinámico de 15 preguntas con cálculo de puntaje y recomendaciones.
- **Tiempo de pantalla**: registro por dispositivo + temporizador **Pomodoro** con **Modo Zen**.
- **Bienestar y sonidos**: registro de ánimo, respiración guiada y reproductor de sonidos en bucle.
- **Progreso**: gráficos semanales con Chart.js (estrés, pantalla y ánimo).
- **Perfil**: datos, foto de avatar, modo oscuro y borrado de datos.

## Estructura del proyecto

```
stressless/
├── server.js              # Servidor estático sin dependencias (sirve /public)
├── package.json
├── README.md
└── public/                # Todo lo que se sirve al navegador
    ├── index.html         # Landing page
    ├── login.html         # Iniciar sesión
    ├── registro.html      # Crear cuenta
    ├── app.html           # Dashboard SPA (todas las secciones)
    ├── assets/
    │   ├── img/           # logo.png, fondo.jpg
    │   └── audio/         # sonidos relajantes (.mp3)
    ├── styles/
    │   ├── base.css       # Design system: tokens, tipografía y UI base
    │   ├── landing.css    # Estilos de la landing
    │   ├── auth.css       # Estilos de login/registro
    │   └── app.css        # Estilos del dashboard SPA
    └── scripts/
        ├── config.js      # Inicialización de Supabase (credenciales aquí)
        ├── store.js       # Capa de datos (localStorage + helpers)
        ├── auth.js        # Lógica de login y registro
        └── app.js         # Controlador de la SPA (navegación + módulos)
```

## Ejecutar en local

```bash
npm run dev
# Abre http://localhost:3000
```

No requiere instalar dependencias: el servidor usa solo módulos nativos de Node.

## Conectar Supabase (opcional)

La app funciona en **modo local** (localStorage) sin configuración. Para persistir en
la nube, edita `public/scripts/config.js` y completa tus credenciales:

```js
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY";
```

Tablas sugeridas: `evaluaciones`, `pantalla`, `animo`, `diario` (cada una con las
columnas `usuario`, los campos de su payload y `creado`).

## Paleta de color

| Uso                 | Color     |
|---------------------|-----------|
| Fondo               | `#f4f7f6` |
| Tarjetas            | `#ffffff` |
| Azul serenidad      | `#7daecf` |
| Verde menta         | `#9cd3b4` |
| Lavanda (acciones)  | `#b1b0e1` |
