// Main Application Logic & Admin Controller

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupAuthListeners();
    checkAuthSession();
    setupNavigation();
    setupAdminHandlers();
    setupBusinessInfoHandlers();
    setupLandingEditorHandlers();
    setupCatalogEditorHandlers();
}

// --- AUTHENTICATION FLOW ---
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('login-error');

            const res = window.wisbeAuth.login(username, password);
            if (res.success) {
                errorElement.style.display = 'none';
                checkAuthSession();
            } else {
                errorElement.textContent = res.error;
                errorElement.style.display = 'block';
            }
        });
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.wisbeAuth.logout();
        });
    }
}

function checkAuthSession() {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const roleBadge = document.getElementById('role-badge');
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayEmail = document.getElementById('user-display-email');
    const adminNavSection = document.getElementById('admin-nav-section');

    if (window.wisbeAuth.isAuthenticated()) {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';

        const user = window.wisbeAuth.getCurrentUser();
        userDisplayName.textContent = user.name;
        userDisplayEmail.textContent = user.email;

        if (window.wisbeAuth.isAdmin()) {
            roleBadge.textContent = 'Admin';
            adminNavSection.style.display = 'block';
            switchView('admin-clients');
        } else {
            roleBadge.textContent = 'Cliente';
            adminNavSection.style.display = 'none';
            switchView('business-info');
        }

        renderClientSidebarList();
        updateActiveClientIndicator();
    } else {
        loginScreen.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

// --- NAVIGATION & VIEWS SWITCHER ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            switchView(viewName);
        });
    });
}

function switchView(viewName) {
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const targetNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (targetNav) targetNav.classList.add('active');

    // Hide all views, show target view
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.style.display = 'block';

    // Update Topbar Title
    const topbarTitle = document.getElementById('topbar-title-text');
    const sidebarClientBox = document.getElementById('sidebar-client-selector-box');

    // Show client selector sidebar box for Admin on Landing or Catalog view
    if (window.wisbeAuth.isAdmin() && (viewName === 'landing-editor' || viewName === 'catalog-editor' || viewName === 'business-info')) {
        sidebarClientBox.style.display = 'block';
    } else {
        sidebarClientBox.style.display = 'none';
    }

    switch (viewName) {
        case 'admin-clients':
            topbarTitle.textContent = 'Gestión de Clientes Registrados';
            renderClientsTable();
            break;
        case 'business-info':
            topbarTitle.textContent = 'Información General del Negocio';
            loadBusinessInfoForm();
            break;
        case 'landing-editor':
            topbarTitle.textContent = 'Editor de Landing Page Universal';
            loadLandingPageEditor();
            break;
        case 'catalog-editor':
            topbarTitle.textContent = 'Gestor de Catálogo de Productos';
            loadCatalogEditor();
            break;
        case 'widget-code':
            topbarTitle.textContent = 'Integración de Widgets (wisbe_landingPage & wisbe_catalogo)';
            loadWidgetCodeSnippets();
            break;
    }
}

// --- ADMIN CLIENT MANAGEMENT ---
function setupAdminHandlers() {
    const btnNewClient = document.getElementById('btn-open-create-client');
    const modalClient = document.getElementById('modal-client');
    const btnCloseModal = document.getElementById('btn-close-client-modal');
    const formClient = document.getElementById('form-client');

    if (btnNewClient) {
        btnNewClient.addEventListener('click', () => {
            document.getElementById('modal-client-title').textContent = 'Crear Nuevo Cliente';
            formClient.reset();
            document.getElementById('client-id').value = '';
            modalClient.classList.add('open');
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            modalClient.classList.remove('open');
        });
    }

    if (formClient) {
        formClient.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('client-id').value;
            const name = document.getElementById('modal-biz-name').value;
            const business_type = document.getElementById('modal-biz-type').value;
            const whatsapp = document.getElementById('modal-biz-whatsapp').value;
            const email = document.getElementById('modal-biz-email').value;

            const newBiz = {
                id: id || undefined,
                name,
                business_type,
                whatsapp,
                phone: whatsapp,
                email,
                owner_email: email,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            };

            window.wisbeDB.saveBusiness(newBiz);
            modalClient.classList.remove('open');
            renderClientsTable();
            renderClientSidebarList();
        });
    }
}

function renderClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    if (!tbody) return;

    const businesses = window.wisbeDB.getBusinesses();
    const activeId = window.wisbeDB.getActiveBusinessId();

    tbody.innerHTML = businesses.map(b => `
        <tr style="${b.id === activeId ? 'background: rgba(59, 130, 246, 0.08);' : ''}">
            <td style="font-weight: 600;">${b.name}</td>
            <td><span class="client-badge-type">${b.business_type || 'General'}</span></td>
            <td>${b.whatsapp || '-'}</td>
            <td>${b.owner_email || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="selectAndManageClient('${b.id}')">
                    ${b.id === activeId ? 'Administrando' : 'Gestionar Portal'}
                </button>
            </td>
        </tr>
    `).join('');
}

function renderClientSidebarList() {
    const container = document.getElementById('sidebar-clients-list');
    if (!container) return;

    const businesses = window.wisbeDB.getBusinesses();
    const activeId = window.wisbeDB.getActiveBusinessId();

    container.innerHTML = businesses.map(b => `
        <div class="client-item ${b.id === activeId ? 'selected' : ''}" onclick="selectAndManageClient('${b.id}')">
            <span>${b.name}</span>
            <span class="client-badge-type">${b.business_type}</span>
        </div>
    `).join('');
}

function selectAndManageClient(businessId) {
    window.wisbeDB.setActiveBusinessId(businessId);
    updateActiveClientIndicator();
    renderClientsTable();
    renderClientSidebarList();

    // Reload active view with selected client's data
    const activeNav = document.querySelector('.nav-item.active');
    const viewName = activeNav ? activeNav.getAttribute('data-view') : 'business-info';
    switchView(viewName);
}

function updateActiveClientIndicator() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const activeBiz = window.wisbeDB.getBusinessById(activeId);
    const label = document.getElementById('active-client-name');
    if (label && activeBiz) {
        label.textContent = activeBiz.name;
    }
}

// --- BUSINESS INFO MODULE ---
function setupBusinessInfoHandlers() {
    const form = document.getElementById('business-info-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const activeId = window.wisbeDB.getActiveBusinessId();
            const biz = window.wisbeDB.getBusinessById(activeId) || {};

            const logoFile = document.getElementById('biz-logo-file').files[0];
            let logoUrl = document.getElementById('biz-logo-url').value;
            if (logoFile) {
                logoUrl = await window.wisbeCloudinary.uploadImage(logoFile);
            }

            const updatedBiz = {
                ...biz,
                id: activeId,
                name: document.getElementById('biz-name').value,
                tagline: document.getElementById('biz-tagline').value,
                phone: document.getElementById('biz-phone').value,
                whatsapp: document.getElementById('biz-whatsapp').value,
                email: document.getElementById('biz-email').value,
                address: document.getElementById('biz-address').value,
                business_type: document.getElementById('biz-type').value,
                logo_url: logoUrl || biz.logo_url,
                brand_primary: document.getElementById('biz-brand-primary').value,
                brand_accent: document.getElementById('biz-brand-accent').value
            };

            window.wisbeDB.saveBusiness(updatedBiz);
            updateActiveClientIndicator();
            alert('Información del negocio actualizada exitosamente');
        });
    }
}

function loadBusinessInfoForm() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const biz = window.wisbeDB.getBusinessById(activeId);
    if (!biz) return;

    document.getElementById('biz-name').value = biz.name || '';
    document.getElementById('biz-tagline').value = biz.tagline || '';
    document.getElementById('biz-phone').value = biz.phone || '';
    document.getElementById('biz-whatsapp').value = biz.whatsapp || '';
    document.getElementById('biz-email').value = biz.email || '';
    document.getElementById('biz-address').value = biz.address || '';
    document.getElementById('biz-type').value = biz.business_type || 'general';
    document.getElementById('biz-logo-url').value = biz.logo_url || '';
    document.getElementById('biz-brand-primary').value = biz.brand_primary || '#0f172a';
    document.getElementById('biz-brand-accent').value = biz.brand_accent || '#2563eb';
}

