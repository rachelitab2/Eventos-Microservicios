// ==================================================================
//  App.js — Orquestador principal del frontend
//  Maneja navegación, formularios, estado global y UI
// ==================================================================

// ---- NAVEGACIÓN ----
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.add('active');
    } else {
        console.error(`Página no encontrada: ${page}`);
        return;
    }

    // Actualizar links activos en nav
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });

    window.scrollTo(0, 0);

    // Cargar datos según la página
    if (page === 'events') loadEvents();
    if (page === 'my-events') loadMyEvents();
    if (page === 'home') loadStats();
}

// ---- TOAST (Notificaciones visuales) ----
function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Eliminar después de 3.5s
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ---- UI: Actualizar barra de navegación según el estado de Auth ----
function updateNav() {
    const user = Auth.getUser();
    const isLoggedIn = !!user;
    const isOrganizer = Auth.isOrganizer();

    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const myEventsLink = document.getElementById('myEventsLink');
    const createEventLink = document.getElementById('createEventLink');

    if (authButtons) authButtons.style.display = isLoggedIn ? 'none' : 'flex';
    if (userMenu) userMenu.style.display = isLoggedIn ? 'flex' : 'none';
    if (myEventsLink) myEventsLink.style.display = isLoggedIn ? '' : 'none';
    if (createEventLink) createEventLink.style.display = isOrganizer ? '' : 'none';

    if (user && userMenu) {
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        if (avatar) avatar.textContent = (user.username || 'U')[0].toUpperCase();
        if (name) name.textContent = user.username;
    }
}

// ---- CARGAR EVENTOS ----
let currentCategoryFilter = '';
let searchDebounceTimeout = null;

async function loadEvents(category = currentCategoryFilter, keyword = '') {
    const container = document.getElementById('eventsGrid');
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Cargando eventos...</p></div>`;

    try {
        const params = {};
        if (keyword) params.keyword = keyword;
        else if (category) params.category = category;

        const events = await Api.events.list(params);
        renderEventList(events || [], 'eventsGrid');
    } catch (err) {
        container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>${err.message}</p>
        <button class="btn btn-outline btn-sm" onclick="loadEvents()">Reintentar</button>
      </div>
    `;
    }
}

// ---- CARGAR MIS EVENTOS (asistente) ----
async function loadMyEvents() {
    const container = document.getElementById('myEventsGrid');
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Cargando tus eventos...</p></div>`;

    try {
        const events = await Api.events.myRegistrations();
        renderEventList(events || [], 'myEventsGrid');
    } catch (err) {
        container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔐</span>
        <p>Inicia sesión para ver tus inscripciones.</p>
      </div>
    `;
    }
}

// ---- CARGAR STATS PARA HOME ----
async function loadStats() {
    try {
        const events = await Api.events.list({});
        const count = events?.length || 0;
        const el = document.getElementById('statEvents');
        if (el) animateNumber(el, count);
    } catch (_) { }
}

function animateNumber(el, target) {
    let current = 0;
    if (target === 0) { el.textContent = '0'; return; }
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(interval);
    }, 30);
}

// ---- EVENT LISTENERS: FORMULARIOS ----

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const errDiv = document.getElementById('loginError');
        if (errDiv) errDiv.style.display = 'none';

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Iniciando sesión...';

        try {
            const data = await Api.auth.login({
                usernameOrEmail: document.getElementById('loginUser').value.trim(),
                password: document.getElementById('loginPass').value
            });

            if (data?.token) {
                Auth.setUser(data);
                updateNav();
                showToast(`¡Bienvenido de vuelta, ${data.username}! 👋`, 'success');
                navigate('events');
            }
        } catch (err) {
            if (errDiv) {
                errDiv.textContent = err.message;
                errDiv.style.display = 'block';
            }
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// Registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        const errDiv = document.getElementById('registerError');
        if (errDiv) errDiv.style.display = 'none';

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Creando cuenta...';

        const role = document.querySelector('input[name="role"]:checked')?.value || 'USER';

        try {
            const data = await Api.auth.register({
                username: document.getElementById('regUsername').value.trim(),
                email: document.getElementById('regEmail').value.trim(),
                password: document.getElementById('regPass').value,
                fullName: document.getElementById('regFullName').value.trim(),
                role: role
            });

            if (data?.token) {
                Auth.setUser(data);
                updateNav();
                showToast(`¡Cuenta creada! Bienvenido/a, ${data.username} 🎉`, 'success');
                navigate('events');
            }
        } catch (err) {
            if (errDiv) {
                errDiv.textContent = err.message;
                errDiv.style.display = 'block';
            }
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// Crear Evento
const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('createEventBtn');
        const errDiv = document.getElementById('createEventError');
        if (errDiv) errDiv.style.display = 'none';

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Creando evento...';

        try {
            const event = await Api.events.create({
                title: document.getElementById('evTitle').value.trim(),
                category: document.getElementById('evCategory').value,
                capacity: parseInt(document.getElementById('evCapacity').value),
                startDate: document.getElementById('evStartDate').value,
                endDate: document.getElementById('evEndDate').value,
                location: document.getElementById('evLocation').value.trim(),
                description: document.getElementById('evDescription').value.trim()
            });

            if (event) {
                showToast('✅ Evento creado correctamente como borrador.', 'success');
                createEventForm.reset();
                navigate('events'); // O a una página de "Mis Eventos Creados" si existiera
            }
        } catch (err) {
            if (errDiv) {
                errDiv.textContent = err.message;
                errDiv.style.display = 'block';
            }
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// ---- FILTROS Y BÚSQUEDA ----

// Chips de categorías
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategoryFilter = chip.dataset.category;
        loadEvents(currentCategoryFilter);
    });
});

// Input de búsqueda
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            loadEvents('', e.target.value.trim());
        }, 400);
    });
}

// ---- LOGOUT ----
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Auth.logout();
        updateNav();
        showToast('Sesión cerrada correctamente.', 'info');
        navigate('home');
    });
}

// ---- OTROS LISTENERS ----

// Navegación via [data-page]
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    // No navegar si es un botón dentro de un modal que tiene otra lógica
    if (btn && !btn.closest('.modal-footer')) {
        e.preventDefault();
        navigate(btn.dataset.page);
    }
});

// Toggle contraseña
document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
        const inputId = btn.dataset.target;
        const input = document.getElementById(inputId);
        if (input) {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.textContent = isPassword ? '🙈' : '👁';
        }
    });
});

// Cerrar modal
const modalClose = document.getElementById('modalClose');
if (modalClose) {
    modalClose.addEventListener('click', () => {
        const modal = document.getElementById('eventModal');
        if (modal) modal.style.display = 'none';
    });
}

// Cerrar modal al hacer click fuera
window.addEventListener('click', (e) => {
    const modal = document.getElementById('eventModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Navbar scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    }
});

// ---- INICIALIZACIÓN ----
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    // Determinar página inicial (por defecto home)
    navigate('home');
});
