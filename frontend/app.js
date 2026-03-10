const showLoginBtn = document.getElementById("showLogin");
const showRegisterBtn = document.getElementById("showRegister");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const authMessage = document.getElementById("authMessage");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const eventsGrid = document.getElementById("eventsGrid");
const eventsMessage = document.getElementById("eventsMessage");

const API_BASE = "http://localhost:8080";

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

async function readResponseData(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

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

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !email || !password) {
      showMessage("Completa todos los campos del registro.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        showMessage(data.message || "No se pudo completar el registro.", "error");
        return;
      }

      sessionStorage.setItem("authUserId", data.userId);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("email", data.email);

      showMessage("Registro exitoso. Ya puedes continuar.", "success");
    } catch (error) {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage("Completa email y password para iniciar sesion.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        showMessage(data.message || "Credenciales invalidas.", "error");
        return;
      }

      sessionStorage.setItem("authUserId", data.userId);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("email", data.email);

      showMessage("Login exitoso. Redirigiendo...", "success");
      
      // Esperar 1 segundo y redirigir a mis eventos
      setTimeout(() => {
        window.location.href = "my-events.html";
      }, 1000);
    } catch (error) {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  });
}

function formatEventDate(dateValue) {
  if (!dateValue) return "Fecha pendiente";

  const date = new Date(dateValue);

  return date.toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function createEventCard(event) {
  return `
    <article class="event-card-v3" data-category="${event.category}" data-date="${formatEventDate(event.eventDate)}">
      <img src="${event.imageUrl}" alt="${event.name}">
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


async function loadEvents() {
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
      eventsMessage.textContent = "Todavia no hay eventos disponibles.";
      return;
    }

    eventsGrid.innerHTML = data.map(createEventCard).join("");
    eventsMessage.textContent = "";
  } catch (error) {
    eventsGrid.innerHTML = "";
    eventsMessage.textContent = "No se pudo conectar con el servicio de eventos.";
  }
}

loadEvents();

/* === LÓGICA DEL DETALLE DE EVENTO === */
function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadEventDetail() {
  const eventId = getEventIdFromUrl();
  const titleEl = document.getElementById("detailTitle");
  
  // Si no estamos en la página de detalle (no existe el título base), salir
  if (!titleEl) return;

  const dateEl = document.getElementById("detailDate");
  const locEl = document.getElementById("detailLocation");
  const capEl = document.getElementById("detailCapacity");
  const imgEl = document.getElementById("detailImage");
  const mapTextEl = document.getElementById("mapLocationText");
  const btn = document.getElementById("inscribirBtn");
  const msgEl = document.getElementById("inscriptionMsg");

  if (!eventId) {
    titleEl.textContent = "Evento no encontrado";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`);
    const data = await readResponseData(response);

    if (!response.ok) throw new Error(data.message || "Error");

    titleEl.textContent = data.name;
    dateEl.innerHTML = formatEventDate(data.eventDate);
    locEl.textContent = data.location;
    capEl.textContent = data.availableSpots;
    mapTextEl.textContent = data.location;
    
    // Actualizar precio
    const priceEl = document.querySelector(".detail-specs-v3 p:nth-child(4)");
    if (priceEl && data.price !== undefined) {
      priceEl.innerHTML = `<strong>Precio:</strong> RD$ ${data.price ?? 0}`;
    }
    
    if (data.imageUrl) {
      imgEl.src = data.imageUrl;
    }

    // Lógica del botón de inscripción
    btn.addEventListener("click", () => {
      const authUserId = sessionStorage.getItem("authUserId");
      if (!authUserId) {
        window.location.href = "auth.html";
        return;
      }
      msgEl.textContent = "¡Inscripción exitosa!";
      msgEl.style.color = "var(--color-primary)";
    });

  } catch (error) {
    titleEl.textContent = "Error al cargar el evento";
    msgEl.textContent = "Verifica la conexión con el servidor.";
    msgEl.style.color = "red";
  }
}

