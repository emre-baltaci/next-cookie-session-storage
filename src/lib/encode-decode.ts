import { ConfiguredEncodingOptions } from '../types/createCookieSessionStorage';

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
  return Buffer.from(value).toString('base64');
}

export function decodeFromBase64(value: string) {
  return Buffer.from(value, 'base64').toString('utf-8');
}
