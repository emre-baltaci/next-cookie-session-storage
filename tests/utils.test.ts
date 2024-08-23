import { expect, it, describe } from 'vitest';
import {
  createMockCookiesApi,
  createMockNextApiRequest,
  createMockNextRequest,
} from './mocks';
import { setSourceObject } from '../src/lib/setSourceObject';
import { getSessionCookieValue } from '../src/lib/getSessionCookieValue';
import {
  encodeToBase64,
  decodeFromBase64,
  isEncodingEnabled,
  decode,
} from '../src/lib/encode-decode';
import { sign, unsign } from '../src/lib/sign-unsign';
import { SourceType } from '../src/types/cookie-sources';
import { ConfiguredEncodingOptions } from '../src/types/createCookieSessionStorage';
import { encode } from '../src/lib/encode-decode';

describe('setSourceObject', () => {
  it('should set a NextRequestSource object from NextRequest', () => {
    const mockNextRequest = createMockNextRequest('');
    const sourceObject = setSourceObject(mockNextRequest);

    expect(sourceObject).toEqual({
      type: SourceType.NEXT_REQUEST,
      data: mockNextRequest,
    });
  });

  it('should set a NextApiRequestSource object from NextApiRequest', () => {
    const mockNextApiRequest = createMockNextApiRequest('');
    const sourceObject = setSourceObject(mockNextApiRequest);

    expect(sourceObject).toEqual({
      type: SourceType.NEXT_API_REQUEST,
      data: mockNextApiRequest,
    });
  });

  it('should set a CookiesApiSource object from Cookies API', () => {
    const mockCookiesApi = createMockCookiesApi('');
    const sourceObject = setSourceObject(mockCookiesApi);

    expect(sourceObject).toEqual({
      type: SourceType.COOKIES_API,
      data: mockCookiesApi,
    });
  });
});

describe('getSessionCookieValue', () => {
  it('should return the cookie value from NextRequestSource object', () => {
    const mockNextRequest = createMockNextRequest('session=test;');
    const sourceObject = setSourceObject(mockNextRequest);
    const cookieValue = getSessionCookieValue(sourceObject, 'session');

    expect(cookieValue).toBe('test');
  });

  it('should return the cookie value from CookiesApiSource object', () => {
    const mockCookiesApi = createMockCookiesApi('session=test;');
    const sourceObject = setSourceObject(mockCookiesApi);
    const cookieValue = getSessionCookieValue(sourceObject, 'session');

    expect(cookieValue).toBe('test');
  });
});

describe('isEncodingEnabled', () => {
  it('should wroks correctly', () => {
    const optionsWithCustomEncoding: ConfiguredEncodingOptions = {
      encoder: (val: string) => {
        return val;
      },
      encoderParams: [],
      decoder: (val: string) => {
        return val;
      },
      decoderParams: [],
    };

    expect(isEncodingEnabled(true)).toBe(true);
    expect(isEncodingEnabled(false)).toBe(false);
    expect(isEncodingEnabled(optionsWithCustomEncoding)).toBe(true);
  });
});

describe('encode', () => {
  it('should encode to Base64 when encoding is set to true', () => {
    const expectedResult = Buffer.from('test').toString('base64');

    expect(encode('test', true)).toBe(expectedResult);
  });

  it('should return the original value when encoding is set to false', () => {
    expect(encode('test', false)).toBe('test');
  });

  it('should encode correctly with the encoder function (No params)', () => {
    const expectedResult = 'tset';

    function reverseString(value: string) {
      return value.split('').reverse().join('');
    }

    const options = {
      encoder: reverseString,
      encoderParams: [],
      decoder: reverseString,
      decoderParams: [],
    };

    expect(encode('test', options)).toBe(expectedResult);
  });

  it('should encode correctly with the encoder function (With params)', () => {
    const expectedResult = 'tsettesttest';

    function encoder(value: string, suffix: string, count: number) {
      let reversed = value.split('').reverse().join('');
      for (let i = 0; i < count; i++) {
        reversed += suffix;
      }

      return reversed;
    }

    const options: ConfiguredEncodingOptions = {
      encoder,
      encoderParams: ['test', 2],
      decoder: (val) => val, // dummy decoder
      decoderParams: [],
    };

    expect(encode('test', options)).toBe(expectedResult);
  });
});

describe('decode', () => {
  it('should decode from Base64 when encoding is set to true', () => {
    const encodedString = Buffer.from('test').toString('base64');

    expect(decode(encodedString, true)).toBe('test');
  });

  it('should return the original value when encoding is set to false', () => {
    expect(decode('test', false)).toBe('test');
  });

  it('should decode correctly with the decoder function (No params)', () => {
    const expectedResult = 'tset';

    function reverseString(value: string) {
      return value.split('').reverse().join('');
    }

    const options = {
      encoder: reverseString,
      encoderParams: [],
      decoder: reverseString,
      decoderParams: [],
    };

    expect(decode('test', options)).toBe(expectedResult);
  });

  it('should decode correctly with the decoder function (With params)', () => {
    const expectedResult = 'tsettesttest';

    function decoder(value: string, suffix: string, count: number) {
      let reversed = value.split('').reverse().join('');
      for (let i = 0; i < count; i++) {
        reversed += suffix;
      }

      return reversed;
    }

    const options: ConfiguredEncodingOptions = {
      encoder: (val) => val, // dummy encoder
      encoderParams: [],
      decoder,
      decoderParams: ['test', 2],
    };

    expect(decode('test', options)).toBe(expectedResult);
  });
});

describe('sign and unsign', () => {
  const secret = 'qwerty';
  const data = 'test';
  const signature =
    'bd38e4ddb0f30bafded933829fe42494ccb1b1fa257c171e1e15cd33533bef53'; // value: test, secret: qwerty

  it('should sign correctly with prefix', () => {
    const signedData = sign({ data, secret });

    expect(signedData).toBe(`s:${data}.${signature}`);
  });

  it('should sign correctly without prefix', () => {
    const signedData = sign({
      data,
      secret,
      options: { omitSignPrefix: true },
    });

    expect(signedData).toBe(`${data}.${signature}`);
  });

  it('should unsign correctly with prefix', () => {
    const signedData = sign({ data, secret });
    const unsignedData = unsign({ signedData, secrets: [secret] });

    expect(unsignedData).toBe(data);
  });

  it('should unsign correctly without prefix', () => {
    const signedData = sign({
      data,
      secret,
      options: { omitSignPrefix: true },
    });
    const unsignedData = unsign({ signedData, secrets: [secret] });

    expect(unsignedData).toBe(data);
  });

  it('should return undefined if signature is invalid', () => {
    const signedData = sign({ data, secret });
    const unsignedData = unsign({ signedData, secrets: ['invalid'] });

    expect(unsignedData).toBe(undefined);
  });
});
