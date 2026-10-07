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

it('should throw error if called outside server actions', async () => {
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

  await expect(setCookie(session)).rejects.toThrow(
    'setCookie failed to set the cookie'
  );
});

it('should override cookie options correctly', async () => {
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

  await setCookie(session, { maxAge: overriddenMaxAgeValue });
  expect(cookiesApi.set).toHaveBeenCalledTimes(2);
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

  expect(cookiesApi.set).toHaveBeenCalledTimes(1);
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

  expect(cookiesApi.set).toHaveBeenCalledTimes(2);
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

it('should write the cookie to its own request when requests overlap', async () => {
  const cookiesApi1 = createSpyCookiesApi();
  const cookiesApi2 = createSpyCookiesApi();

  const session1 = await getSession(cookiesApi1);
  const session2 = await getSession(cookiesApi2);

  session1.set('user1', 'test1');
  session2.set('user2', 'test2');

  await setCookie(session1);

  expect(cookiesApi1.set).toHaveBeenCalledTimes(1);
  expect(cookiesApi2.set).toHaveBeenCalledTimes(0);

  await setCookie(session2);

  expect(cookiesApi1.set).toHaveBeenCalledTimes(1);
  expect(cookiesApi2.set).toHaveBeenCalledTimes(1);
});

it('should throw an error when the session source is not accessible', async () => {
  // we need a second createCookieSessionStorage call to pass an unrelated session to setCookie()
  const { setCookie: setCookieToFail } = createCookieSessionStorage({
    cookie: {
      name: 'session',
      httpOnly: false,
      secure: false,
      path: '/test',
      maxAge: defaultMaxAgeValue,
    },
  });

  const cookiesApi = createSpyCookiesApi();
  const session = await getSession(cookiesApi);

  session.set('user', 'test');
  await expect(setCookieToFail(session)).rejects.toThrow('Invalid session');
});
