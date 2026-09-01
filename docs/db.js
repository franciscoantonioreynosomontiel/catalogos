// Database Data Store with LocalStorage fallback & Supabase sync

const DB_KEYS = {
    BUSINESSES: 'wisbe_businesses',
    PRODUCTS: 'wisbe_products',
    CATALOG_CONFIGS: 'wisbe_catalog_configs',
    LANDING_CONFIGS: 'wisbe_landing_configs',
    ACTIVE_BUSINESS_ID: 'wisbe_active_business_id'
};

// Initial Seed Data for testing without Supabase initially
const INITIAL_DEMO_DATA = {
    businesses: [
        {
            id: "biz-101",
            name: "Solaris Power Solutions",
            slug: "solaris-power",
            tagline: "Energía solar de alta eficiencia para tu hogar y negocio",
            phone: "+52 81 1234 5678",
            whatsapp: "528112345678",
            email: "contacto@solarispower.com",
            address: "Av. de la Industria 405, Monterrey, N.L.",
            logo_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&auto=format&fit=crop&q=80",
            brand_primary: "#0f172a",
            brand_accent: "#f59e0b",
            business_type: "solar",
            owner_email: "cliente1@solaris.com"
        },
        {
            id: "biz-102",
            name: "Frío Extremo Minisplits",
            slug: "frio-extremo",
            tagline: "Venta e instalación de aire acondicionado e inverters",
            phone: "+52 55 9876 5432",
            whatsapp: "525598765432",
            email: "ventas@frioextremo.com",
            address: "Calle Del Clima 120, CDMX",
            logo_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80",
            brand_primary: "#0369a1",
            brand_accent: "#06b6d4",
            business_type: "hvac",
            owner_email: "cliente2@frioextremo.com"
        }
    ],
    products: [
        {
            id: "prod-1",
            business_id: "biz-101",
            name: "Panel Solar 550W Monocristalino",
            price: 4200.00,
            category: "Paneles Solares",
            description: "Célula solar Tier 1 de máxima eficiencia. Resistencia a granizo y alta durabilidad.",
            image_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80",
            stock: 25,
            featured: true,
            status: "active"
        },
        {
            id: "prod-2",
            business_id: "biz-101",
            name: "Inversor Híbrido 5kW 48V",
            price: 18500.00,
            category: "Inversores",
            description: "Inversor para sistemas de respaldo con baterías. Control inteligente por app.",
            image_url: "https://images.unsplash.com/photo-1558441719-67793d562153?w=600&auto=format&fit=crop&q=80",
            stock: 10,
            featured: true,
            status: "active"
        },
        {
            id: "prod-3",
            business_id: "biz-102",
            name: "Minisplit Inverter 12,000 BTU 110V",
            price: 7990.00,
            category: "Minisplits",
            description: "Ahorro de energía de hasta 60%. Silencioso, filtro purificador y Wi-Fi.",
            image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
            stock: 18,
            featured: true,
            status: "active"
        }
    ],
    catalog_configs: {
        "biz-101": {
            business_id: "biz-101",
            layout_style: "grid",
            columns: 3,
            card_border_radius: "12px",
            show_prices: true,
            show_categories: true,
            show_search: true,
            enable_whatsapp_order: true,
            badge_text: "En Stock",
            primary_color: "#0f172a",
            button_color: "#f59e0b"
        },
        "biz-102": {
            business_id: "biz-102",
            layout_style: "grid",
            columns: 2,
            card_border_radius: "8px",
            show_prices: true,
            show_categories: true,
            show_search: true,
            enable_whatsapp_order: true,
            badge_text: "Oferta",
            primary_color: "#0369a1",
            button_color: "#06b6d4"
        }
    },
    landing_configs: {
        "biz-101": {
            business_id: "biz-101",
            hero_title: "Transforma el sol en energía y ahorra hasta un 95% en tu recibo",
            hero_subtitle: "Instalación profesional de sistemas fotovoltaicos con garantía por 25 años.",
            hero_cta_text: "Cotizar por WhatsApp",
            hero_image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
            badge_tag: "Energía Renovable Garantizada",
            features: [
                { title: "Paneles De Alta Eficiencia", description: "Tecnología Tier 1 con rendimiento garantizado." },
                { title: "Garantía De 25 Años", description: "Soporte técnico directo y mantenimiento continuo." },
                { title: "Retorno De Inversión", description: "Amortización de tu equipo en un tiempo récord." }
            ],
            about_title: "Especialistas en Energía Limpia",
            about_description: "Somos una empresa mexicana enfocada en brindar soluciones de energía sustentable a familias y empresas.",
            show_featured_products: true,
            cta_banner_title: "¿Quieres reducir tu factura eléctrica?",
            cta_banner_subtitle: "Solicita tu estudio solar sin costo ni compromiso.",
            theme_preset: "modern-dark"
        },
        "biz-102": {
            business_id: "biz-102",
            hero_title: "El clima perfecto en tu espacio todo el año",
            hero_subtitle: "Equipos de aire acondicionado Inverter con máximo ahorro de energía e instalación express.",
            hero_cta_text: "Pedir Asesoría WhatsApp",
            hero_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&auto=format&fit=crop&q=80",
            badge_tag: "Equipos Inverter de Alta Eficiencia",
            features: [
                { title: "Instalación Rápida", description: "Técnicos certficados para una instalación limpia." },
                { title: "Garantía por Escrito", description: "Respaldo completo en compresor y componentes." },
                { title: "Ahorro Energético", description: "Equipos con calificación A+++." }
            ],
            about_title: "Especialistas en Climatización",
            about_description: "Líderes en venta, servicio e instalación de equipos de climatización residencial y comercial.",
            show_featured_products: true,
            cta_banner_title: "¿Necesitas un Minisplit?",
            cta_banner_subtitle: "Contáctanos y un asesor te recomendará la capacidad ideal.",
            theme_preset: "ocean-light"
        }
    }
};

