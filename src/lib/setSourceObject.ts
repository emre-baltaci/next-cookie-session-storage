import {
  CookiesApiInterface,
  CookieSource,
  NextApiRequestInterface,
  NextRequestInterface,
  SourceType,
} from '../types/cookie-sources';

export function setSourceObject(source: unknown): CookieSource {
  // The order of the checks is important. Don't change it.
  if (
    (source as NextRequestInterface).cookies !== undefined &&
    (source as NextRequestInterface).cookies.get !== undefined
  ) {
    return {
      type: SourceType.NEXT_REQUEST,
      data: source as NextRequestInterface,
    };
  }

  if (
    (source as NextApiRequestInterface).cookies !== undefined &&
    typeof (source as NextApiRequestInterface).cookies === 'object'
  ) {
    return {
      type: SourceType.NEXT_API_REQUEST,
      data: source as NextApiRequestInterface,
    };
  }

  if ((source as CookiesApiInterface).get !== undefined) {
    return {
      type: SourceType.COOKIES_API,
      data: source as CookiesApiInterface,
    };
  }

  throw new Error(
    'Invalid source. Please pass a Request object or the return value of a Cookies API call (Cookies()) as the source.'
  );
}
