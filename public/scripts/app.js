(function () {
  const Store = window.Store;

  const user = Store.currentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  Store.touchStreak(); // Suma la racha por ingresar hoy.

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const charts = {};
  function goTo(view) {
    $$(".view").forEach((v) => v.classList.remove("active"));
    $$(".side-link").forEach((l) => l.classList.remove("active"));
    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add("active");
    const link = document.querySelector(`.side-link[data-view="${view}"]`);
    if (link) link.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeSidebar();
    if (view === "progreso") renderCharts();
  }

  $$("[data-view]").forEach((el) => {
    el.addEventListener("click", () => goTo(el.getAttribute("data-view")));
  });

  const sidebar = $("#sidebar");
  const backdrop = $("#backdrop");
  function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
  }
  $("#menuToggle").addEventListener("click", () => {
    sidebar.classList.add("open");
    backdrop.classList.add("show");
  });
  backdrop.addEventListener("click", closeSidebar);

  $("#logoutBtn").addEventListener("click", () => {
    Store.clearSession();
    window.location.href = "login.html";
  });

  function paintUser() {
    const u = Store.currentUser();
    $("#sideUserName").textContent = u.nombre || "Usuario";
    $("#sideUserMail").textContent = u.correo;
    $("#saludo").textContent = `Hola, ${u.nombre || "amigo"}`;
    const avatar = $("#sideAvatar");
    const preview = $("#avatarPreview");
    if (u.foto) {
      avatar.style.backgroundImage = `url(${u.foto})`;
      avatar.textContent = "";
      preview.style.backgroundImage = `url(${u.foto})`;
      preview.innerHTML = "";
    } else {
      avatar.textContent = (u.nombre || "U").charAt(0).toUpperCase();
    }
  }

  function paintHome() {
    const d = Store.getData();
    $("#homeStreak").textContent = `${d.racha.dias} día${d.racha.dias === 1 ? "" : "s"}`;

    if (d.estres) {
      $("#homeStress").firstChild.textContent = `${d.estres.puntaje} `;
      const badge = $("#homeStressBadge");
      badge.textContent = d.estres.nivel;
      badge.className = "badge " + nivelBadge(d.estres.nivel);
    }
    if (d.pantalla) $("#homeScreen").textContent = `${d.pantalla.total} h`;
    if (d.animoHoy) $("#homeMood").textContent = d.animoHoy.etiqueta;

    renderDiary();
  }

  function nivelBadge(nivel) {
    if (nivel === "Alto") return "badge-high";
    if (nivel === "Moderado") return "badge-mod";
    return "badge-low";
  }

  function renderDiary() {
    const list = $("#diaryList");
    const d = Store.getData();
    list.innerHTML = "";
    d.diario.slice(0, 5).forEach((n) => {
      const li = document.createElement("li");
      li.className = "diary-item";
      li.innerHTML = `<div class="date">${n.fecha}</div>${escapeHtml(n.texto)}`;
      list.appendChild(li);
    });
  }

  $("#saveDiaryBtn").addEventListener("click", () => {
    const ta = $("#diaryText");
    const texto = ta.value.trim();
    if (!texto) return;
    Store.updateData((d) => {
      d.diario.unshift({ texto, fecha: fechaCorta() });
    });
    ta.value = "";
    renderDiary();
    saveToSupabase("diario", { texto });
  });

  const preguntas = [
    "¿Sientes que te cuesta relajarte últimamente?",
    "¿Te has sentido nervioso/a o con la mente muy activa?",
    "¿Te cuesta conciliar el sueño o dormir bien?",
    "¿Te sientes cansado/a aunque hayas descansado?",
    "¿Te cuesta concentrarte en tareas simples?",
    "¿Te irritas con facilidad?",
    "¿Sientes tensión en el cuerpo (cuello, hombros, mandíbula)?",
    "¿Te preocupas por cosas que no puedes controlar?",
    "¿Sientes que tienes demasiadas cosas por hacer?",
    "¿Has perdido interés en actividades que disfrutabas?",
    "¿Comes más o menos de lo habitual por ansiedad?",
    "¿Revisas el teléfono de forma compulsiva?",
    "¿Te cuesta desconectar del trabajo o los estudios?",
    "¿Sientes que te falta tiempo para ti mismo/a?",
    "¿Terminas el día sintiéndote agotado/a emocionalmente?",
  ];
  const opciones = ["Nunca", "Pocas veces", "A veces", "Frecuentemente", "Siempre"];
  let indice = 0;
  let puntaje = 0;
  let seleccion = null;

  function mostrarPregunta() {
    $("#resultCard").style.display = "none";
    $("#testCard").style.display = "block";
    $("#questionText").textContent = preguntas[indice];
    $("#questionCount").textContent = `Pregunta ${indice + 1} de ${preguntas.length}`;
    $("#testProgress").style.width = `${(indice / preguntas.length) * 100}%`;
    seleccion = null;
    $("#nextQuestionBtn").disabled = true;
    $("#nextQuestionBtn").textContent = indice === preguntas.length - 1 ? "Ver resultado" : "Siguiente";

    const cont = $("#optionsList");
    cont.innerHTML = "";
    opciones.forEach((op, i) => {
      const label = document.createElement("label");
      label.className = "option";
      label.innerHTML = `<input type="radio" name="q" value="${i}"> ${op}`;
      label.querySelector("input").addEventListener("change", () => {
        $$(".option").forEach((o) => o.classList.remove("selected"));
        label.classList.add("selected");
        seleccion = i;
        $("#nextQuestionBtn").disabled = false;
      });
      cont.appendChild(label);
    });
  }

  $("#nextQuestionBtn").addEventListener("click", () => {
    if (seleccion === null) return;
    puntaje += seleccion;
    indice++;
    if (indice < preguntas.length) {
      mostrarPregunta();
    } else {
      finalizarTest();
    }
  });

  $("#repeatTestBtn").addEventListener("click", () => {
    indice = 0;
    puntaje = 0;
    mostrarPregunta();
  });

  function finalizarTest() {
    const max = preguntas.length * 4; // 60
    const escala = Math.round((puntaje / max) * 45); // puntaje 0-45
    const nivel = escala >= 30 ? "Alto" : escala >= 15 ? "Moderado" : "Bajo";
    const mensajes = {
      Alto: "Tu nivel de estrés es alto. Conviene buscar pausas frecuentes y, si persiste, apoyo profesional.",
      Moderado: "Tu nivel es moderado. Con hábitos más calmantes puedes recuperar el equilibrio.",
      Bajo: "Tu nivel parece bajo. ¡Sigue cuidando tu bienestar!",
    };
    const recos = {
      Alto: ["fa-lungs|Respira profundo 5 minutos varias veces al día.", "fa-bed|Cuida tu descanso y rutina de sueño.", "fa-user-doctor|Considera hablar con un profesional."],
      Moderado: ["fa-spa|Dedica 10 minutos a una pausa consciente.", "fa-person-walking|Camina al aire libre.", "fa-mobile-screen|Reduce el tiempo de pantalla nocturno."],
      Bajo: ["fa-heart|Mantén tus hábitos saludables.", "fa-music|Disfruta de tus sonidos favoritos.", "fa-face-smile|Registra tu ánimo cada día."],
    };

    $("#testCard").style.display = "none";
    const rc = $("#resultCard");
    rc.style.display = "block";
    $("#resultLevel").textContent = nivel;
    $("#resultLevel").style.color =
      nivel === "Alto" ? "#b56464" : nivel === "Moderado" ? "#a97e33" : "#4a8f6c";
    $("#resultScore").textContent = `Puntaje ${escala}/45`;
    $("#resultMsg").textContent = mensajes[nivel];
    const ul = $("#resultRecos");
    ul.innerHTML = "";
    recos[nivel].forEach((r) => {
      const [icon, txt] = r.split("|");
      const li = document.createElement("li");
      li.innerHTML = `<i class="fa-solid ${icon}"></i> ${txt}`;
      ul.appendChild(li);
    });

    Store.updateData((data) => {
      data.estres = { puntaje: escala, nivel, fecha: fechaCorta() };
      pushHistorial(data.historial.estres, escala);
    });
    paintHome();
    saveToSupabase("evaluaciones", { puntaje: escala, nivel });
  }

  const sliders = { celular: "celularVal", computadora: "compuVal", tv: "tvVal" };
  Object.entries(sliders).forEach(([id, labelId]) => {
    const input = document.getElementById(id);
    const label = document.getElementById(labelId);
    input.addEventListener("input", () => (label.textContent = `${input.value} h`));
  });

  $("#analizarPantallaBtn").addEventListener("click", () => {
    const total =
      Number($("#celular").value) + Number($("#computadora").value) + Number($("#tv").value);
    $("#pantallaResultado").style.display = "block";
    $("#pantallaTotal").textContent = `${total} horas`;
    const badge = $("#pantallaBadge");
    if (total > 10) { badge.textContent = "Alto uso"; badge.className = "badge badge-high"; }
    else if (total > 6) { badge.textContent = "Uso moderado"; badge.className = "badge badge-mod"; }
    else { badge.textContent = "Uso equilibrado"; badge.className = "badge badge-low"; }

    Store.updateData((data) => {
      data.pantalla = { total, fecha: fechaCorta() };
      pushHistorial(data.historial.pantalla, total);
    });
    paintHome();
    saveToSupabase("pantalla", { total });
  });

  let pomoSeg = 25 * 60;
  let pomoTimer = null;
  let pomoRunning = false;

  function pintarPomo() {
    const m = String(Math.floor(pomoSeg / 60)).padStart(2, "0");
    const s = String(pomoSeg % 60).padStart(2, "0");
    $("#pomoClock").textContent = `${m}:${s}`;
  }
  function toggleZen(on) {
    document.body.classList.toggle("zen", on);
  }
  $("#pomoStart").addEventListener("click", () => {
    if (pomoRunning) {
      clearInterval(pomoTimer);
      pomoRunning = false;
      $("#pomoStart").textContent = "Reanudar";
      $("#pomoState").textContent = "En pausa";
      toggleZen(false);
      return;
    }
    pomoRunning = true;
    $("#pomoStart").textContent = "Pausar";
    $("#pomoState").textContent = "Concentración en curso…";
    toggleZen(true);
    pomoTimer = setInterval(() => {
      pomoSeg--;
      pintarPomo();
      if (pomoSeg <= 0) {
        clearInterval(pomoTimer);
        pomoRunning = false;
        toggleZen(false);
        $("#pomoState").textContent = "¡Sesión completada! Toma un descanso.";
        $("#pomoStart").textContent = "Iniciar";
        pomoSeg = 25 * 60;
      }
    }, 1000);
  });
  $("#pomoReset").addEventListener("click", () => {
    clearInterval(pomoTimer);
    pomoRunning = false;
    pomoSeg = 25 * 60;
    pintarPomo();
    toggleZen(false);
    $("#pomoStart").textContent = "Iniciar";
    $("#pomoState").textContent = "Listo para empezar";
  });

  let moodSel = null;
  $$("#moodRow .mood-btn").forEach((b) => {
    b.addEventListener("click", () => {
      $$("#moodRow .mood-btn").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      moodSel = { valor: Number(b.dataset.mood), etiqueta: b.dataset.label };
    });
  });
  $("#guardarAnimoBtn").addEventListener("click", () => {
    if (!moodSel) { $("#animoMsg").textContent = "Elige cómo te sientes primero."; return; }
    Store.updateData((data) => {
      data.animoHoy = { ...moodSel, fecha: fechaCorta() };
      pushHistorial(data.historial.animo, moodSel.valor);
    });
    $("#animoMsg").textContent = "¡Ánimo registrado! Gracias por cuidarte.";
    paintHome();
    saveToSupabase("animo", moodSel);
  });

  const fases = [
    { txt: "Inhala", ms: 4000 },
    { txt: "Sostén", ms: 4000 },
    { txt: "Exhala", ms: 6000 },
  ];
  let faseIdx = 0;
  function ciclarRespiracion() {
    const core = $("#breatheCore");
    if (!core) return;
    core.textContent = fases[faseIdx].txt;
    setTimeout(() => {
      faseIdx = (faseIdx + 1) % fases.length;
      ciclarRespiracion();
    }, fases[faseIdx].ms);
  }
  ciclarRespiracion();

  const audio = $("#ambientAudio");
  let sonandoActual = null;
  $$("#soundGrid .sound-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nombre = btn.dataset.sound;
      if (sonandoActual === nombre) {
        audio.pause();
        btn.classList.remove("playing");
        sonandoActual = null;
        return;
      }
      $$("#soundGrid .sound-btn").forEach((b) => b.classList.remove("playing"));
      audio.src = `assets/audio/${nombre}.mp3`;
      audio.volume = Number($("#volume").value);
      audio.play().catch(() => {});
      btn.classList.add("playing");
      sonandoActual = nombre;
    });
  });
  $("#volume").addEventListener("input", (e) => (audio.volume = Number(e.target.value)));

  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  function serie(arr, fallbackBase) {
    return dias.map((_, i) => arr[i] ?? fallbackBase(i));
  }
  function renderCharts() {
    if (typeof Chart === "undefined") return;
    const d = Store.getData();

    const cfg = (canvasId, key, tipo, color, bg, base, max) => {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;
      const data = serie(d.historial[key], base);
      if (charts[canvasId]) {
        charts[canvasId].data.datasets[0].data = data;
        charts[canvasId].update();
        return;
      }
      charts[canvasId] = new Chart(ctx, {
        type: tipo,
        data: { labels: dias, datasets: [{ label: "", data, borderColor: color, backgroundColor: bg, tension: 0.35, fill: true, borderRadius: 8 }] },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max } },
        },
      });
    };

    cfg("stressChart", "estres", "line", "#7daecf", "rgba(125,174,207,0.18)", (i) => 20 + (i % 3) * 4, 45);
    cfg("screenChart", "pantalla", "bar", "#9cd3b4", "rgba(156,211,180,0.5)", (i) => 4 + (i % 3), 16);
    cfg("moodChart", "animo", "line", "#b1b0e1", "rgba(177,176,225,0.2)", (i) => 3 + (i % 2), 5);
  }

  function loadProfile() {
    const u = Store.currentUser();
    $("#perfilNombre").value = u.nombre || "";
    $("#perfilEdad").value = u.edad || "";
    $("#perfilCorreo").value = u.correo || "";
    $("#perfilSueno").value = u.horasSueno || "";
  }
  $("#guardarPerfilBtn").addEventListener("click", () => {
    const u = Store.currentUser();
    u.nombre = $("#perfilNombre").value.trim() || u.nombre;
    u.edad = $("#perfilEdad").value;
    u.horasSueno = $("#perfilSueno").value;
    Store.saveUser(u);
    $("#perfilMsg").textContent = "Cambios guardados correctamente.";
    paintUser();
    paintHome();
  });
  $("#fotoInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const u = Store.currentUser();
      u.foto = reader.result;
      Store.saveUser(u);
      paintUser();
    };
    reader.readAsDataURL(file);
  });

  const darkToggle = $("#darkModeToggle");
  const settings = Store.getSettings();
  document.body.classList.toggle("dark", !!settings.dark);
  darkToggle.checked = !!settings.dark;
  darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkToggle.checked);
    Store.setSettings({ ...Store.getSettings(), dark: darkToggle.checked });
  });

  $("#borrarDatosBtn").addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres borrar tu historial de bienestar?")) return;
    Store.updateData((d) => {
      d.estres = null; d.pantalla = null; d.animoHoy = null;
      d.diario = []; d.racha = { dias: 0, ultimaFecha: null };
      d.historial = { estres: [], pantalla: [], animo: [] };
    });
    Object.values(charts).forEach((c) => c.destroy());
    Object.keys(charts).forEach((k) => delete charts[k]);
    paintHome();
    alert("Historial borrado.");
  });

  function pushHistorial(arr, valor) {
    arr.push(valor);
    if (arr.length > 7) arr.shift();
  }
  function fechaCorta() {
    return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  async function saveToSupabase(tabla, payload) {
    if (!window.supabaseClient) return; // Modo local si no hay credenciales.
    try {
      const u = Store.currentUser();
      await window.supabaseClient.from(tabla).insert({ usuario: u.correo, ...payload, creado: new Date().toISOString() });
      console.log(`[v0] Guardado en Supabase (${tabla}).`);
    } catch (err) {
      console.log(`[v0] No se pudo guardar en Supabase (${tabla}):`, err.message);
    }
  }

  paintUser();
  paintHome();
  loadProfile();
  mostrarPregunta();
  pintarPomo();
})();
