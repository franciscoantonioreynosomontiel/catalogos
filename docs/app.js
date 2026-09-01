/**
 * Wisbe App Logic & Multi-tenant Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Session Check
    const user = window.wisbeAuth.getCurrentUser();
    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (!user) {
        if (loginView) loginView.style.display = 'flex';
        if (appView) appView.style.display = 'none';
        setupLoginForm();
        return;
    }

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.style.display = 'flex';

    // Update Header / Sidebar Auth Info
    document.getElementById('sidebar-user-name').textContent = user.username;
    document.getElementById('user-role-badge').textContent = user.role.toUpperCase();

    // 2. Navigation Handling
    setupNavigation();

    // 3. Render Active Client
    refreshActiveClientUI();

    // 4. Setup Section Forms & Action Handlers
    setupClientSection();
    setupUsersSection();
    setupCatalogSection();
    setupLandingSection();
    setupWidgetsSection();

    // Setup Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        window.wisbeAuth.logout();
    });
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;

        const res = window.wisbeAuth.login(u, p);
        if (res.success) {
            window.location.reload();
        } else {
            const err = document.getElementById('login-error');
            if (err) err.style.display = 'block';
        }
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetNav = link.getAttribute('data-nav');
            if (!targetNav) return;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all sections
            document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');

            // Show target section
            const targetSec = document.getElementById(`section-${targetNav}`);
            if (targetSec) targetSec.style.display = 'block';

            // Update page title
            const pageTitle = link.textContent.trim();
            document.getElementById('current-page-title').textContent = pageTitle;

            // Trigger specific section refreshes
            if (targetNav === 'clientes') renderClientsTable();
            if (targetNav === 'usuarios') renderUsersTable();
            if (targetNav === 'catalogo') renderCatalogEditor();
            if (targetNav === 'landing') renderLandingEditor();
            if (targetNav === 'widgets') renderWidgetsInfo();
        });
    });
}

function refreshActiveClientUI() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const activeBiz = window.wisbeDB.getBusinessById(activeId);

    if (activeBiz) {
        document.getElementById('sidebar-active-client-name').textContent = activeBiz.name;
        document.getElementById('top-active-client-name').textContent = activeBiz.name;
        document.getElementById('preview-client-label').textContent = activeBiz.name;
    } else {
        document.getElementById('sidebar-active-client-name').textContent = 'Ninguno';
        document.getElementById('top-active-client-name').textContent = 'Ninguno';
    }
}

/* ---------------- CLIENTS SECTION ---------------- */
function setupClientSection() {
    renderClientsTable();

    const btnNew = document.getElementById('btn-open-create-client');
    const cardForm = document.getElementById('card-create-client');
    const btnCancel = document.getElementById('btn-cancel-client');
    const form = document.getElementById('form-create-client');

    btnNew.addEventListener('click', () => { cardForm.style.display = 'block'; });
    btnCancel.addEventListener('click', () => { cardForm.style.display = 'none'; form.reset(); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('client-input-name').value;
        const category = document.getElementById('client-input-category').value;
        const phone = document.getElementById('client-input-phone').value;
        const email = document.getElementById('client-input-email').value;

        window.wisbeDB.addBusiness({
            name,
            category,
            whatsapp: phone,
            email
        });

        form.reset();
        cardForm.style.display = 'none';
        renderClientsTable();
    });
}

function renderClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    const businesses = window.wisbeDB.getBusinesses();
    const activeId = window.wisbeDB.getActiveBusinessId();

    tbody.innerHTML = businesses.map(b => {
        const isActive = b.id == activeId;
        return `
            <tr>
                <td>#${b.id}</td>
                <td><strong>${b.name}</strong></td>
                <td>${b.category || 'General'}</td>
                <td>${b.whatsapp || '-'}</td>
                <td>${isActive ? '<span class="badge badge-admin">ACTIVO</span>' : '<span class="badge badge-client">Inactivo</span>'}</td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="selectActiveClient(${b.id})">Seleccionar</button>
                    <button class="btn btn-primary btn-sm" onclick="editClientCatalog(${b.id})">Editar Catálogo</button>
                    <button class="btn btn-primary btn-sm" onclick="editClientLanding(${b.id})">Editar Landing</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.selectActiveClient = function(id) {
    window.wisbeDB.setActiveBusinessId(id);
    refreshActiveClientUI();
    renderClientsTable();
};

window.editClientCatalog = function(id) {
    window.selectActiveClient(id);
    document.querySelector('[data-nav="catalogo"]').click();
};

window.editClientLanding = function(id) {
    window.selectActiveClient(id);
    document.querySelector('[data-nav="landing"]').click();
};

/* ---------------- USERS SECTION ---------------- */
function setupUsersSection() {
    renderUsersTable();

    const btnNew = document.getElementById('btn-open-create-user');
    const cardForm = document.getElementById('card-create-user');
    const btnCancel = document.getElementById('btn-cancel-user');
    const form = document.getElementById('form-create-user');

    btnNew.addEventListener('click', () => { cardForm.style.display = 'block'; });
    btnCancel.addEventListener('click', () => { cardForm.style.display = 'none'; form.reset(); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('user-input-name').value;
        const username = document.getElementById('user-input-username').value;
        const role = document.getElementById('user-input-role').value;

        window.wisbeAuth.addUser({ name, username, role, password: '123' });
        form.reset();
        cardForm.style.display = 'none';
        renderUsersTable();
    });
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    const users = window.wisbeAuth.getUsers();

    tbody.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.name || u.username}</td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-client'}">${u.role.toUpperCase()}</span></td>
            <td>${u.createdAt || '2025-01-01'}</td>
            <td>
                ${u.username !== 'Antonio' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.username}')">Eliminar</button>` : '<span style="font-size:0.8rem; color:var(--text-muted)">SuperAdmin</span>'}
            </td>
        </tr>
    `).join('');
}

window.deleteUser = function(username) {
    window.wisbeAuth.deleteUser(username);
    renderUsersTable();
};

/* ---------------- CATALOG EDITOR SECTION ---------------- */
function setupCatalogSection() {
    const btnAdd = document.getElementById('btn-add-product');
    const cardForm = document.getElementById('card-product-form');
    const btnCancel = document.getElementById('btn-cancel-product');
    const form = document.getElementById('form-save-product');
    const btnSaveStyle = document.getElementById('btn-save-catalog-style');

    btnAdd.addEventListener('click', () => {
        document.getElementById('product-form-title').textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('prod-id').value = '';
        cardForm.style.display = 'block';
    });

    btnCancel.addEventListener('click', () => {
        cardForm.style.display = 'none';
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeId = window.wisbeDB.getActiveBusinessId();
        const prodId = document.getElementById('prod-id').value;
        const name = document.getElementById('prod-name').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const image_url = document.getElementById('prod-image').value;
        const description = document.getElementById('prod-desc').value;

        if (prodId) {
            window.wisbeDB.updateProduct({ id: parseInt(prodId), name, price, image_url, description });
        } else {
            window.wisbeDB.addProduct({ business_id: activeId, name, price, image_url, description });
        }

        form.reset();
        cardForm.style.display = 'none';
        renderCatalogEditor();
    });

    btnSaveStyle.addEventListener('click', () => {
        const activeId = window.wisbeDB.getActiveBusinessId();
        const cols = parseInt(document.getElementById('cat-grid-cols').value);
        const badge = document.getElementById('cat-badge-text').value;
        const btnColor = document.getElementById('cat-btn-color').value;

        window.wisbeDB.updateCatalogConfig(activeId, {
            columns: cols,
            badge_text: badge,
            button_color: btnColor
        });

        reloadIframe('catalog-preview-iframe');
    });
}

function renderCatalogEditor() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const products = window.wisbeDB.getProducts(activeId);
    const config = window.wisbeDB.getCatalogConfig(activeId);

    // Fill Config Controls
    document.getElementById('cat-grid-cols').value = config.columns || 3;
    document.getElementById('cat-badge-text').value = config.badge_text || 'En Stock';
    document.getElementById('cat-btn-color').value = config.button_color || '#25d366';

    // Fill Products List
    const list = document.getElementById('catalog-products-list');
    if (products.length === 0) {
        list.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted)">No hay productos en este catálogo.</p>';
    } else {
        list.innerHTML = products.map(p => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${p.image_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <div style="font-weight: 600; font-size: 0.85rem;">${p.name}</div>
                        <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">$${p.price.toFixed(2)}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${p.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // Update Public Link
    const activeBiz = window.wisbeDB.getBusinessById(activeId);
    const publicBtn = document.getElementById('btn-open-public-catalog');
    if (publicBtn && activeBiz) {
        publicBtn.href = `public_catalog.html?biz=${activeBiz.slug}`;
    }

    reloadIframe('catalog-preview-iframe');
}

window.editProduct = function(id) {
    const p = window.wisbeDB.getProductById(id);
    if (!p) return;

    document.getElementById('product-form-title').textContent = 'Editar Producto';
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-image').value = p.image_url;
    document.getElementById('prod-desc').value = p.description || '';

    document.getElementById('card-product-form').style.display = 'block';
};

window.deleteProduct = function(id) {
    window.wisbeDB.deleteProduct(id);
    renderCatalogEditor();
};

/* ---------------- LANDING EDITOR SECTION ---------------- */
function setupLandingSection() {
    const btnSave = document.getElementById('btn-save-landing-data');
    btnSave.addEventListener('click', () => {
        const activeId = window.wisbeDB.getActiveBusinessId();
        const heroTitle = document.getElementById('land-hero-title').value;
        const heroSubtitle = document.getElementById('land-hero-subtitle').value;
        const heroBtn = document.getElementById('land-hero-btn').value;
        const heroImg = document.getElementById('land-hero-img').value;
        const waMsg = document.getElementById('land-whatsapp-msg').value;
        const address = document.getElementById('land-address').value;

        window.wisbeDB.updateLandingConfig(activeId, {
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            hero_btn_text: heroBtn,
            hero_image_url: heroImg,
            whatsapp_msg: waMsg,
            address: address
        });

        reloadIframe('landing-preview-iframe');
    });
}

function renderLandingEditor() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const landing = window.wisbeDB.getLandingConfig(activeId);
    const biz = window.wisbeDB.getBusinessById(activeId);

    document.getElementById('land-hero-title').value = landing.hero_title || '';
    document.getElementById('land-hero-subtitle').value = landing.hero_subtitle || '';
    document.getElementById('land-hero-btn').value = landing.hero_btn_text || 'Contactar por WhatsApp';
    document.getElementById('land-hero-img').value = landing.hero_image_url || '';
    document.getElementById('land-whatsapp-msg').value = landing.whatsapp_msg || 'Hola, me interesa más información';
    document.getElementById('land-address').value = landing.address || '';

    const publicBtn = document.getElementById('btn-open-public-landing');
    if (publicBtn && biz) {
        publicBtn.href = `public_landing.html?biz=${biz.slug}`;
    }

    reloadIframe('landing-preview-iframe');
}

/* ---------------- WIDGETS SECTION ---------------- */
function setupWidgetsSection() {
    renderWidgetsInfo();
}

function renderWidgetsInfo() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const biz = window.wisbeDB.getBusinessById(activeId);

    if (!biz) return;

    const catLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}public_catalog.html?biz=${biz.slug}`;
    const landLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}public_landing.html?biz=${biz.slug}`;

    document.getElementById('widget-catalog-link').value = catLink;
    document.getElementById('widget-landing-link').value = landLink;

    document.getElementById('code-widget-tag-landing').textContent = `<wisbe_landingPage client-id="${biz.id}"></wisbe_landingPage>`;
    document.getElementById('code-widget-tag-catalog').textContent = `<wisbe_catalogo client-id="${biz.id}"></wisbe_catalogo>`;
}

function reloadIframe(iframeId) {
    const iframe = document.getElementById(iframeId);
    if (iframe) {
        iframe.src = iframe.src;
    }
}
