export type CookieSessionStorageOptions = {
  cookie: CookieSessionStorageCookieOptions;
  encoding?: EncodingOptions;
};

export type EncodingOptions =
  | boolean
  | {
      encoder: (value: string, ...args: any[]) => string;
      encoderParams?: any[];
      decoder: (value: string, ...args: any[]) => string;
      decoderParams?: any[];
    }
  | undefined;

export type ConfiguredEncodingOptions =
  | boolean
  | {
      encoder: (value: string, ...args: any[]) => string;
      encoderParams: any[];
      decoder: (value: string, ...args: any[]) => string;
      decoderParams: any[];
    };

export type EncoderFunctionWithParams = (
  value: string,
  ...args: any[]
) => string;
export type EncoderFunctionWithoutParams = (value: string) => string;
export type EncoderFunction =
  | EncoderFunctionWithParams
  | EncoderFunctionWithoutParams;

export type CookieOptions = {
  domain?: string | undefined;
  httpOnly?: boolean | undefined;
  expires?: Date | undefined;
  maxAge?: number | undefined;
  path?: string | undefined;
  samSite?: 'lax' | 'strict' | 'none' | undefined;
  partitioned?: boolean | undefined;
  priority?: 'low' | 'medium' | 'high' | undefined;
  secure?: boolean | undefined;
};

export type CookieSessionStorageCookieOptions = CookieOptions & {
  name: string;
  secrets?: string[] | undefined;
  omitSignPrefix?: boolean | undefined;
};
