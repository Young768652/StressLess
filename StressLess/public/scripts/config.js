/* ============================================================
   StressLess · config.js
   Configuracion e inicializacion del cliente de Supabase.

   COMO CONECTAR TU BASE DE DATOS:
   1. Crea un proyecto gratis en https://supabase.com
   2. Ve a Project Settings -> API y copia tu URL y tu anon key.
   3. Pega los valores en las constantes de abajo.

   Mientras no configures credenciales, la app funciona en
   "modo local" usando localStorage, sin errores.
   ============================================================ */

// 🔧 Ingresa aqui tus credenciales de Supabase:
const SUPABASE_URL = ""; // p. ej. "https://xxxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = ""; // p. ej. "eyJhbGciOi..."

// Cliente global (null si aun no hay credenciales).
window.supabaseClient = null;

(function initSupabase() {
  const listo =
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    typeof window.supabase !== "undefined";

  if (listo) {
    try {
      window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
      console.log("[v0] Supabase conectado correctamente.");
    } catch (err) {
      console.log("[v0] No se pudo iniciar Supabase:", err.message);
    }
  } else {
    console.log(
      "[v0] Supabase no configurado: usando almacenamiento local (localStorage)."
    );
  }
})();

// Bandera util para el resto de la app.
window.SUPABASE_ENABLED = !!window.supabaseClient;
