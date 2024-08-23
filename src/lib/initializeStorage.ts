import { Encoder } from '../Encoder';
import {
  CookieSessionStorageCookieOptions,
  CookieSessionStorageOptions,
} from '../types/createCookieSessionStorage';

export function initializeStorage(options: CookieSessionStorageOptions) {
  const {
    name: cookieName,
    secrets,
    omitSignPrefix,
    ...cookieOptions
  } = {
    httpOnly: true,
    secure: true,
    path: '/',
    ...options.cookie,
  } as CookieSessionStorageCookieOptions;
  const encoder = new Encoder(options.encoding);

  return {
    cookieName,
    secrets,
    omitSignPrefix,
    cookieOptions,
    encoder,
  };
}
