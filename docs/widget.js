/**
 * Wisbe Embeddable Widgets System (Custom Labels)
 * Enables embedding via <wisbe_landingPage> and <wisbe_catalogo>
 */

(function () {
    const BASE_URL = document.currentScript ? document.currentScript.src.replace('/widget.js', '') : '';

    class WisbeLandingPage extends HTMLElement {
        connectedCallback() {
            const clientId = this.getAttribute('client-id');
            if (!clientId) {
                this.innerHTML = '<p style="color:red;">Wisbe Widget Error: client-id is required</p>';
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${BASE_URL}/public_landing.html?id=${clientId}`;
            iframe.style.width = '100%';
            iframe.style.height = this.getAttribute('height') || '800px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';

            this.innerHTML = '';
            this.appendChild(iframe);
        }
    }

    class WisbeCatalogo extends HTMLElement {
        connectedCallback() {
            const clientId = this.getAttribute('client-id');
            if (!clientId) {
                this.innerHTML = '<p style="color:red;">Wisbe Widget Error: client-id is required</p>';
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${BASE_URL}/public_catalog.html?id=${clientId}`;
            iframe.style.width = '100%';
            iframe.style.height = this.getAttribute('height') || '700px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';

            this.innerHTML = '';
            this.appendChild(iframe);
        }
    }

    // Safely register custom elements
    function registerTag(tagName, elementClass) {
        try {
            if (!customElements.get(tagName)) {
                customElements.define(tagName, elementClass);
            }
        } catch (e) {
            // Fallback for non-hyphenated custom tags in custom element registry
        }
    }

    registerTag('wisbe-landingpage', WisbeLandingPage);
    registerTag('wisbe-catalogo', WisbeCatalogo);
    registerTag('wisbe-landing-page', WisbeLandingPage);

    // Dynamic selector fallback for wisbe_landingPage & wisbe_catalogo tags
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('wisbe_landingPage, wisbe_catalogo').forEach(el => {
            const clientId = el.getAttribute('client-id');
            if (!clientId) return;

            const isLanding = el.tagName.toLowerCase().includes('landing');
            const iframe = document.createElement('iframe');
            iframe.src = isLanding
                ? `${BASE_URL}/public_landing.html?id=${clientId}`
                : `${BASE_URL}/public_catalog.html?id=${clientId}`;
            iframe.style.width = '100%';
            iframe.style.height = el.getAttribute('height') || (isLanding ? '800px' : '700px');
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';

            el.innerHTML = '';
            el.appendChild(iframe);
        });
    });
})();
