import {
  CookieObject,
  CookiesApiInterface,
  NextApiRequestInterface,
  NextRequestInterface,
} from '../src/types/cookie-sources';
import npmCookie from 'cookie';

export const cookieName = 'session';
export const secrets = ['another-secret', 'qwerty'];

export const mockData = {
  user: 'Test',
  id: 1111,
};

export const encodedData = 'eyJ1c2VyIjoiVGVzdCIsImlkIjoxMTExfQ=='; // Base64
export const signature =
  'ed4b704ac83a714e453df73f50e85818ed029e08d0bd9756fde6e56ace0c20c1'; // secret: 'qwerty' text: encodedData

export const encodedCookie = `${cookieName}=${encodedData}`;
export const signedEncodedCookie = `${cookieName}=s:${encodedData}.${signature}`;
export const signedEncodedCookieWithoutPrefix = `${encodedCookie}.${signature}`;
export const invalidSignedCookie =
  '${cookieName}=s:${encodedData}.aa4b704ac83a714e453df73f50e85818ed029e08d0bd9756fde6e56ace0c20c1';
export const cookieWithoutSession = 'test=Test';

export function createMockNextRequest(cookie: string): NextRequestInterface {
  return {
    cookies: {
      get: (key: string): CookieObject => {
        if (cookie === '') {
          return null;
        }
        const [name, valueWithOptions] = cookie.split(/=(.+)/);
        const [value] = valueWithOptions.split(';', 1);
        if (name !== key) {
          return null;
        }

        return {
          name,
          value,
        };
      },
    },
  };
}

export function createMockNextApiRequest(
  cookie: string
): NextApiRequestInterface {
  const cookies = {};

  const parsedCookies = npmCookie.parse(cookie);

  for (const key in parsedCookies) {
    cookies[key] = parsedCookies[key];
  }

  return {
    cookies,
  };
}

export function createMockCookiesApi(cookie: string): CookiesApiInterface {
  return {
    get: (key: string): CookieObject => {
      if (cookie === '') {
        return null;
      }
      const [name, valueWithOptions] = cookie.split(/=(.+)/);
      const [value] = valueWithOptions.split(';', 1);
      if (name !== key) {
        return null;
      }

      return {
        name,
        value,
      };
    },
    set: (key: string, value: string) => {
      return;
    },
  };
}
