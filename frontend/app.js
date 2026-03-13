// ============================================================
//  app.js — Pura Vida PC
//  Versión corregida: sesión persistente, inscripción real,
//  updateNavbar única, localStorage, URL dinámica
// ============================================================

// ── URL del API (Producción Railway) ──
const API_BASE = "https://gateway-production-69b3.up.railway.app";

// ── AbortController para cancelar inscripción en curso ──
let inscriptionController = null;

// ── Helpers de sesión (todos en localStorage para persistencia) ──
function saveSession(data) {
  localStorage.setItem("authUserId", data.userId || data.id);
  localStorage.setItem("username",   data.username);
  localStorage.setItem("email",      data.email);
}

function getSession() {
  return {
    userId:   localStorage.getItem("authUserId"),
    username: localStorage.getItem("username"),
    email:    localStorage.getItem("email"),
  };
}

function logout() {
  if (!confirm("¿Estás seguro de que deseas cerrar sesión?")) return;
  localStorage.clear();
  window.location.href = "index.html";
}

// ── Leer respuesta del backend (texto o JSON) ──
async function readResponseData(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Mensaje en el formulario de auth ──
const authMessage = document.getElementById("authMessage");

function showMessage(message, type = "success") {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function clearMessage() {
  if (!authMessage) return;
  authMessage.textContent = "";
  authMessage.className = "auth-message";
}

// ============================================================
//  NAVBAR — única definición, llama a logout() real
// ============================================================
function updateNavbar() {
  const el = document.getElementById("userNavActions");
  if (!el) return;

  const { userId, username } = getSession();

  if (userId) {
    el.innerHTML = `
      <div style="position:relative; margin-right: 15px; display: flex; align-items: center;">
        <span onclick="toggleNotifications()" style="cursor:pointer; font-size: 20px;">🔔</span>
        <div id="notifBadge" class="notif-badge" style="display:none; position:absolute; top:-5px; right:-8px; background:red; color:white; border-radius:50%; padding:2px 5px; font-size:10px;"></div>
        <div id="notifDropdown" class="notif-dropdown" style="display:none; position:absolute; right:0; top:35px; width:300px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:10px; max-height:400px; overflow-y:auto; z-index:100; text-align: left;">
          <h4 style="margin:0 0 10px; border-bottom:1px solid #eee; padding-bottom:5px; color: #333;">Notificaciones</h4>
          <div id="notifList" style="font-size:12px; color:#555;">Cargando...</div>
        </div>
      </div>
      <a href="perfil.html" class="nav-login"
         style="background:var(--color-primary);color:white;
                border-radius:999px;padding:8px 20px;text-decoration:none;">
        👤 Hola, ${username || "Usuario"}
      </a>
      <a href="#" onclick="logout();return false;"
         style="margin-left:10px;font-size:13px;padding:6px 14px;
                background:var(--color-accent);color:white;border-radius:999px;
                text-decoration:none;font-weight:500;">
        Salir
      </a>
    `;
    loadNotifications(userId);
  } else {
    el.innerHTML = `
      <a href="auth.html" class="nav-login">Iniciar sesión</a>
    `;
  }
}

// ── Lógica de Notificaciones ──
window.toggleNotifications = function() {
  const d = document.getElementById("notifDropdown");
  const badge = document.getElementById("notifBadge");
  if (d) {
    const isOpening = d.style.display === "none";
    d.style.display = isOpening ? "block" : "none";
    if (isOpening && badge) {
      badge.style.display = "none";
      // Guardar que ya vio todas las notificaciones actuales
      const { userId } = getSession();
      if (userId) localStorage.setItem(`notifSeen_${userId}`, Date.now().toString());
    }
  }
};

window.clearAllNotifications = function() {
  const notifList = document.getElementById("notifList");
  const badge = document.getElementById("notifBadge");
  const { userId } = getSession();
  if (notifList) notifList.innerHTML = "<p style='text-align:center;color:#aaa;'>No hay notificaciones</p>";
  if (badge) badge.style.display = "none";
  if (userId) localStorage.setItem(`notifSeen_${userId}`, Date.now().toString());
};

window.loadNotifications = async function(userId) {
  try {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}`);
    const data = await readResponseData(response);
    const notifList = document.getElementById("notifList");
    const badge = document.getElementById("notifBadge");

    if (!response.ok || !Array.isArray(data)) {
      if(notifList) notifList.innerHTML = "No se pudieron cargar";
      return;
    }

    if (data.length === 0) {
      if(notifList) notifList.innerHTML = "<p style='text-align:center;color:#aaa;'>No hay notificaciones</p>";
      if(badge) badge.style.display = "none";
    } else {
      // Verificar cuántas notificaciones son nuevas desde la última vez que abrió
      const lastSeen = parseInt(localStorage.getItem(`notifSeen_${userId}`) || "0");
      const newCount = data.filter(n => new Date(n.sentAt).getTime() > lastSeen).length;
      if (newCount > 0 && badge) {
        badge.textContent = newCount;
        badge.style.display = "flex";
      } else if (badge) {
        badge.style.display = "none";
      }

      if(notifList) {
        notifList.innerHTML = data.reverse().map(n => `
          <div style="padding:10px; border-bottom:1px solid #f9f9f9;">
            <strong style="color:var(--color-primary)">${n.eventName || 'Evento'}</strong><br/>
            ${n.message}<br/>
            <small style="color:#aaa">${new Date(n.sentAt).toLocaleString()}</small>
          </div>
        `).join("") + `
          <button onclick="clearAllNotifications()" style="width:100%;margin-top:8px;padding:8px;background:var(--color-accent);color:white;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;">
            Borrar todas
          </button>
        `;
      }
    }
  } catch(e) {
    const notifList = document.getElementById("notifList");
    if(notifList) notifList.innerHTML = "Error al conectar con notificaciones";
  }
};

// ============================================================
//  TOGGLE LOGIN / REGISTRO (auth.html)
// ============================================================
const showLoginBtn    = document.getElementById("showLogin");
const showRegisterBtn = document.getElementById("showRegister");
const loginPanel      = document.getElementById("loginPanel");
const registerPanel   = document.getElementById("registerPanel");

if (showLoginBtn && showRegisterBtn && loginPanel && registerPanel) {
  showLoginBtn.addEventListener("click", () => {
    showLoginBtn.classList.add("is-active");
    showRegisterBtn.classList.remove("is-active");
    loginPanel.classList.remove("is-hidden");
    registerPanel.classList.add("is-hidden");
    clearMessage();
  });

  showRegisterBtn.addEventListener("click", () => {
    showRegisterBtn.classList.add("is-active");
    showLoginBtn.classList.remove("is-active");
    registerPanel.classList.remove("is-hidden");
    loginPanel.classList.add("is-hidden");
    clearMessage();
  });
}

// ============================================================
//  REGISTRO
// ============================================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const username = document.getElementById("registerUsername").value.trim();
    const email    = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !email || !password) {
      showMessage("Completa todos los campos del registro.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        showMessage(data.message || "No se pudo completar el registro.", "error");
        return;
      }

      saveSession(data);               // ← localStorage
      updateNavbar();
      showMessage("¡Registro exitoso! Redirigiendo...", "success");
      setTimeout(() => { window.location.href = "events.html"; }, 1200);

    } catch {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  });
}

// ============================================================
//  LOGIN
// ============================================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage("Completa email y contraseña para iniciar sesión.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        showMessage(data.message || "Credenciales inválidas.", "error");
        return;
      }

      saveSession(data);               // ← localStorage
      updateNavbar();
      showMessage("¡Login exitoso! Redirigiendo...", "success");
      setTimeout(() => { window.location.href = "my-events.html"; }, 1000);

    } catch {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  });
}

// ============================================================
//  FORMATO DE FECHA
// ============================================================
function formatEventDate(dateValue) {
  if (!dateValue) return "Fecha pendiente";
  const date = new Date(dateValue);
  return date.toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
}

// ============================================================
//  CARD DE EVENTO
// ============================================================
function createEventCard(event) {
  const img = event.imageUrl
    || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
  return `
    <article class="event-card-v3 event-item"
             data-category="${event.category || ""}"
             data-date="${event.eventDate || ""}">
      <img src="${img}"
           alt="${event.name}"
           onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop'">
      <div class="event-card-body-v3">
        <span class="event-category">${event.category || "Experiencia"}</span>
        <h3 class="v3-title">${event.name}</h3>
        <p class="v3-meta">📅 ${formatEventDate(event.eventDate)}</p>
        <p class="v3-meta">📍 ${event.location}</p>
        <p class="v3-meta">👥 ${event.availableSpots} cupos</p>
        <p class="v3-price">RD$ ${event.price ?? 0}</p>
        <div class="v3-action">
          <a href="event-detail.html?id=${event.id}" class="v3-btn">Ver detalle</a>
        </div>
      </div>
    </article>
  `;
}

// ============================================================
//  CARGAR EVENTOS (events.html)
// ============================================================
let allLoadedEvents = [];

async function loadEvents() {
  const eventsGrid    = document.getElementById("eventsGrid");
  const eventsMessage = document.getElementById("eventsMessage");
  if (!eventsGrid || !eventsMessage) return;

  eventsMessage.textContent = "Cargando eventos...";

  try {
    const response = await fetch(`${API_BASE}/events`);
    const data = await readResponseData(response);

    if (!response.ok) {
      eventsGrid.innerHTML = "";
      eventsMessage.textContent = data.message || "No se pudieron cargar los eventos.";
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      eventsGrid.innerHTML = "";
      eventsMessage.textContent = "Todavía no hay eventos disponibles.";
      return;
    }

    allLoadedEvents = data;
    renderEvents(allLoadedEvents);
    setupFilters();

  } catch {
    eventsGrid.innerHTML = "";
    eventsMessage.textContent = "No se pudo conectar con el servicio de eventos.";
  }
}

function renderEvents(eventsToRender) {
  const eventsGrid    = document.getElementById("eventsGrid");
  const eventsMessage = document.getElementById("eventsMessage");
  if (!eventsGrid || !eventsMessage) return;

  if (eventsToRender.length === 0) {
    eventsGrid.innerHTML = "";
    eventsMessage.textContent = "No hay eventos que coincidan con la búsqueda.";
  } else {
    eventsGrid.innerHTML = eventsToRender.map(createEventCard).join("");
    eventsMessage.textContent = "";
  }
}

// ── Filtros de events.html ──
function setupFilters() {
  const catDropdown  = document.getElementById("categoryDropdown");
  const dateDropdown = document.getElementById("dateDropdown");
  if (!catDropdown || !dateDropdown) return;

  let currentCategory   = "";
  let currentDatePrefix = "";

  const catBtn  = catDropdown.querySelector(".dropdown-button");
  const dateBtn = dateDropdown.querySelector(".dropdown-button");
  const catItems  = catDropdown.querySelectorAll(".dropdown-item");
  const dateItems = dateDropdown.querySelectorAll(".dropdown-item");

  const closeDropdowns = () => {
    catDropdown.classList.remove("active");
    dateDropdown.classList.remove("active");
  };

  catBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dateDropdown.classList.remove("active");
    catDropdown.classList.toggle("active");
  });

  dateBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    catDropdown.classList.remove("active");
    dateDropdown.classList.toggle("active");
  });

  document.addEventListener("click", closeDropdowns);

  catItems.forEach(item => {
    item.addEventListener("click", () => {
      catItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      currentCategory = item.getAttribute("data-value");
      catDropdown.querySelector(".dropdown-text").textContent = item.textContent;
      applyFilters();
    });
  });

  dateItems.forEach(item => {
    item.addEventListener("click", () => {
      dateItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      currentDatePrefix = item.getAttribute("data-value");
      dateDropdown.querySelector(".dropdown-text").textContent = item.textContent;
      applyFilters();
    });
  });

  function applyFilters() {
    const filtered = allLoadedEvents.filter(ev => {
      const matchCat  = !currentCategory   || ev.category === currentCategory;
      const matchDate = !currentDatePrefix || (ev.eventDate && ev.eventDate.startsWith(currentDatePrefix));
      return matchCat && matchDate;
    });
    renderEvents(filtered);
  }
}

// ============================================================
//  DETALLE DE EVENTO (event-detail.html)
// ============================================================
function getEventIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function showToastError(msg) {
  const toast = document.getElementById("toastError");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// Modal de confirmación — funciones globales (llamadas desde onclick en el HTML)
window.abrirModalConfirmacion = function () {
  const { userId } = getSession();
  if (!userId) {
    window.location.href = "auth.html";
    return;
  }
  const modal = document.getElementById("modalConfirmar");
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.cerrarModalConfirmacion = function () {
  if (inscriptionController) {
    inscriptionController.abort();
    inscriptionController = null;
  }
  const modal = document.getElementById("modalConfirmar");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
  const btn = document.getElementById("modalBtnConfirmar");
  if (btn) btn.classList.remove("loading");
};

window.confirmarInscripcion = async function () {
  const { userId, email } = getSession();
  const eventId = getEventIdFromUrl();
  const btn     = document.getElementById("modalBtnConfirmar");
  const detailTitle = document.getElementById("detailTitle");
  const eventName = detailTitle ? detailTitle.textContent : `Evento #${eventId}`;

  if (!userId || !eventId) {
    showToastError("Sesión inválida o evento no encontrado.");
    return;
  }

  if (btn) btn.classList.add("loading");

  try {
    // 1. Inscribirse al evento
    inscriptionController = new AbortController();
    const signal = inscriptionController.signal;
    const inscripResponse = await fetch(`${API_BASE}/inscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:  parseInt(userId),
        eventId: parseInt(eventId)
      }),
      signal
    });

    const inscripData = await readResponseData(inscripResponse);

    if (!inscripResponse.ok) {
      inscriptionController = null;
      if (btn) btn.classList.remove("loading");
      window.cerrarModalConfirmacion();
      showToastError(inscripData.message || "Error al inscribirse. Quizás ya estás inscrito o no hay cupos.");
      return;
    }

    // 2 + 3 en paralelo: descontar cupos + notificación/correo
    let spotsUpdated = true;
    try {
      const spotsResponse = await fetch(`${API_BASE}/events/${eventId}/decrease-spots`, {
        method: "PUT",
        signal
      });
      spotsUpdated = spotsResponse.ok;
    } catch {
      spotsUpdated = false;
    }

    let notificationSent = false;
    if (email) {
      try {
        const notificationResponse = await fetchWithTimeout(`${API_BASE}/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(userId),
            email: email,
            eventName: eventName,
            message: `Â¡Hola! Te confirmamos que tu inscripcion al evento ${eventName} ha sido completada exitosamente. Â¡Nos vemos alli!`
          })
        }, 8000);
        notificationSent = notificationResponse.ok;
      } catch {
        notificationSent = false;
      }
    }

    if (false) await Promise.all([
      fetch(`${API_BASE}/events/${eventId}/decrease-spots`, { method: "PUT", signal }).catch(() => {}),
      email ? fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          email: email,
          eventName: eventName,
          message: `¡Hola! Te confirmamos que tu inscripcion al evento ${eventName} ha sido completada exitosamente. ¡Nos vemos alli!`
        }),
        signal
      }).catch(() => {}) : Promise.resolve()
    ]);

    inscriptionController = null;
    if (btn) btn.classList.remove("loading");

    // Éxito — poblar y mostrar modal de éxito local
    window.cerrarModalConfirmacion();
    const successNombre = document.getElementById("successNombreEvento");
    const successCorreo = document.getElementById("successCorreo");
    const successEmailLabel = document.getElementById("successEmailLabel");
    const successNotice = document.getElementById("successNotice");
    if (successNombre) successNombre.textContent = eventName;
    if (successCorreo) successCorreo.textContent = email || "tu correo";
    if (successEmailLabel) {
      successEmailLabel.textContent = notificationSent
        ? "Correo enviado a"
        : "Inscripcion confirmada. Correo pendiente para";
    }
    if (successNotice) {
      const notices = [];
      if (email && !notificationSent) {
        notices.push("La notificacion se guardo, pero el correo no se confirmo a tiempo.");
      }
      if (!spotsUpdated) {
        notices.push("El conteo de cupos puede tardar unos segundos en reflejarse.");
      }
      successNotice.textContent = notices.join(" ");
    }

    const exitoModal = document.getElementById("modalExito");
    if (exitoModal) {
      exitoModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    // Actualizar los textos y elementos en detalle
    const inscribeBtn = document.getElementById("inscribirBtn");
    if(inscribeBtn) {
      inscribeBtn.textContent = "Ya estás inscrito";
      inscribeBtn.style.pointerEvents = "none";
      inscribeBtn.classList.add("btn-secondary");
    }
    const detailCapacity = document.getElementById("detailCapacity");
    if(detailCapacity) {
      let cap = parseInt(detailCapacity.textContent);
      if(!isNaN(cap) && cap > 0) {
        detailCapacity.textContent = cap - 1;
      }
    }

  } catch (err) {
    if (err && err.name === "AbortError") return; // cancelado por el usuario
    if (btn) btn.classList.remove("loading");
    window.cerrarModalConfirmacion();
    showToastError("Fallo de conexión con el servidor.");
  }
};

