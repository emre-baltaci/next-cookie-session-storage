import { expect, it, describe } from 'vitest';
import {
  createMockCookiesApi,
  createMockNextApiRequest,
  createMockNextRequest,
} from './mocks';
import { setSourceObject } from '../src/lib/setSourceObject';
import { getSessionCookieValue } from '../src/lib/getSessionCookieValue';
import { sign, unsign } from '../src/lib/sign-unsign';
import { SourceType } from '../src/types/cookie-sources';
import { hasValidSecret } from '../src/lib/hasValidSecret';

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

describe('sign and unsign', () => {
  const secret = 'qwerty';
  const data = 'test';
  const signature =
    'bd38e4ddb0f30bafded933829fe42494ccb1b1fa257c171e1e15cd33533bef53'; // value: test, secret: qwerty

  it('should sign correctly with prefix', async () => {
    const signedData = await sign({ data, secret });

    expect(signedData).toBe(`s:${data}.${signature}`);
  });

  it('should sign correctly without prefix', async () => {
    const signedData = await sign({
      data,
      secret,
      options: { omitSignPrefix: true },
    });

    expect(signedData).toBe(`${data}.${signature}`);
  });

  it('should unsign correctly with prefix', async () => {
    const signedData = await sign({ data, secret });
    const unsignedData = await unsign({ signedData, secrets: [secret] });

    expect(unsignedData).toBe(data);
  });

  it('should unsign correctly without prefix', async () => {
    const signedData = await sign({
      data,
      secret,
      options: { omitSignPrefix: true },
    });
    const unsignedData = await unsign({ signedData, secrets: [secret] });

    expect(unsignedData).toBe(data);
  });

  it('should return undefined if signature is invalid', async () => {
    const signedData = await sign({ data, secret });
    const unsignedData = await unsign({ signedData, secrets: ['invalid'] });

    expect(unsignedData).toBe(undefined);
  });

  it('should parse the signature correctly', async () => {
    const secret = 'qwerty';

    const signedData = await sign({
      data: 'encoded.data.with.dots',
      secret: secret,
    });

    const validatedData = await unsign({ signedData, secrets: [secret] });

    expect(validatedData).not.toBe(undefined);
  });
});

describe('hasValidSecrets', () => {
  it('should detect if there is any empty strings among the secrets', () => {
    const validSecrets = ['test', 'test2'];
    const inValidSecrets = ['test', ''];

    expect(hasValidSecret(validSecrets)).toEqual(true);
    expect(hasValidSecret(inValidSecrets)).toEqual(false);
  });
});
