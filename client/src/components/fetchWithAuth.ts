export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    try {
      const data = await res.clone().json();
      if (data && (data.message === 'Token expired' || data.message === 'Unauthorized')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('profile');
        window.location.href = '/login';
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('profile');
      window.location.href = '/login';
    }
  }
  return res;
}
