const showLoginBtn = document.getElementById("showLogin");
const showRegisterBtn = document.getElementById("showRegister");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const authMessage = document.getElementById("authMessage");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

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

      showMessage("Login exitoso.", "success");
    } catch (error) {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  });
}
