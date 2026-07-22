(function () {
  const KEYS = {
    users: "sl_usuarios",
    session: "sl_sesion",
    settings: "sl_config",
  };

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return read(KEYS.users, []);
  }
  function setUsers(users) {
    write(KEYS.users, users);
  }
  function getSessionEmail() {
    return localStorage.getItem(KEYS.session);
  }
  function setSession(email) {
    localStorage.setItem(KEYS.session, email);
  }
  function clearSession() {
    localStorage.removeItem(KEYS.session);
  }
  function currentUser() {
    const email = getSessionEmail();
    if (!email) return null;
    return getUsers().find((u) => u.correo === email) || null;
  }
  function saveUser(updated) {
    const users = getUsers();
    const i = users.findIndex((u) => u.correo === updated.correo);
    if (i >= 0) users[i] = updated;
    setUsers(users);
  }

  function registerUser({ nombre, correo, password }) {
    const users = getUsers();
    if (users.some((u) => u.correo === correo)) {
      return { ok: false, error: "Ya existe una cuenta con este correo." };
    }
    const user = {
      id: "u_" + Date.now(),
      nombre,
      correo,
      password, 
      edad: "",
      horasSueno: "",
      foto: "",
      creado: new Date().toISOString(),
      data: emptyData(),
    };
    users.push(user);
    setUsers(users);
    setSession(correo);
    return { ok: true, user };
  }

  function login({ correo, password }) {
    const user = getUsers().find(
      (u) => u.correo === correo && u.password === password
    );
    if (!user) return { ok: false, error: "Correo o contraseña incorrectos." };
    setSession(correo);
    return { ok: true, user };
  }

  function emptyData() {
    return {
      estres: null, 
      pantalla: null,
      animoHoy: null,
      diario: [],
      racha: { dias: 0, ultimaFecha: null },
      historial: {
        estres: [],
        pantalla: [],
        animo: [],
      },
    };
  }

  function getData() {
    const user = currentUser();
    if (!user) return emptyData();
    if (!user.data) user.data = emptyData();
    return user.data;
  }

  function updateData(mutator) {
    const user = currentUser();
    if (!user) return;
    if (!user.data) user.data = emptyData();
    mutator(user.data);
    saveUser(user);
  }

  function getSettings() {
    return read(KEYS.settings, { dark: false });
  }
  function setSettings(next) {
    write(KEYS.settings, next);
  }

  function touchStreak() {
    updateData((d) => {
      const hoy = new Date().toDateString();
      if (d.racha.ultimaFecha === hoy) return;
      const ayer = new Date(Date.now() - 86400000).toDateString();
      d.racha.dias = d.racha.ultimaFecha === ayer ? d.racha.dias + 1 : 1;
      d.racha.ultimaFecha = hoy;
    });
  }

  window.Store = {
    getUsers,
    currentUser,
    saveUser,
    registerUser,
    login,
    getSessionEmail,
    clearSession,
    getData,
    updateData,
    getSettings,
    setSettings,
    touchStreak,
  };
})();
