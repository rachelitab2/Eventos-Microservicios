// ==================================================================
//  Events Component — Renderizado de tarjetas y modal de eventos
// ==================================================================

const CATEGORY_ICONS = {
    CONFERENCE: '🎤',
    WORKSHOP: '🛠️',
    CONCERT: '🎵',
    SPORT: '⚽',
    NETWORKING: '🤝',
    EXHIBITION: '🖼️',
    WEBINAR: '💻',
    OTHER: '📅'
};

const CATEGORY_LABELS = {
    CONFERENCE: 'Conferencia',
    WORKSHOP: 'Workshop',
    CONCERT: 'Concierto',
    SPORT: 'Deporte',
    NETWORKING: 'Networking',
    EXHIBITION: 'Exposición',
    WEBINAR: 'Webinar',
    OTHER: 'Otro'
};

const STATUS_LABELS = {
    PUBLISHED: 'Disponible',
    FULL: 'Completo',
    CANCELLED: 'Cancelado',
    DRAFT: 'Borrador',
    FINISHED: 'Finalizado'
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCapacityPercent(event) {
    if (!event.capacity) return 0;
    return Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
}

// ---- Renderiza una tarjeta de evento ----
function renderEventCard(event) {
    const pct = getCapacityPercent(event);
    const isFull = event.status === 'FULL';
    const isCancelled = event.status === 'CANCELLED';
    const icon = CATEGORY_ICONS[event.category] || '📅';
    const categoryLabel = CATEGORY_LABELS[event.category] || event.category;

    return `
    <div class="event-card" data-id="${event.id}">
      <div class="event-card-header">
        <span class="event-category-badge badge-${event.category}">
          ${icon} ${categoryLabel}
        </span>
        <h3 class="event-title">${event.title}</h3>
        <span class="event-organizer">Por ${event.organizerName || 'Organizador'}</span>
      </div>
      <div class="event-card-body">
        <div class="event-meta">
          <div class="event-meta-item"><span class="icon">📅</span>${formatDateShort(event.startDate)}</div>
          <div class="event-meta-item"><span class="icon">📍</span>${event.location}</div>
          <div class="event-meta-item"><span class="icon">👥</span>${event.registeredCount}/${event.capacity} inscritos</div>
        </div>
      </div>
      <div class="event-card-footer">
        <div class="capacity-bar-wrap">
          <div class="capacity-label">${event.availableSpots} lugares disponibles</div>
          <div class="capacity-bar">
            <div class="capacity-fill ${isFull ? 'full' : ''}" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="event-status-badge status-${event.status}">${STATUS_LABELS[event.status] || event.status}</span>
      </div>
    </div>
  `;
}

// ---- Renderiza la lista de eventos en un contenedor ----
function renderEventList(events, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎫</span>
        <p>No hay eventos disponibles.</p>
      </div>
    `;
        return;
    }

    container.innerHTML = events.map(renderEventCard).join('');

    // Añadir listeners para abrir el modal al hacer click
    container.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => openEventModal(card.dataset.id));
    });
}

// ---- Modal de detalle de evento ----
async function openEventModal(eventId) {
    const modal = document.getElementById('eventModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Cargando...</p></div>`;
    modal.style.display = 'flex';

    try {
        const event = await Api.events.getById(eventId);
        if (!event) return;

        const pct = getCapacityPercent(event);
        const icon = CATEGORY_ICONS[event.category] || '📅';
        const user = Auth.getUser();
        const isLoggedIn = Auth.isLoggedIn();
        const isFull = event.status === 'FULL';
        const isCancelled = event.status === 'CANCELLED';

        content.innerHTML = `
      <div>
        <span class="event-category-badge badge-${event.category}" style="margin-bottom:1rem;display:inline-flex">
          ${icon} ${CATEGORY_LABELS[event.category] || event.category}
        </span>
        <h2 class="modal-title">${event.title}</h2>
        <div class="modal-meta">
          <div class="modal-meta-item">📅 <strong>Inicio:</strong> ${formatDate(event.startDate)}</div>
          <div class="modal-meta-item">🔚 <strong>Fin:</strong> ${formatDate(event.endDate)}</div>
          <div class="modal-meta-item">📍 <strong>Lugar:</strong> ${event.location}</div>
          <div class="modal-meta-item">👥 <strong>Inscritos:</strong> ${event.registeredCount} / ${event.capacity}</div>
          <div class="modal-meta-item">🎯 <strong>Organizador:</strong> ${event.organizerName || '—'}</div>
        </div>
        <p class="modal-desc">${event.description}</p>
        <div class="capacity-bar" style="margin-bottom:1.5rem">
          <div class="capacity-fill ${isFull ? 'full' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="modal-footer">
          ${!isLoggedIn ? `
            <button class="btn btn-ghost" id="modal-close-btn">Cerrar</button>
            <button class="btn btn-primary" data-page="login">Inicia sesión para inscribirte</button>
          ` : isCancelled ? `
            <span class="event-status-badge status-CANCELLED">Evento cancelado</span>
          ` : isFull ? `
            <span class="event-status-badge status-FULL">Evento completo</span>
          ` : `
            <button class="btn btn-ghost" id="modal-close-btn">Cerrar</button>
            <button class="btn btn-primary" id="registerEventBtn" data-event-id="${event.id}">
              🎫 Inscribirme
            </button>
          `}
        </div>
      </div>
    `;

        // Botón inscribirse
        const regBtn = document.getElementById('registerEventBtn');
        if (regBtn) {
            regBtn.addEventListener('click', () => handleRegisterToEvent(event.id, user));
        }

        // Botón cerrar dentro del modal
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Bot de [data-page] dentro del modal
        content.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', () => { closeModal(); navigate(el.dataset.page); });
        });

    } catch (err) {
        content.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
    }
}

// ---- Inscripción al evento ----
async function handleRegisterToEvent(eventId, user) {
    const btn = document.getElementById('registerEventBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Inscribiendo...'; }

    try {
        await Api.events.register(eventId, {
            userName: user.username,
            userEmail: user.email
        });
        showToast('✅ ¡Te has inscrito correctamente!', 'success');
        closeModal();
        // Actualizar mi lista y el listado general
        loadEvents();
    } catch (err) {
        showToast(`❌ ${err.message}`, 'error');
        if (btn) { btn.disabled = false; btn.textContent = '🎫 Inscribirme'; }
    }
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
}
