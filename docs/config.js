// Configuration for Supabase & Cloudinary
// Replace these default credentials with your actual project keys when ready.

const WISBE_CONFIG = {
    // Supabase Credentials
    SUPABASE_URL: "https://your-supabase-project.supabase.co",
    SUPABASE_ANON_KEY: "your-anon-key-here",

    // Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME: "your-cloud-name",
    CLOUDINARY_UPLOAD_PRESET: "your-upload-preset",

    // Mode flag: switches to Supabase API when valid URL is provided
    useSupabase: false
};

// Check if window.supabase is available and valid config exists
if (window.supabase && WISBE_CONFIG.SUPABASE_URL.startsWith("https://")) {
    WISBE_CONFIG.useSupabase = true;
}

window.WISBE_CONFIG = WISBE_CONFIG;
