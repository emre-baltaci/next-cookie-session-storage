import { CookieOptions } from './createCookieSessionStorage';

export type CookieObject = {
  name: string;
  value: string;
  // options?: CookieOptions;
} | null;

//Middleware and API route request parameter
export interface NextRequestInterface {
  cookies: {
    get: (name: string) => CookieObject | undefined;
  };
}

// getServerSideProps request parameter
export interface NextApiRequestInterface {
  cookies: Record<string, string>;
}

export interface CookiesApiInterface {
  get: (name: string) => CookieObject | undefined;
  set: (name: string, value: string, options?: CookieOptions) => void;
}

export enum SourceType {
  'NEXT_REQUEST' = 'next-request',
  'NEXT_API_REQUEST' = 'next-api-request',
  'COOKIES_API' = 'cookies-api',
}

export type NextRequestSource = {
  type: SourceType.NEXT_REQUEST;
  data: NextRequestInterface;
};

export type NextApiRequestSource = {
  type: SourceType.NEXT_API_REQUEST;
  data: NextApiRequestInterface;
};

export type CookiesApiSource = {
  type: SourceType.COOKIES_API;
  data: CookiesApiInterface;
};

export type CookieSource =
  | NextRequestSource
  | NextApiRequestSource
  | CookiesApiSource
  | never;
