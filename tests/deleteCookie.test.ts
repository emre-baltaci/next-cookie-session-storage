import { it, expect, vi } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';

function createSpyCookiesApi() {
  return { get: () => null, set: vi.fn() };
}

const defaultMaxAgeValue = 3600;

// declared here on purpose to simulate module-scope usage
const { getSession, setCookie, deleteCookie } = createCookieSessionStorage({
  cookie: {
    name: 'session',
    httpOnly: false,
    secure: false,
    path: '/test',
    maxAge: defaultMaxAgeValue,
  },
});

it('should expire the cookie', async () => {
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

  await deleteCookie(session);

  expect(cookiesApi.set).toBeCalledTimes(2);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: 0,
      path: '/test',
      secure: false,
    })
  );
});

it('should not leak deleted cookie options to later calls', async () => {
  const cookiesApi = createSpyCookiesApi();
  const session1 = await getSession(cookiesApi);

  await deleteCookie(session1);

  expect(cookiesApi.set).toBeCalledTimes(1);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: 0,
      path: '/test',
      secure: false,
    })
  );

  const cookiesApi2 = createSpyCookiesApi();
  const session2 = await getSession(cookiesApi2);
  session2.set('user', 'test');
  await setCookie(session2);

  expect(cookiesApi2.set).toBeCalledTimes(1);
  expect(cookiesApi2.set).toHaveBeenLastCalledWith(
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

it('should pass the errors onto the consumer correctly', async () => {
  // we mock the failing cookies API
  const cookiesApi = {
    get: () => null,
    set: vi.fn(() => {
      throw new Error(
        'Cookies can only be modified in a Server Action and Route Handler'
      );
    }),
  };

  const session = await getSession(cookiesApi);
  session.set('user', 'test');

  await expect(deleteCookie(session)).rejects.toThrowError(
    'setCookie failed to set the cookie'
  );
});
