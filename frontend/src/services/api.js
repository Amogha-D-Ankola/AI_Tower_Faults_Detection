/**
 * Nova Grid - Central API Client
 * ==============================
 * Handles all HTTP communication with the FastAPI backend.
 * Provides consistent error handling and URL formatting.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string'
          ? errorJson.detail
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      const errorText = await response.text();
      if (errorText) errorDetail = errorText;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  baseUrl: API_BASE_URL,

  /** Returns absolute URL for static images served by the backend */
  getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  },

  /** PDF report download URL */
  getPdfReportUrl(id) {
    return `${API_BASE_URL}/api/reports/${id}/pdf`;
  },

  /** CSV report download URL */
  getCsvReportUrl(id) {
    return `${API_BASE_URL}/api/reports/${id}/csv`;
  },

  /** Check backend health */
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  /** Model transparency & capability status */
  async getModelStatus() {
    const res = await fetch(`${API_BASE_URL}/api/model/status`);
    return handleResponse(res);
  },

  /** Upload drone image and trigger fault detection */
  async detectFaults(formData) {
    const res = await fetch(`${API_BASE_URL}/api/detect`, {
      method: 'POST',
      body: formData, // browser automatically sets multipart/form-data boundary
    });
    return handleResponse(res);
  },

  /** Fetch dashboard aggregate statistics */
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return handleResponse(res);
  },

  /** List inspection records with query parameters */
  async getInspections({ skip = 0, limit = 50, search, review_status, mode } = {}) {
    const params = new URLSearchParams();
    params.set('skip', skip.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (review_status) params.set('review_status', review_status);
    if (mode) params.set('mode', mode);

    const res = await fetch(`${API_BASE_URL}/api/inspections?${params.toString()}`);
    return handleResponse(res);
  },

  /** Fetch single inspection by ID */
  async getInspectionById(id) {
    const res = await fetch(`${API_BASE_URL}/api/inspections/${id}`);
    return handleResponse(res);
  },

  /** Update human verification status (Pending Review, Verified, Rejected) */
  async updateReviewStatus(id, reviewStatus) {
    const res = await fetch(`${API_BASE_URL}/api/inspections/${id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_status: reviewStatus }),
    });
    return handleResponse(res);
  },

  /** Delete inspection record and storage files */
  async deleteInspection(id) {
    const res = await fetch(`${API_BASE_URL}/api/inspections/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
