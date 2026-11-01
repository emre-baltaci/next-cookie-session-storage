import { CookieOptions } from '../types/createCookieSessionStorage';

export function filterUnsafeCookieOptions(
  cookieOptions: CookieOptions
): CookieOptions {
  const optionsArray = Object.entries(cookieOptions);

  const safeOptionsArray = optionsArray.filter(
    (option) => option[1] !== undefined
  );

  return Object.fromEntries(safeOptionsArray);
}
