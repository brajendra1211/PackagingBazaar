export const decodeToken = (token) => {
  try {
    // Basic JWT decode: A JWT is part1.part2.part3
    // We want to decode base64 part2 (the payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getAuthState = () => {
  const token = localStorage.getItem('token');
  if (!token) return { token: null, role: null, userName: null, id: null };

  const decoded = decodeToken(token);
  return {
    token,
    role: decoded?.role || null,
    userName: decoded?.userName || null,
    id: decoded?.id || null,
  };
};
