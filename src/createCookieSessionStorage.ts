import cookie from 'cookie';
import { CookieSession } from './CookieSession';
import { type CookieSessionStorageOptions } from './types/createCookieSessionStorage';
import { getSessionCookieValue } from './lib/getSessionCookieValue';
import { setSourceObject } from './lib/setSourceObject';
import { type CookieSource, SourceType } from './types/cookie-sources';
import { sign, unsign } from './lib/sign-unsign';
import { initializeStorage } from './lib/initializeStorage';

export function createCookieSessionStorage<T extends Record<string, any>>(
  options: CookieSessionStorageOptions
) {
  // this check is needed to prevent client-side usage
  if (typeof window !== 'undefined') {
    throw new Error('This library is intended for server-side use only.');
  }

  const {
    cookieName,
    secrets,
    omitSignPrefix = false,
    cookieOptions,
    encoder,
  } = initializeStorage(options);

  let cookieSource: CookieSource;

  const getSession = async (source: unknown) => {
    cookieSource = setSourceObject(source);

    let sessionCookieValue = getSessionCookieValue(cookieSource, cookieName);
    if (!sessionCookieValue) {
      return new CookieSession<T>({} as T);
    }

    if (secrets && secrets.length > 0) {
      sessionCookieValue = unsign({
        secrets,
        signedData: sessionCookieValue,
        options: { omitSignPrefix },
      });
    }

    let sessionData: T;
    try {
      if (encoder.isEnabled) {
        sessionCookieValue = encoder.decode(sessionCookieValue as string);
      }
      sessionData = JSON.parse(sessionCookieValue as string);
    } catch (error) {
      sessionData = {} as T;
    }

    return new CookieSession<T>(sessionData);
  };

  const commitSession = async (session: CookieSession<T>) => {
    let cookieValue = session.toString();
    if (encoder.isEnabled) {
      cookieValue = encoder.encode(cookieValue);
    }

    if (secrets && secrets.length > 0) {
      cookieValue = sign({
        data: cookieValue,
        secret: secrets[0],
        options: { omitSignPrefix },
      });
    }

    return cookie.serialize(cookieName, cookieValue, cookieOptions);
  };

  const destroySession = async (session: CookieSession<T>) => {
    cookieOptions.maxAge = 0;
    return commitSession(session);
  };

  // setCookie and deleteCookie are required to set and delete cookies
  // in server actions since they don't have access to the response object

  const setCookie = async (session: CookieSession<T>) => {
    switch (cookieSource.type) {
      case SourceType.NEXT_REQUEST:
        console.log(
          'Warning: setCookie and deleteCookie methods are not supported for NextRequest. Can only be used with Next.js Cookies Api. Your cookie will not be set.'
        );
        return;
      case SourceType.COOKIES_API:
        const cookiesApi = cookieSource.data;
        let cookieValue = session.toString();

        if (encoder.isEnabled) {
          cookieValue = encoder.encode(cookieValue);
        }

        if (secrets && secrets.length > 0) {
          cookieValue = sign({
            data: cookieValue,
            secret: secrets[0],
            options: { omitSignPrefix },
          });
        }
        try {
          cookiesApi.set(cookieName, cookieValue, cookieOptions);
        } catch (error) {
          throw new Error(`Error: setCookie failed to set the cookie.
            You might be using setCookie method inside a middleware or a server component.
            In middlewares set your cookies directly in the response object.
            In server components it's not allowed to set cookies. Instead use a middleware or API route.`);
        }
    }
  };

  const deleteCookie = async (session: CookieSession<T>) => {
    cookieOptions.maxAge = 0;
    setCookie(session);
  };

  return {
    getSession,
    commitSession,
    destroySession,
    setCookie,
    deleteCookie,
  };
}
