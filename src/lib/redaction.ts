const SENSITIVE_QUERY = /([?&](?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)=)([^&#\s"']+)/gi;
const QUOTED_PAIR = /("(?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)"\s*:\s*")([^"]+)(")/gi;
const SENSITIVE_PAIR = /(\b(?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)\b\s*[:=]\s*)([^"',\s&}\]]+)/gi;
const AUTH_BEARER = /\b(Authorization\s*:\s*)Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
const BARE_BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g;
const API_KEY = /\bsk-[A-Za-z0-9_-]{6,}\b/g;
const UNIX_PATH = /(?:~|\/Users\/[^\s"',)\]}]+|\/home\/[^\s"',)\]}]+)/g;
const WINDOWS_PATH = /\b[A-Z]:\\{1,2}Users\\{1,2}[^\s"',)\]}]+/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function placeholderFor(key: string): '<API_KEY>' | '<TOKEN>' {
  return key.toLowerCase().includes('api') ? '<API_KEY>' : '<TOKEN>';
}

export function sanitizeText(input: unknown): string {
  let output = String(input ?? '');
  output = output.replace(SENSITIVE_QUERY, (match, prefix: string) => `${prefix}${placeholderFor(prefix)}`);
  output = output.replace(QUOTED_PAIR, (match, prefix: string, _value: string, suffix: string) => `${prefix}${placeholderFor(prefix)}${suffix}`);
  output = output.replace(SENSITIVE_PAIR, (match, prefix: string) => `${prefix}${placeholderFor(prefix)}`);
  output = output.replace(AUTH_BEARER, '$1<TOKEN>');
  output = output.replace(BARE_BEARER, '<TOKEN>');
  output = output.replace(JWT, '<TOKEN>');
  output = output.replace(API_KEY, '<API_KEY>');
  output = output.replace(UNIX_PATH, '<PATH>');
  output = output.replace(WINDOWS_PATH, '<PATH>');
  output = output.replace(EMAIL, '<EMAIL>');
  return output;
}

export function previewText(input: string, limit = 1200): string {
  return Array.from(input).slice(0, limit).join('');
}
