
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
// Remove /api at the end for static resource URLs
const BASE_URL = API_BASE.replace(/\/api$/, '');

/**
 * Resolves a stored path/URL into a full URL pointing to the static uploads directory.
 * Used for images only (no streaming needed).
 */
export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http')) return url;

    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

    // If it already starts with uploads/, don't double it
    if (cleanUrl.startsWith('uploads/')) {
        return `${BASE_URL}/${cleanUrl}`;
    }

    return `${BASE_URL}/uploads/${cleanUrl}`;
};

/**
 * Resolves a stored path/URL into a full URL pointing to the /api/files/download/ endpoint.
 * This endpoint sets correct Content-Type, Content-Disposition and supports Range requests
 * (needed for video streaming and inline PDF display).
 */
export const getFileUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;

    // Already an absolute URL using the download endpoint
    if (url.includes('/api/files/download/')) {
        return url;
    }

    if (url.startsWith('http')) {
        // Full URL to a static resource — convert to download endpoint for proper headers
        try {
            const parsed = new URL(url);
            // e.g. /uploads/videos/xxx.mp4  →  videos/xxx.mp4
            const pathPart = parsed.pathname.replace(/^\/uploads\//, '');
            return `${API_BASE}/files/download/${pathPart}`;
        } catch {
            return url;
        }
    }

    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

    // If it starts with uploads/, strip that prefix
    const fileContentPath = cleanUrl.startsWith('uploads/')
        ? cleanUrl.substring('uploads/'.length)
        : cleanUrl;

    return `${API_BASE}/files/download/${fileContentPath}`;
};

/**
 * Resolves the URL for a generated certificate PDF.
 * pdfUrl is stored as '/uploads/certificate_<uuid>.pdf'
 * Served via the dedicated certificates download endpoint for correct Content-Type.
 */
export const getCertificateUrl = (pdfUrl: string | null | undefined): string => {
    if (!pdfUrl) return '';
    if (pdfUrl.startsWith('blob:')) return pdfUrl;
    if (pdfUrl.includes('/api/certificates/download/')) return pdfUrl;

    // pdfUrl is like '/uploads/certificate_<uuid>.pdf'
    const filename = pdfUrl.split('/').pop() || '';
    if (filename.startsWith('certificate_') && filename.endsWith('.pdf')) {
        const uuid = filename.replace(/^certificate_/, '').replace(/\.pdf$/, '');
        return `${API_BASE}/certificates/download/${uuid}`;
    }

    // Fallback: serve via generic file download
    return getFileUrl(pdfUrl);
};
