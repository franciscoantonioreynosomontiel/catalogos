// Authentication Service for Wisbe Platform
// NOTE FOR SUPABASE AUTH INTEGRATION:
// Currently this module handles the requested temporary admin auth ('Antonio' / '12345') and client login.
// In the near future, replace `login` and `logout` implementations below with:
// await supabase.auth.signInWithPassword({ email, password })

const AUTH_STORAGE_KEY = 'wisbe_auth_session';

class WisbeAuth {
    constructor() {
        this.session = this.getSession();
    }

    getSession() {
        try {
            const data = localStorage.getItem(AUTH_STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Authenticate user with temporary credentials or client email.
     * Temporary Admin: username/email "Antonio" and password "12345"
     */
    login(usernameOrEmail, password) {
        const identifier = usernameOrEmail.trim();

        // 1. Temporary Admin Check
        if (identifier.toLowerCase() === 'antonio' && password === '12345') {
            const sessionData = {
                user: {
                    id: 'admin-01',
                    name: 'Antonio (Admin)',
                    email: 'antonio@wisbe.com',
                    role: 'admin' // admin can access all clients and admin control panel
                },
                token: 'temp-token-admin-' + Date.now()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
            this.session = sessionData;
            return { success: true, role: 'admin', user: sessionData.user };
        }

        // 2. Client Login Check (Using business email or business slug)
        const businesses = window.wisbeDB ? window.wisbeDB.getBusinesses() : [];
        const foundBiz = businesses.find(b =>
            b.owner_email.toLowerCase() === identifier.toLowerCase() ||
            b.slug.toLowerCase() === identifier.toLowerCase()
        );

        if (foundBiz && password === '12345') { // Simple default pwd for client demo
            const sessionData = {
                user: {
                    id: 'client-' + foundBiz.id,
                    name: foundBiz.name,
                    email: foundBiz.owner_email,
                    business_id: foundBiz.id,
                    role: 'client'
                },
                token: 'temp-token-client-' + Date.now()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
            this.session = sessionData;
            if (window.wisbeDB) {
                window.wisbeDB.setActiveBusinessId(foundBiz.id);
            }
            return { success: true, role: 'client', user: sessionData.user };
        }

        return { success: false, error: 'Credenciales inválidas' };
    }

    logout() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        this.session = null;
        window.location.reload();
    }

    isAuthenticated() {
        return !!this.session;
    }

    isAdmin() {
        return this.session?.user?.role === 'admin';
    }

    getCurrentUser() {
        return this.session?.user || null;
    }
}

window.wisbeAuth = new WisbeAuth();