class WisbeDB {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(DB_KEYS.BUSINESSES)) {
            localStorage.setItem(DB_KEYS.BUSINESSES, JSON.stringify(INITIAL_DEMO_DATA.businesses));
        }
        if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
            localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_DEMO_DATA.products));
        }
        if (!localStorage.getItem(DB_KEYS.CATALOG_CONFIGS)) {
            localStorage.setItem(DB_KEYS.CATALOG_CONFIGS, JSON.stringify(INITIAL_DEMO_DATA.catalog_configs));
        }
        if (!localStorage.getItem(DB_KEYS.LANDING_CONFIGS)) {
            localStorage.setItem(DB_KEYS.LANDING_CONFIGS, JSON.stringify(INITIAL_DEMO_DATA.landing_configs));
        }
        if (!localStorage.getItem(DB_KEYS.ACTIVE_BUSINESS_ID)) {
            localStorage.setItem(DB_KEYS.ACTIVE_BUSINESS_ID, "biz-101");
        }
    }

    // --- Businesses Methods ---
    getBusinesses() {
        return JSON.parse(localStorage.getItem(DB_KEYS.BUSINESSES) || "[]");
    }

    getBusinessById(id) {
        const list = this.getBusinesses();
        return list.find(b => b.id === id) || null;
    }

    getBusinessBySlug(slug) {
        const list = this.getBusinesses();
        return list.find(b => b.slug === slug) || list[0] || null;
    }

    saveBusiness(business) {
        const list = this.getBusinesses();
        const index = list.findIndex(b => b.id === business.id);
        if (index >= 0) {
            list[index] = { ...list[index], ...business };
        } else {
            if (!business.id) business.id = 'biz-' + Date.now();
            if (!business.slug) business.slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            list.push(business);
        }
        localStorage.setItem(DB_KEYS.BUSINESSES, JSON.stringify(list));
        return business;
    }

    getActiveBusinessId() {
        return localStorage.getItem(DB_KEYS.ACTIVE_BUSINESS_ID) || "biz-101";
    }

    setActiveBusinessId(id) {
        localStorage.setItem(DB_KEYS.ACTIVE_BUSINESS_ID, id);
    }

    // --- Products Methods ---
    getProducts(businessId) {
        const allProducts = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || "[]");
        if (!businessId) return allProducts;
        return allProducts.filter(p => p.business_id === businessId);
    }

    saveProduct(product) {
        const allProducts = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || "[]");
        if (product.id) {
            const index = allProducts.findIndex(p => p.id === product.id);
            if (index >= 0) {
                allProducts[index] = { ...allProducts[index], ...product };
            } else {
                allProducts.push(product);
            }
        } else {
            product.id = 'prod-' + Date.now();
            allProducts.push(product);
        }
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(allProducts));
        return product;
    }

    deleteProduct(id) {
        let allProducts = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || "[]");
        allProducts = allProducts.filter(p => p.id !== id);
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(allProducts));
    }

    // --- Catalog Config Methods ---
    getCatalogConfig(businessId) {
        const configs = JSON.parse(localStorage.getItem(DB_KEYS.CATALOG_CONFIGS) || "{}");
        if (configs[businessId]) return configs[businessId];

        // Default catalog config if not found
        return {
            business_id: businessId,
            layout_style: 'grid',
            columns: 3,
            card_border_radius: '12px',
            show_prices: true,
            show_categories: true,
            show_search: true,
            enable_whatsapp_order: true,
            badge_text: 'Disponible',
            primary_color: '#0f172a',
            button_color: '#2563eb'
        };
    }

    saveCatalogConfig(businessId, config) {
        const configs = JSON.parse(localStorage.getItem(DB_KEYS.CATALOG_CONFIGS) || "{}");
        configs[businessId] = { business_id: businessId, ...config };
        localStorage.setItem(DB_KEYS.CATALOG_CONFIGS, JSON.stringify(configs));
        return configs[businessId];
    }

    // --- Landing Config Methods ---
    getLandingConfig(businessId) {
        const configs = JSON.parse(localStorage.getItem(DB_KEYS.LANDING_CONFIGS) || "{}");
        if (configs[businessId]) return configs[businessId];

        const biz = this.getBusinessById(businessId);
        return {
            business_id: businessId,
            hero_title: `Bienvenido a ${biz ? biz.name : 'Nuestra Empresa'}`,
            hero_subtitle: biz ? biz.tagline : 'Ofrecemos los mejores productos y atención personalizada.',
            hero_cta_text: 'Contactar por WhatsApp',
            hero_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
            badge_tag: 'Soluciones Calificadas',
            features: [
                { title: 'Calidad Superior', description: 'Garantía comprobada en todos nuestros artículos.' },
                { title: 'Atención Directa', description: 'Respuesta inmediata a través de WhatsApp.' },
                { title: 'Asesoría Profesional', description: 'Te orientamos en la mejor elección para tu proyecto.' }
            ],
            about_title: 'Sobre Nuestra Empresa',
            about_description: 'Nos dedicamos a servir a nuestros clientes con excelencia, integridad y productos de vanguardia.',
            show_featured_products: true,
            cta_banner_title: '¿Tienes alguna duda o proyecto en mente?',
            cta_banner_subtitle: 'Estamos a un clic de distancia para atenderte.',
            theme_preset: 'modern-dark'
        };
    }

    saveLandingConfig(businessId, config) {
        const configs = JSON.parse(localStorage.getItem(DB_KEYS.LANDING_CONFIGS) || "{}");
        configs[businessId] = { business_id: businessId, ...config };
        localStorage.setItem(DB_KEYS.LANDING_CONFIGS, JSON.stringify(configs));
        return configs[businessId];
    }
}

window.wisbeDB = new WisbeDB();
