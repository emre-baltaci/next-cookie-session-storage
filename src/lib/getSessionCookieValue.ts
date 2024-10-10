import {
  type CookiesApiInterface,
  type CookieSource,
  type NextApiRequestInterface,
  type NextRequestInterface,
  SourceType,
} from '../types/cookie-sources';

export function getSessionCookieValue(
  source: CookieSource,
  cookieName: string
) {
  switch (source.type) {
    case SourceType.NEXT_REQUEST:
      return (source.data as NextRequestInterface).cookies.get(cookieName)
        ?.value;
    case SourceType.NEXT_API_REQUEST:
      return (source.data as NextApiRequestInterface).cookies[cookieName];
    case SourceType.COOKIES_API:
      return (source.data as CookiesApiInterface).get(cookieName)?.value;
    default:
      throw new Error('This must be impossible due to the previous checks.');
  }
}