// --- LANDING PAGE EDITOR ---
function setupLandingEditorHandlers() {
    const form = document.getElementById('landing-editor-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const activeId = window.wisbeDB.getActiveBusinessId();

            const heroImgFile = document.getElementById('lp-hero-img-file').files[0];
            let heroImgUrl = document.getElementById('lp-hero-img-url').value;
            if (heroImgFile) {
                heroImgUrl = await window.wisbeCloudinary.uploadImage(heroImgFile);
            }

            // Extract features
            const featureCards = document.querySelectorAll('.feature-input-group');
            const features = Array.from(featureCards).map(group => ({
                title: group.querySelector('.feat-title').value,
                description: group.querySelector('.feat-desc').value
            }));

            const landingConfig = {
                hero_title: document.getElementById('lp-hero-title').value,
                hero_subtitle: document.getElementById('lp-hero-subtitle').value,
                hero_cta_text: document.getElementById('lp-hero-cta').value,
                hero_image_url: heroImgUrl,
                badge_tag: document.getElementById('lp-badge').value,
                about_title: document.getElementById('lp-about-title').value,
                about_description: document.getElementById('lp-about-desc').value,
                cta_banner_title: document.getElementById('lp-cta-title').value,
                cta_banner_subtitle: document.getElementById('lp-cta-subtitle').value,
                features
            };

            window.wisbeDB.saveLandingConfig(activeId, landingConfig);
            refreshLandingPreview();
            alert('Landing Page guardada y actualizada.');
        });
    }
}

function loadLandingPageEditor() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const config = window.wisbeDB.getLandingConfig(activeId);
    const biz = window.wisbeDB.getBusinessById(activeId);

    document.getElementById('lp-badge').value = config.badge_tag || '';
    document.getElementById('lp-hero-title').value = config.hero_title || '';
    document.getElementById('lp-hero-subtitle').value = config.hero_subtitle || '';
    document.getElementById('lp-hero-cta').value = config.hero_cta_text || '';
    document.getElementById('lp-hero-img-url').value = config.hero_image_url || '';
    document.getElementById('lp-about-title').value = config.about_title || '';
    document.getElementById('lp-about-desc').value = config.about_description || '';
    document.getElementById('lp-cta-title').value = config.cta_banner_title || '';
    document.getElementById('lp-cta-subtitle').value = config.cta_banner_subtitle || '';

    // Render Features Inputs
    const featuresContainer = document.getElementById('lp-features-container');
    const features = config.features || [];

    featuresContainer.innerHTML = features.map((f, i) => `
        <div class="feature-input-group" style="background: var(--bg-input); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
            <div class="form-group" style="margin-bottom: 0.5rem;">
                <label class="form-label">Beneficio ${i + 1}</label>
                <input type="text" class="form-control feat-title" value="${f.title}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control feat-desc" value="${f.description}">
            </div>
        </div>
    `).join('');

    // Update public button link
    const btnPublic = document.getElementById('btn-open-public-landing');
    if (btnPublic && biz) {
        btnPublic.href = `public_landing.html?biz=${biz.slug}`;
    }

    const previewLabel = document.getElementById('preview-biz-name-label');
    if (previewLabel && biz) previewLabel.textContent = biz.name;

    refreshLandingPreview();
}

function refreshLandingPreview() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const biz = window.wisbeDB.getBusinessById(activeId);
    const iframe = document.getElementById('landing-preview-iframe');
    if (iframe && biz) {
        iframe.src = `public_landing.html?biz=${biz.slug}&preview=1&t=${Date.now()}`;
    }
}

// --- CATALOG EDITOR ---
function setupCatalogEditorHandlers() {
    const configForm = document.getElementById('catalog-config-form');
    if (configForm) {
        configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const activeId = window.wisbeDB.getActiveBusinessId();

            const catalogConfig = {
                layout_style: document.getElementById('cat-layout-style').value,
                columns: parseInt(document.getElementById('cat-columns').value, 10),
                badge_text: document.getElementById('cat-badge-text').value,
                button_color: document.getElementById('cat-btn-color').value,
                show_prices: document.getElementById('cat-show-prices').checked,
                show_search: document.getElementById('cat-show-search').checked
            };

            window.wisbeDB.saveCatalogConfig(activeId, catalogConfig);
            refreshCatalogPreview();
            alert('Estilos del catálogo actualizados.');
        });
    }

    // Modal Add Product
    const btnAddProd = document.getElementById('btn-open-add-product');
    const modalProd = document.getElementById('modal-product');
    const btnCloseProd = document.getElementById('btn-close-product-modal');
    const formProd = document.getElementById('form-product');

    if (btnAddProd) {
        btnAddProd.addEventListener('click', () => {
            document.getElementById('modal-product-title').textContent = 'Agregar Nuevo Producto';
            formProd.reset();
            document.getElementById('product-id').value = '';
            modalProd.classList.add('open');
        });
    }

    if (btnCloseProd) {
        btnCloseProd.addEventListener('click', () => {
            modalProd.classList.remove('open');
        });
    }

    if (formProd) {
        formProd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const activeId = window.wisbeDB.getActiveBusinessId();
            const id = document.getElementById('product-id').value;

            const imgFile = document.getElementById('prod-img-file').files[0];
            let imgUrl = document.getElementById('prod-img-url').value;
            if (imgFile) {
                imgUrl = await window.wisbeCloudinary.uploadImage(imgFile);
            }

            const productData = {
                id: id || undefined,
                business_id: activeId,
                name: document.getElementById('prod-name').value,
                price: parseFloat(document.getElementById('prod-price').value),
                category: document.getElementById('prod-category').value || 'General',
                description: document.getElementById('prod-desc').value,
                image_url: imgUrl || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80",
                status: 'active'
            };

            window.wisbeDB.saveProduct(productData);
            modalProd.classList.remove('open');
            renderProductsList();
            refreshCatalogPreview();
        });
    }
}

