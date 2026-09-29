import { expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { createMockNextRequest } from './mocks';

it('should expire the session cookie', async () => {
  const expectedCookieOption = 'Max-Age=0';
  const { getSession, destroySession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  const mockNextRequest = createMockNextRequest('');
  const session = await getSession(mockNextRequest);

  session.set('user', 'Test');
  const cookie = await destroySession(session);

  expect(cookie).toContain(expectedCookieOption);
});

it("should not override other session's cookie settings", async () => {
  const expectedDestroyedCookieOption = 'Max-Age=0';

  const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
      cookie: {
        name: 'session',
      },
    });

  const mockNextRequest1 = createMockNextRequest('');
  const sessionToBeDestroyed = await getSession(mockNextRequest1);

  sessionToBeDestroyed.set('user', 'Test');
  const cookie = await destroySession(sessionToBeDestroyed);

  expect(cookie).toContain(expectedDestroyedCookieOption);

  const mockNextRequest2 = createMockNextRequest('');
  const newSession = await getSession(mockNextRequest2);

  newSession.set('another user', 'Test');
  const newCookie = await commitSession(newSession);

  expect(newCookie).not.toContain('Max-Age');
});
