// Cloudinary Upload Utility Module

class WisbeCloudinary {
    constructor() {
        this.cloudName = window.WISBE_CONFIG?.CLOUDINARY_CLOUD_NAME || "";
        this.uploadPreset = window.WISBE_CONFIG?.CLOUDINARY_UPLOAD_PRESET || "";
    }

    // Helper to simulate or upload image
    async uploadImage(fileOrUrl) {
        // If an absolute URL is given, return as is
        if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('http')) {
            return fileOrUrl;
        }

        // If Cloudinary is configured
        if (this.cloudName && this.cloudName !== "your-cloud-name" && fileOrUrl instanceof File) {
            try {
                const formData = new FormData();
                formData.append('file', fileOrUrl);
                formData.append('upload_preset', this.uploadPreset);

                const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.secure_url;
                }
            } catch (err) {
                console.warn("Cloudinary upload failed, falling back to local object URL or placeholder:", err);
            }
        }

        // Fallback for local files: convert to Base64 or object URL for instant UI preview
        if (fileOrUrl instanceof File) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(fileOrUrl);
            });
        }

        return "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&auto=format&fit=crop&q=80";
    }
}

window.wisbeCloudinary = new WisbeCloudinary();
