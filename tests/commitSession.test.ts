import { expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { createMockNextRequest } from './mocks';

it('should set a new cookie from the session', async () => {
  const expectedCookie = 'session=eyJ1c2VyIjoiVGVzdCJ9';

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);

  session.set('user', 'Test');
  const cookie = await commitSession(session);

  expect(cookie).toContain(expectedCookie);
});

it('should set a new signed cookie from the session', async () => {
  const expectedSignedEncodedCookie =
    'session=s%3AeyJ1c2VyIjoiVGVzdCJ9.2e3096f343dc85b479e8824f5a83953c4d416cdf862f1eada3129b3eef9a68d3'; // URL encoded

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      secrets: ['qwerty'],
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);

  session.set('user', 'Test');
  const cookie = await commitSession(session);

  expect(cookie).toContain(expectedSignedEncodedCookie);
});

it('should set a new signed cookie from the session without "s:" prefix', async () => {
  const expectedSignedEncodedCookie =
    'session=eyJ1c2VyIjoiVGVzdCJ9.2e3096f343dc85b479e8824f5a83953c4d416cdf862f1eada3129b3eef9a68d3';

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      secrets: ['qwerty'],
      omitSignPrefix: true,
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);

  session.set('user', 'Test');
  const cookie = await commitSession(session);

  expect(cookie).toContain(expectedSignedEncodedCookie);
});

it('should set the cookie with default cookie options', async () => {
  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);
  const commitedCookie = await commitSession(session);

  expect(commitedCookie).toContain('HttpOnly');
  expect(commitedCookie).toContain('Path=/');
  expect(commitedCookie).toContain('Secure');
});

it('should set the user defined cookie options correctly', async () => {
  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      httpOnly: false,
      secure: false,
      path: '/test',
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);
  const commitedCookie = await commitSession(session);

  expect(commitedCookie).not.toContain('HttpOnly');
  expect(commitedCookie).not.toContain('Secure');
  expect(commitedCookie).toContain('Path=/test');
});
