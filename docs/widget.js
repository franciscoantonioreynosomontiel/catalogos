/**
 * Wisbe Embeddable Web Component Widgets
 * Enables integration on external websites via custom tags:
 * <wisbe_landingpage business="slug"></wisbe_landingpage>
 * <wisbe_catalogo business="slug"></wisbe_catalogo>
 */

(function() {
    // Determine current script base path
    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    for (let script of scripts) {
        if (script.src && script.src.includes('widget.js')) {
            basePath = script.src.replace('widget.js', '');
            break;
        }
    }
    if (!basePath) basePath = './';

    // Widget: wisbe_landingpage
    class WisbeLandingWidget extends HTMLElement {
        connectedCallback() {
            const businessSlug = this.getAttribute('business') || 'solaris-power';
            const width = this.getAttribute('width') || '100%';
            const height = this.getAttribute('height') || '800px';

            const iframe = document.createElement('iframe');
            iframe.src = `${basePath}public_landing.html?biz=${businessSlug}`;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.overflow = 'hidden';

            this.appendChild(iframe);
        }
    }

    // Widget: wisbe_catalogo
    class WisbeCatalogoWidget extends HTMLElement {
        connectedCallback() {
            const businessSlug = this.getAttribute('business') || 'solaris-power';
            const width = this.getAttribute('width') || '100%';
            const height = this.getAttribute('height') || '800px';

            const iframe = document.createElement('iframe');
            iframe.src = `${basePath}public_catalog.html?biz=${businessSlug}`;
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.overflow = 'hidden';

            this.appendChild(iframe);
        }
    }

    // Register Custom Elements (support both wisbe_landingpage and wisbe-landingpage syntax)
    if (!customElements.get('wisbe_landingpage')) {
        customElements.define('wisbe_landingpage', WisbeLandingWidget);
    }
    if (!customElements.get('wisbe_catalogo')) {
        customElements.define('wisbe_catalogo', WisbeCatalogoWidget);
    }
    if (!customElements.get('wisbe-landingpage')) {
        customElements.define('wisbe-landingpage', class extends WisbeLandingWidget {});
    }
    if (!customElements.get('wisbe-catalogo')) {
        customElements.define('wisbe-catalogo', class extends WisbeCatalogoWidget {});
    }
})();
