import { expect, it, vi, afterEach } from 'vitest';
import { createCookieSessionStorage } from '../src';
import { createMockNextRequest, junkCookie } from './mocks';

const spyConsoleWarn = vi.spyOn(console, 'warn');

afterEach(() => {
  spyConsoleWarn.mockReset();
});

it('should log a warning on decode errors when debug is enabled', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
    debug: true,
  });

  const mockNextRequest = createMockNextRequest(junkCookie);
  await getSession(mockNextRequest);

  expect(spyConsoleWarn).toHaveBeenCalledTimes(1);
});

it('should not log a warning on decode errors when debug is disabled', async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
    debug: false,
  });

  const mockNextRequest = createMockNextRequest(junkCookie);
  await getSession(mockNextRequest);

  expect(spyConsoleWarn).toHaveBeenCalledTimes(0);
});
