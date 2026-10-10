/**
 * Backend API Integration Service
 * Connects the React frontend to the Flask threat detection backend.
 * Falls back to 100% client-side scanning if backend is unreachable (offline mode).
 */

const BACKEND_BASE_URL = '/api';
const TIMEOUT_MS = 5000;

let backendAvailable = null; // null = unknown, true/false = cached

/**
 * Check if the Flask backend is online
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const res = await fetch(`${BACKEND_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      backendAvailable = data.status === 'healthy';
      return { online: true, ...data };
    }
    backendAvailable = false;
    return { online: false };
  } catch {
    backendAvailable = false;
    return { online: false };
  }
}

/**
 * Scan a URL via the Flask backend
 * Returns null if backend is unavailable (caller should fallback to client-side)
 */
export async function scanUrlViaBackend(url) {
  if (backendAvailable === false) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const res = await fetch(`${BACKEND_BASE_URL}/scan/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scan a message via the Flask backend
 * Returns null if backend is unavailable (caller should fallback to client-side)
 */
export async function scanMessageViaBackend(message) {
  if (backendAvailable === false) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const res = await fetch(`${BACKEND_BASE_URL}/scan/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns whether the backend was last known to be available
 */
export function isBackendAvailable() {
  return backendAvailable === true;
}