// Ejecutar carga de detalle
loadEventDetail();

/* === LÓGICA DE "MIS EVENTOS" (my-events.html) === */
async function loadMyEvents() {
  const myEventsGrid = document.getElementById("myEventsGrid");
  const myEventsMessage = document.getElementById("myEventsMessage");
  
  if (!myEventsGrid || !myEventsMessage) return;

  const authUserId = sessionStorage.getItem("authUserId");
  
  if (!authUserId) {
    myEventsMessage.innerHTML = `
      <h3>Inicia sesión para ver tus eventos</h3>
      <p style="margin-top: 10px; color: var(--color-muted);">Necesitas una cuenta para tener una lista de eventos.</p>
      <a href="auth.html" class="v3-btn" style="display: inline-block; margin-top: 20px;">Ir a Login</a>
    `;
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/events`);
    const allEvents = await readResponseData(response);

    if (!response.ok || !Array.isArray(allEvents) || allEvents.length === 0) {
      myEventsGrid.innerHTML = "";
      myEventsMessage.innerHTML = "<h3>No se encontraron eventos.</h3>";
      return;
    }

    const misEventosSimulados = [allEvents[0]]; 

    myEventsGrid.innerHTML = misEventosSimulados.map(eventItem => {
      return `
        <article class="event-card-v3" style="border: 2px solid var(--color-secondary);">
          <img src="${eventItem.imageUrl}" alt="${eventItem.name}">
          <div class="event-card-body-v3">
            <h3 class="v3-title">${eventItem.name}</h3>
            <p class="v3-meta">📅 Date: ${formatEventDate(eventItem.eventDate)}</p>
            <p class="v3-meta">📍 ${eventItem.location}</p>
            <div class="v3-action">
              <span class="v3-btn" style="background: var(--color-secondary); color: var(--color-dark); pointer-events: none;">✓ INSCRITO</span>
            </div>
          </div>
        </article>
      `;
    }).join("");
    
    myEventsMessage.style.display = "none";

  } catch (error) {
    myEventsGrid.innerHTML = "";
    myEventsMessage.innerHTML = "<h3>Error de conexión. ¿Está encendido el servidor?</h3>";
  }
}

// Ejecutar carga de mis eventos
loadMyEvents();

/* === ACTUALIZAR BARRA DE NAVEGACIÓN (SI HAY SESIÓN) === */
function updateNavbar() {
  const userNavActions = document.getElementById("userNavActions");
  const authUserId = sessionStorage.getItem("authUserId");
  const username = sessionStorage.getItem("username");

  if (authUserId && userNavActions) {
    // Si el usuario está logueado, cambiamos el botón por su Perfil
    userNavActions.innerHTML = `
      <a href="perfil.html" class="nav-login" style="background: var(--color-primary); color: white; border-radius: 999px; padding: 8px 20px;">
        👤 Hola, ${username}
      </a>
    `;
  }
}

/* === FUNCIONALIDAD DE PERFIL === */
const logoutBtn = document.getElementById("logoutBtn");
const profileForm = document.getElementById("profileForm");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Limpiar sesión
    sessionStorage.clear();
    
    // Redirigir a index.html
    window.location.href = "index.html";
  });
}

if (profileForm) {
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para guardar cambios
    alert("Perfil actualizado correctamente");
  });
}

// Actualizar navbar con nombre de usuario
function updateNavbar() {
  const userNavActions = document.getElementById("userNavActions");
  const authUserId = sessionStorage.getItem("authUserId");
  const username = sessionStorage.getItem("username");

  if (authUserId && userNavActions) {
    // Si el usuario está logueado, cambiamos el botón por su Perfil
    userNavActions.innerHTML = `
      <a href="perfil.html" class="nav-login" style="background: var(--color-primary); color: white; border-radius: 999px; padding: 8px 20px;">
        👤 Hola, ${username}
      </a>
    `;
  }
}
