const cookieName = 'buildspace_github_session';
const stateCookieName = 'buildspace_github_state';

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function cookieValue(request, name) {
  return request.headers.get('Cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

async function sessionKey(secret) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptSessionToken(session, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await sessionKey(secret), new TextEncoder().encode(JSON.stringify(session)));
  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv);
  packed.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64Url(packed);
}

export async function getSession(request, secret) {
  const packed = base64UrlToBytes(cookieValue(request, cookieName));
  if (packed.length <= 12) return null;
  try {
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: packed.slice(0, 12) }, await sessionKey(secret), packed.slice(12));
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

export function sessionCookie(value, maxAge = 28800) {
  return `${cookieName}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/github; Max-Age=${maxAge}`;
}

export function stateCookie(value, maxAge = 600) {
  return `${stateCookieName}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/github/oauth; Max-Age=${maxAge}`;
}

export function getStateCookie(request) {
  return cookieValue(request, stateCookieName);
}
