import { it, expect, vi } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { CookiesApiInterface } from '../src/types/cookie-sources';
import { createMockCookiesApi } from './mocks';

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

  expect(cookiesApi.set).toHaveBeenCalledTimes(1);
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

  expect(cookiesApi.set).toHaveBeenCalledTimes(2);
  expect(cookiesApi.set).toHaveBeenLastCalledWith(
    'session',
    expect.any(String),
    expect.objectContaining({
      httpOnly: false,
      maxAge: 0,
      expires: new Date(0),
      path: '/test',
      secure: false,
    })
  );
});

it('should reset the session data when cookie is deleted', async () => {
  const cookiesApi = createSpyCookiesApi();
  let session = await getSession(cookiesApi);

  session.set('user', 'test');
  await setCookie(session);

  expect(session.getData()).toStrictEqual({ user: 'test' });

  await deleteCookie(session);

  expect(session.getData()).toStrictEqual({});

  // we also check the cookies value by retrieving it back
  const lastCallParameters = cookiesApi.set.mock.lastCall as Parameters<
    CookiesApiInterface['set']
  >;
  const deletedCookieValue = lastCallParameters[1];

  const cookiesApiMock = createMockCookiesApi(`session=${deletedCookieValue};`);
  session = await getSession(cookiesApiMock);

  expect(session.getData()).toStrictEqual({});
});

it('should not leak deleted cookie options to later calls', async () => {
  const cookiesApi = createSpyCookiesApi();
  const session1 = await getSession(cookiesApi);

  await deleteCookie(session1);

  expect(cookiesApi.set).toHaveBeenCalledTimes(1);
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

  expect(cookiesApi2.set).toHaveBeenCalledTimes(1);
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

  await expect(deleteCookie(session)).rejects.toThrow(
    'setCookie failed to set the cookie'
  );
});
