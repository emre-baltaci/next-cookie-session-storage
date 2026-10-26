import { Encoder } from '../Encoder';
import {
  type CookieSessionStorageCookieOptions,
  type CookieSessionStorageOptions,
} from '../types/createCookieSessionStorage';
import { hasValidSecret } from './hasValidSecret';

export function initializeStorage(options: CookieSessionStorageOptions) {
  const userCookieOptionsEntries = Object.entries(options.cookie);
  const safeUserCookieOptionsEntries = userCookieOptionsEntries.filter(
    (option) => option[1] !== undefined
  );

  const safeUserCookieOptions = Object.fromEntries(
    safeUserCookieOptionsEntries
  ) as CookieSessionStorageCookieOptions;

  if (
    safeUserCookieOptions.secrets &&
    !hasValidSecret(safeUserCookieOptions.secrets)
  ) {
    throw new Error('Secrets array can not contain any empty strings');
  }

  const {
    name: cookieName,
    secrets,
    omitSignPrefix,
    ...cookieOptions
  } = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
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
    debug: options.debug ? true : false,
  };
}
