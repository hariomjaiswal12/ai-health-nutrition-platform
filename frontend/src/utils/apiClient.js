// src/utils/apiClient.js
export async function apiClient(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };
  const response = await fetch(url, config);

  // Check for authorization errors (401, 403)
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized access. Please log in with proper rights.');
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data.message || 'API request failed';
    throw new Error(error);
  }

  return data;
}

