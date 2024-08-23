import { expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { CookieSession } from '../src/CookieSession';
import {
  createMockCookiesApi,
  createMockNextRequest,
  mockData,
  encodedCookie,
  cookieWithoutSession,
  secrets,
  signedEncodedCookie,
  invalidSignedCookie,
  createMockNextApiRequest,
} from './mocks';

it('should set a new CookieSession correctly with the three source types', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  // NextRequest
  const mockNextRequest = createMockNextRequest(cookieWithoutSession);
  const session = await getSession(mockNextRequest);

  expect(session).toBeInstanceOf(CookieSession);
  expect(session.getData()).toEqual({});

  // NextApiRequest
  const mockNextApiRequest = createMockNextApiRequest(cookieWithoutSession);
  const session2 = await getSession(mockNextApiRequest);

  expect(session2).toBeInstanceOf(CookieSession);
  expect(session2.getData()).toEqual({});

  // Cookies API
  const mockCookiesApi = createMockCookiesApi(cookieWithoutSession);
  const session3 = await getSession(mockCookiesApi);

  expect(session3).toBeInstanceOf(CookieSession);
  expect(session3.getData()).toEqual({});
});

it('should return correct data from an encoded cookie', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  // NextRequest
  const mockNextRequest = createMockNextRequest(encodedCookie);
  const session = await getSession(mockNextRequest);
  expect(session.getData()).toEqual(mockData);

  // NextApiRequest
  const mockNextApiRequest = createMockNextApiRequest(encodedCookie);
  const session2 = await getSession(mockNextApiRequest);
  expect(session2.getData()).toEqual(mockData);

  // Cookies API
  const mockCookiesApi = createMockCookiesApi(encodedCookie);
  const session3 = await getSession(mockCookiesApi);
  expect(session3.getData()).toEqual(mockData);
});

it('should return correct data from a signed and encoded cookie', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      secrets: ['qwerty'],
    },
  });

  // NextRequest
  const mockNextRequest = createMockNextRequest(signedEncodedCookie);
  const session = await getSession(mockNextRequest);
  expect(session.getData()).toEqual(mockData);

  // NextApiRequest
  const mockNextApiRequest = createMockNextApiRequest(signedEncodedCookie);
  const session2 = await getSession(mockNextApiRequest);
  expect(session2.getData()).toEqual(mockData);

  // Cookies API
  const mockCookiesApi = createMockCookiesApi(signedEncodedCookie);
  const session3 = await getSession(mockCookiesApi);
  expect(session3.getData()).toEqual(mockData);
});

it('should return an empty session if unsigning fails', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      secrets: [...secrets],
    },
  });

  // NextRequest
  const mockNextRequest = createMockNextRequest(invalidSignedCookie);
  const session = await getSession(mockNextRequest);
  expect(session.getData()).toEqual({});

  // NextApiRequest
  const mockNextApiRequest = createMockNextApiRequest(invalidSignedCookie);
  const session2 = await getSession(mockNextApiRequest);
  expect(session2.getData()).toEqual({});

  // Cookies API
  const mockCookiesApi = createMockCookiesApi(invalidSignedCookie);
  const session3 = await getSession(mockCookiesApi);
  expect(session3.getData()).toEqual({});
});
