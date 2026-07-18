/* ============================================================
   StressLess · auth.js
   Logica compartida de login y registro. Detecta el formulario
   presente en la pagina y aplica validaciones.
   ============================================================ */

(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showMessage(el, texto, tipo) {
    if (!el) return;
    el.textContent = texto;
    el.className = "form-msg show " + tipo;
  }
  function markError(fieldId, show) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.toggle("has-error", show);
  }

  /* ---------- Registro ---------- */
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim();
      const correo = document.getElementById("correo").value.trim();
      const password = document.getElementById("password").value;
      const password2 = document.getElementById("password2").value;
      const msg = document.getElementById("formMsg");

      let ok = true;
      markError("fieldNombre", nombre.length === 0);
      if (nombre.length === 0) ok = false;
      markError("fieldCorreo", !EMAIL_RE.test(correo));
      if (!EMAIL_RE.test(correo)) ok = false;
      markError("fieldPass", password.length < 6);
      if (password.length < 6) ok = false;
      markError("fieldPass2", password !== password2);
      if (password !== password2) ok = false;

      if (!ok) {
        showMessage(msg, "Revisa los campos marcados en rojo.", "error");
        return;
      }

      const res = window.Store.registerUser({ nombre, correo, password });
      if (!res.ok) {
        showMessage(msg, res.error, "error");
        return;
      }
      showMessage(msg, "¡Cuenta creada! Redirigiendo...", "success");
      setTimeout(() => (window.location.href = "app.html"), 800);
    });
  }

  /* ---------- Login ---------- */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const correo = document.getElementById("correo").value.trim();
      const password = document.getElementById("password").value;
      const msg = document.getElementById("formMsg");

      let ok = true;
      markError("fieldCorreo", !EMAIL_RE.test(correo));
      if (!EMAIL_RE.test(correo)) ok = false;
      markError("fieldPass", password.length < 6);
      if (password.length < 6) ok = false;

      if (!ok) {
        showMessage(msg, "Revisa los campos marcados en rojo.", "error");
        return;
      }

      const res = window.Store.login({ correo, password });
      if (!res.ok) {
        showMessage(msg, res.error, "error");
        return;
      }
      showMessage(msg, "¡Bienvenido de nuevo! Redirigiendo...", "success");
      setTimeout(() => (window.location.href = "app.html"), 700);
    });
  }
})();
