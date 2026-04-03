// Helper to get avatar URL from localStorage profile
export function getAvatarUrl(avatar_url?: string): string | undefined {
  if (!avatar_url || avatar_url === 'default') return undefined;
  if (avatar_url.startsWith('/uploads')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return baseUrl + avatar_url;
  }
  return avatar_url;
}
