import { type ConfiguredEncodingOptions } from '../types/createCookieSessionStorage';

export function isEncodingEnabled(options: ConfiguredEncodingOptions) {
  return Boolean(options);
}

export function encode(value: string, options: ConfiguredEncodingOptions) {
  if (typeof options === 'boolean' && options === true) {
    return encodeToBase64(value);
  }

  if (typeof options === 'object') {
    return options.encoder(value, ...options.encoderParams);
  }

  return value;
}

export function decode(value: string, options: ConfiguredEncodingOptions) {
  if (typeof options === 'boolean' && options === true) {
    return decodeFromBase64(value);
  }

  if (typeof options === 'object') {
    return options.decoder(value, ...options.decoderParams);
  }

  return value;
}

// Default encoder / decoder functions
export function encodeToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  const stringifiedBytes = Array.from(bytes, (byte) => {
    return String.fromCharCode(byte);
  }).join('');

  return btoa(stringifiedBytes);
}

export function decodeFromBase64(value: string) {
  const stringifiedBytes = atob(value);

  const bytes = Uint8Array.from(stringifiedBytes, (stringifiedByte) =>
    stringifiedByte.charCodeAt(0)
  );
  return new TextDecoder().decode(bytes);
}
