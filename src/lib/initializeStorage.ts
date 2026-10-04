import { type CookieSession } from '../CookieSession';
import { Encoder } from '../Encoder';
import {
  type CookieSessionStorageCookieOptions,
  type CookieSessionStorageOptions,
} from '../types/createCookieSessionStorage';

export function initializeStorage(options: CookieSessionStorageOptions) {
  const userCookieOptionsEntries = Object.entries(options.cookie);
  const safeUserCookieOptionsEntries = userCookieOptionsEntries.filter(
    (option) => option[1] !== undefined
  );
  const safeUserCookieOptions = Object.fromEntries(
    safeUserCookieOptionsEntries
  ) as CookieSessionStorageCookieOptions;

  const {
    name: cookieName,
    secrets,
    omitSignPrefix,
    ...cookieOptions
  } = {
    httpOnly: true,
    secure: true,
    path: '/',
    ...safeUserCookieOptions,
  } satisfies CookieSessionStorageCookieOptions;
  const encoder = new Encoder(options.encoding);

  return {
    cookieName,
    secrets,
    omitSignPrefix,
    cookieOptions,
    encoder,
  };
}
