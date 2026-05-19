import Cookies from "js-cookie";

const TOKEN_KEY = "pharmaos_token";
const REFRESH_KEY = "pharmaos_refresh";

export function getToken() {
  return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token) {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearToken() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_KEY) || null;
}

export function setRefreshToken(token) {
  Cookies.set(REFRESH_KEY, token, { expires: 7, sameSite: "strict" });
}
