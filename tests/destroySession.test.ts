import { expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { createMockNextRequest } from './mocks';

it('should set the maxAge property to 0', async () => {
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