function loadCatalogEditor() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const config = window.wisbeDB.getCatalogConfig(activeId);
    const biz = window.wisbeDB.getBusinessById(activeId);

    document.getElementById('cat-layout-style').value = config.layout_style || 'grid';
    document.getElementById('cat-columns').value = config.columns || 3;
    document.getElementById('cat-badge-text').value = config.badge_text || 'Disponible';
    document.getElementById('cat-btn-color').value = config.button_color || '#2563eb';
    document.getElementById('cat-show-prices').checked = config.show_prices !== false;
    document.getElementById('cat-show-search').checked = config.show_search !== false;

    const btnPublic = document.getElementById('btn-open-public-catalog');
    if (btnPublic && biz) {
        btnPublic.href = `public_catalog.html?biz=${biz.slug}`;
    }

    const previewLabel = document.getElementById('preview-catalog-biz-label');
    if (previewLabel && biz) previewLabel.textContent = biz.name;

    renderProductsList();
    refreshCatalogPreview();
}

function renderProductsList() {
    const container = document.getElementById('products-list-container');
    if (!container) return;

    const activeId = window.wisbeDB.getActiveBusinessId();
    const products = window.wisbeDB.getProducts(activeId);

    if (products.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No hay productos registrados para este negocio.</p>`;
        return;
    }

    container.innerHTML = products.map(p => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-input); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${p.image_url}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;">
                <div>
                    <div style="font-weight: 600; font-size: 0.88rem;">${p.name}</div>
                    <div style="color: var(--primary); font-weight: 600; font-size: 0.82rem;">$${p.price.toFixed(2)}</div>
                </div>
            </div>
            <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Borrar</button>
            </div>
        </div>
    `).join('');
}

function editProduct(productId) {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const products = window.wisbeDB.getProducts(activeId);
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    document.getElementById('modal-product-title').textContent = 'Editar Producto';
    document.getElementById('product-id').value = prod.id;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-desc').value = prod.description || '';
    document.getElementById('prod-img-url').value = prod.image_url || '';

    document.getElementById('modal-product').classList.add('open');
}

function deleteProduct(productId) {
    if (confirm('¿Deseas eliminar este producto del catálogo?')) {
        window.wisbeDB.deleteProduct(productId);
        renderProductsList();
        refreshCatalogPreview();
    }
}

function refreshCatalogPreview() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const biz = window.wisbeDB.getBusinessById(activeId);
    const iframe = document.getElementById('catalog-preview-iframe');
    if (iframe && biz) {
        iframe.src = `public_catalog.html?biz=${biz.slug}&preview=1&t=${Date.now()}`;
    }
}

// --- WIDGET CODE SNIPPETS ---
function loadWidgetCodeSnippets() {
    const activeId = window.wisbeDB.getActiveBusinessId();
    const biz = window.wisbeDB.getBusinessById(activeId);
    if (!biz) return;

    const slugSpans = document.querySelectorAll('.code-slug');
    slugSpans.forEach(span => span.textContent = biz.slug);
}

function copyCode(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text);
    alert('Código copiado al portapapeles.');
}

window.selectAndManageClient = selectAndManageClient;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.copyCode = copyCode;
