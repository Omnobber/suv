import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  || (typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/api` : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL
});

export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendBase = baseURL.replace(/\/api$/, '');
  return `${backendBase}${path}`;
};
