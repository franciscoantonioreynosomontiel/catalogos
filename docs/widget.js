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

    if (!customElements.get('wisbe_landingpage')) {
        customElements.define('wisbe_landingpage', WisbeLandingPage);
    }

    if (!customElements.get('wisbe_catalogo')) {
        customElements.define('wisbe_catalogo', WisbeCatalogo);
    }
})();
