const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getServerAuthUser(context) {
  const token = context.req.cookies.pharmaos_token;
  if (!token || token.endsWith(".mock")) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload.data || payload.user || null;
  } catch {
    return null;
  }
}
