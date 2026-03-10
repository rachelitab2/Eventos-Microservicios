// ==================================================================
//  Auth Service — Manejo de autenticación en el frontend
//  Guarda/lee el token JWT del localStorage
// ==================================================================

const Auth = {
    _key: 'em_auth',

    getToken() {
        return this.getUser()?.token || null;
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem(this._key));
        } catch {
            return null;
        }
    },

    setUser(data) {
        localStorage.setItem(this._key, JSON.stringify(data));
    },

    logout() {
        localStorage.removeItem(this._key);
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    getRole() {
        return this.getUser()?.role || null;
    },

    isOrganizer() {
        const role = this.getRole();
        return role === 'ORGANIZER' || role === 'ADMIN';
    },

    isAdmin() {
        return this.getRole() === 'ADMIN';
    }
};
