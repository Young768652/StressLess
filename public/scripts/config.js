const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

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

window.SUPABASE_ENABLED = !!window.supabaseClient;