async function loadEventDetail() {
  const titleEl = document.getElementById("detailTitle");
  if (!titleEl) return;   // No estamos en event-detail.html

  const eventId = getEventIdFromUrl();

  const dateEl    = document.getElementById("detailDate");
  const locEl     = document.getElementById("detailLocation");
  const capEl     = document.getElementById("detailCapacity");
  const priceEl   = document.getElementById("detailPrice");        // ← ID correcto
  const imgEl     = document.getElementById("detailImage");
  const mapTextEl = document.getElementById("mapLocationText");
  const badgeEl   = document.getElementById("detailCategoryBadge");
  const btn       = document.getElementById("inscribirBtn");
  const modalNombreEvento = document.getElementById("modalNombreEvento");
  const modalCorreo       = document.getElementById("modalCorreo");

  if (!eventId) {
    titleEl.textContent = "Evento no encontrado";
    if (btn) btn.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`);
    const data = await readResponseData(response);

    if (!response.ok) throw new Error(data.message || "Error");

    titleEl.textContent = data.name;
    if (dateEl)    dateEl.textContent    = formatEventDate(data.eventDate);
    if (locEl)     locEl.textContent     = data.location;
    if (capEl)     capEl.textContent     = data.availableSpots;
    if (priceEl)   priceEl.textContent   = `RD$ ${data.price ?? 0}`;  // ← usa ID, no querySelector
    if (mapTextEl) mapTextEl.textContent = data.location;
    if (badgeEl)   badgeEl.textContent   = data.category || "Evento";

    if (imgEl && data.imageUrl) {
      imgEl.src = data.imageUrl;
    }

    // Poblar modales con datos del evento y del usuario logueado
    if (modalNombreEvento) modalNombreEvento.textContent = data.name;
    const userEmail = getSession().email || "tu correo registrado";
    if (modalCorreo) modalCorreo.textContent = userEmail;

  } catch {
    titleEl.textContent = "Error al cargar el evento";
    if (btn) btn.style.display = "none";
  }
}

// ============================================================
//  MIS EVENTOS (my-events.html)
// ============================================================
let userInscriptions = [];

async function loadMyEvents() {
  const myEventsGrid    = document.getElementById("myEventsGrid");
  const myEventsMessage = document.getElementById("myEventsMessage");
  const myEventsFilters = document.getElementById("myEventsFilters");
  if (!myEventsGrid || !myEventsMessage) return;

  const { userId } = getSession();

  if (!userId) {
    if (myEventsFilters) myEventsFilters.style.display = "none";
    myEventsMessage.innerHTML = `
      <h3>Inicia sesión para ver tus eventos</h3>
      <p style="margin-top:10px;color:var(--color-muted);">
        Necesitas una cuenta para tener una lista de eventos.
      </p>
      <a href="auth.html" class="v3-btn" style="display:inline-block;margin-top:20px;">
        Ir a Login
      </a>
    `;
    return;
  }

  try {
    // ← Endpoint correcto del inscrip-service
    const response = await fetch(`${API_BASE}/inscriptions/user/${userId}`);
    const inscripciones = await readResponseData(response);

    if (!response.ok) {
      myEventsGrid.innerHTML = "";
      myEventsGrid.style.display = "none";
      if (myEventsFilters) myEventsFilters.style.display = "none";
      myEventsMessage.innerHTML = "<h3>No se encontraron inscripciones.</h3>";
      return;
    }

    if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
      myEventsGrid.innerHTML = "";
      myEventsGrid.style.display = "none";
      if (myEventsFilters) myEventsFilters.style.display = "none";
      myEventsMessage.innerHTML = `
        <h3>🌴 Aún no tienes eventos inscritos.</h3>
        <a href="events.html" class="v3-btn" style="margin-top:15px;display:inline-block;">
          Explorar Eventos
        </a>
      `;
      return;
    }

    // Obtener detalles de cada evento en paralelo
    const eventIds = [...new Set(inscripciones.map(i => i.eventId))];
    const eventMap = {};
    await Promise.all(eventIds.map(async id => {
      try {
        const r = await fetch(`${API_BASE}/events/${id}`);
        if (!r.ok) return;
        const eventData = await readResponseData(r);
        if (eventData && !eventData.message) {
          eventMap[id] = eventData;
        }
      } catch { /* ignorar si falla uno */ }
    }));
    userInscriptions = inscripciones.map(i => ({ ...i, event: eventMap[i.eventId] || null }));

    updateFilterCounts(userInscriptions);
    renderMyEvents(userInscriptions);
    if (myEventsFilters) myEventsFilters.style.display = "flex";
    myEventsGrid.style.display   = "grid";
    myEventsMessage.style.display = "none";

  } catch {
    myEventsGrid.innerHTML = "";
    myEventsGrid.style.display = "none";
    if (myEventsFilters) myEventsFilters.style.display = "none";
    myEventsMessage.innerHTML = "<h3>Error de conexión. ¿Está encendido el servidor?</h3>";
  }
}

function updateFilterCounts(inscriptions) {
  const cntAll       = document.getElementById("cntAll");
  const cntConfirmed = document.getElementById("cntConfirmed");
  const cntPending   = document.getElementById("cntPending");
  const cntCancelled = document.getElementById("cntCancelled");

  if (cntAll)       cntAll.textContent       = inscriptions.length;
  if (cntConfirmed) cntConfirmed.textContent = inscriptions.filter(i => i.status === "CONFIRMED").length;
  if (cntPending)   cntPending.textContent   = inscriptions.filter(i => i.status === "PENDING").length;
  if (cntCancelled) cntCancelled.textContent = inscriptions.filter(i => i.status === "CANCELLED").length;
}

function getStatusBadge(status) {
  const map = {
    CONFIRMED: `<span class="v3-btn" style="background:#D4EDDA;color:#155724;border:none;pointer-events:none;">✅ Confirmado</span>`,
    PENDING:   `<span class="v3-btn" style="background:#FFF3CD;color:#856404;border:none;pointer-events:none;">⏳ Pendiente</span>`,
    CANCELLED: `<span class="v3-btn" style="background:#F8D7DA;color:#721C24;border:none;pointer-events:none;">❌ Cancelado</span>`,
  };
  return map[status] || `<span class="v3-btn" style="pointer-events:none;">Inscrito</span>`;
}

function renderMyEvents(items) {
  const myEventsGrid = document.getElementById("myEventsGrid");
  if (!myEventsGrid) return;

  if (items.length === 0) {
    myEventsGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">No hay eventos en esta categoría.</p>`;
    return;
  }

  myEventsGrid.innerHTML = items.map(inscrip => {
    const evName     = inscrip.event?.name     || `Evento #${inscrip.eventId}`;
    const evLocation = inscrip.event?.location || "Punta Cana";
    const evImg      = inscrip.event?.imageUrl
      || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
    const evDate     = inscrip.event?.eventDate
      ? formatEventDate(inscrip.event.eventDate)
      : formatEventDate(inscrip.inscriptionDate);

    return `
      <article class="event-card-v3" style="border:1px solid var(--color-border);">
        <img src="${evImg}"
             alt="${evName}"
             onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop'">
        <div class="event-card-body-v3">
          <p class="v3-meta" style="font-size:.8rem;color:var(--color-primary)">📌 Ref: ${inscrip.id}</p>
          <h3 class="v3-title">${evName}</h3>
          <p class="v3-meta">📅 ${evDate}</p>
          <p class="v3-meta">📍 ${evLocation}</p>
          <div class="v3-action-group">
            <div class="v3-action">${getStatusBadge(inscrip.status)}</div>
            ${inscrip.event ? `<a href="event-detail.html?id=${inscrip.event.id}" class="v3-btn my-events-link">Ver detalle</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

window.filtrarMisEventos = function (status, btnElement) {
  document.querySelectorAll(".my-filter-pill").forEach(b => b.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderMyEvents(status === "ALL" ? userInscriptions : userInscriptions.filter(i => i.status === status));
};

// ============================================================
//  PERFIL (perfil.html)
// ============================================================
const profileForm = document.getElementById("profileForm");

let userProfileId = null;

if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = profileForm.querySelector("button[type='submit']");
    if(btn) { btn.textContent = "Guardando..."; btn.disabled = true; }
    
    const { userId } = getSession();
    
    const payload = {
      authUserId: parseInt(userId),
      nombre: document.getElementById("profName").value,
      apellido: document.getElementById("profLastName").value,
      telefono: document.getElementById("profPhone").value,
      direccion: document.getElementById("profAddress").value,
      genero: document.getElementById("profGender").value,
      fechaNacimiento: document.getElementById("profDob").value || null,
      fotoPerfil: document.getElementById("profAvatarUrl").value || null
    };

    try {
      let response;
      if (userProfileId) { // update profile
        response = await fetch(`${API_BASE}/users/${userProfileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else { // create profile
        response = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      
      if(response.ok) {
        const data = await readResponseData(response);
        userProfileId = data.id;
        // Actualizar vista de solo lectura con los nuevos datos
        const setView = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || "—"; };
        setView("viewName",     document.getElementById("profName").value);
        setView("viewLastName", document.getElementById("profLastName").value);
        setView("viewPhone",    document.getElementById("profPhone").value);
        setView("viewAddress",  document.getElementById("profAddress").value);
        setView("viewGender",   document.getElementById("profGender").value);
        setView("viewDob",      document.getElementById("profDob").value);
        // Volver a vista de solo lectura
        window.cancelarEdicion();
        alert("¡Perfil guardado correctamente!");
      } else {
        alert("Error al guardar perfil.");
      }
    } catch(err) {
      alert("Error de conexión al guardar perfil.");
    }
    
    if(btn) { btn.textContent = "Guardar Cambios"; btn.disabled = false; }
  });
}

// Pre-cargar datos del usuario en el formulario de perfil
async function prefillProfileForm() {
  if (!profileForm) return;
  const { userId, username } = getSession();
  const nameInput = document.getElementById("profName");
  
  if (nameInput && username) nameInput.value = username;
  
  try {
    const response = await fetch(`${API_BASE}/users/auth/${userId}`);
    if (response.ok) {
      const data = await readResponseData(response);
      userProfileId = data.id;
      // Llenar inputs del formulario de edición
      if (data.nombre)          nameInput.value = data.nombre;
      if (data.apellido)        document.getElementById("profLastName").value  = data.apellido;
      if (data.telefono)        document.getElementById("profPhone").value     = data.telefono;
      if (data.direccion)       document.getElementById("profAddress").value   = data.direccion;
      if (data.genero)          document.getElementById("profGender").value    = data.genero;
      if (data.fechaNacimiento) document.getElementById("profDob").value       = data.fechaNacimiento;
      if (data.fotoPerfil)      document.getElementById("profAvatarUrl").value = data.fotoPerfil;
      // Llenar vista de sólo lectura
      const setView = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || "—"; };
      setView("viewName",     data.nombre);
      setView("viewLastName", data.apellido);
      setView("viewPhone",    data.telefono);
      setView("viewAddress",  data.direccion);
      setView("viewGender",   data.genero);
      setView("viewDob",      data.fechaNacimiento);
    }
  } catch(e) {
    console.error("Error al obtener perfil", e);
  }
}

window.activarEdicion = function() {
  const view = document.getElementById("profileView");
  const form = document.getElementById("profileForm");
  if (view) view.style.display = "none";
  if (form) form.style.display = "";
};

window.cancelarEdicion = function() {
  const view = document.getElementById("profileView");
  const form = document.getElementById("profileForm");
  if (form) form.style.display = "none";
  if (view) view.style.display = "";
};

// ============================================================
//  LANDING PAGE: EVENTOS DESTACADOS (index.html)
// ============================================================
async function loadFeaturedEvents() {
  const miniList = document.querySelector(".hero-mini-list");
  const gridList = document.querySelector(".featured-section .cards-grid");
  
  try {
    const response = await fetch(`${API_BASE}/events`);
    if(response.ok) {
      const allEvents = await readResponseData(response);
      
      if(Array.isArray(allEvents) && allEvents.length > 0) {
        
        // 1. Proximos eventos (hero-mini-list)
        if(miniList) {
          const colors = ["orange", "teal", "cream"];
          miniList.innerHTML = allEvents.slice(0, 3).map((ev, i) => `
            <article class="hero-mini-item">
              <span class="hero-dot hero-dot-${colors[i % 3]}"></span>
              <div>
                <h3>${ev.name || "Evento destacado"}</h3>
                <p>📅 ${formatEventDate(ev.eventDate)} · 📍 ${ev.location}</p>
              </div>
            </article>
          `).join("");
        }

        // 2. Eventos destacados (cards-grid)
        if(gridList) {
          gridList.innerHTML = allEvents.slice(0, 3).map(ev => {
            const img = ev.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
            return `
            <article class="event-card">
              <img src="${img}" alt="${ev.name}" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop'">
              <div class="event-card-content">
                <span class="event-pill">${ev.category || "Experiencia"}</span>
                <h3 class="event-card-title">${ev.name}</h3>
                <p class="event-card-meta">📍 ${ev.location} · 📅 ${formatEventDate(ev.eventDate)}</p>
                <div style="margin-bottom:10px;font-size:14px;color:var(--color-primary)">👥 Cupos: ${ev.availableSpots} | RD$ ${ev.price ?? 0}</div>
                <a href="event-detail.html?id=${ev.id}" class="btn">Ver detalle</a>
              </div>
            </article>
            `;
          }).join("");
        }
      }
    }
  } catch(e) { console.error("Error cargando destacados en index", e); }
}

// ============================================================
//  INICIALIZACIÓN — ejecutar según la página actual
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();   // ← siempre, en todas las páginas

  const page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "index.html" || page === "") loadFeaturedEvents();
  if (page === "events.html")       loadEvents();
  if (page === "event-detail.html") loadEventDetail();
  if (page === "my-events.html")    loadMyEvents();
  if (page === "perfil.html")       prefillProfileForm();

  // Si está en auth.html y ya tiene sesión, redirigir directo
  if (page === "auth.html" && getSession().userId) {
    window.location.href = "my-events.html";
  }
});
