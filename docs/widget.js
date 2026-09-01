/**
 * Wisbe Embeddable Web Component Widgets
 * Enables integration on external websites via custom tags:
 * <wisbe_landingPage business="slug"></wisbe_landingPage>
 * <wisbe_catalogo business="slug"></wisbe_catalogo>
 */

(function() {
    const scripts = document.getElementsByTagName('script');
    let basePath = '';
    for (let script of scripts) {
        if (script.src && script.src.includes('widget.js')) {
            basePath = script.src.replace('widget.js', '');
            break;
        }
    }
    if (!basePath) basePath = './';

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

    if (!customElements.get('wisbe_landingpage')) {
        customElements.define('wisbe_landingpage', WisbeLandingWidget);
    }
    if (!customElements.get('wisbe_catalogo')) {
        customElements.define('wisbe_catalogo', WisbeCatalogoWidget);
    }
})();
