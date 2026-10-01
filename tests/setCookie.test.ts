import { it, expect, vi } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';

function createSpyCookiesApi() {
  return { get: () => null, set: vi.fn() };
}

const defaultMaxAgeValue = 3600;
const overriddenMaxAgeValue = 60;

// declared here on purpose to simulate module-scope usage
const { getSession, setCookie } = createCookieSessionStorage({
  cookie: {
    name: 'session',
    httpOnly: false,
    secure: false,
    path: '/test',
    maxAge: defaultMaxAgeValue,
  },
});

it('should override cookie options correctly', async () => {
  const cookiesApi = createSpyCookiesApi();

  const session = await getSession(cookiesApi);
  session.set('user', 'test');
  await setCookie(session);

  expect(cookiesApi.set).toBeCalledTimes(1);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: defaultMaxAgeValue,
      path: '/test',
      secure: false,
    })
  );

  await setCookie(session, { maxAge: overriddenMaxAgeValue });
  expect(cookiesApi.set).toBeCalledTimes(2);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: overriddenMaxAgeValue,
      path: '/test',
      secure: false,
    })
  );
});

it('should not leak overridden cookie options into later calls', async () => {
  const cookiesApi = createSpyCookiesApi();

  const session = await getSession(cookiesApi);
  session.set('user', 'test');
  await setCookie(session, { maxAge: overriddenMaxAgeValue });

  expect(cookiesApi.set).toBeCalledTimes(1);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: overriddenMaxAgeValue,
      path: '/test',
      secure: false,
    })
  );

  await setCookie(session);

  expect(cookiesApi.set).toBeCalledTimes(2);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: defaultMaxAgeValue,
      path: '/test',
      secure: false,
    })
  );
});
