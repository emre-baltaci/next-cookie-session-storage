import { beforeEach, expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';

beforeEach(() => {
  global.window = undefined as any;
});

it('should throw an error if global window is defined', () => {
  global.window = {} as any;

  expect(() =>
    createCookieSessionStorage({
      cookie: {
        name: 'session',
      },
    })
  ).toThrow('This library is intended for server-side use only.');
});

it('should return the session methods', () => {
  const session = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  expect(session).toHaveProperty('getSession');
  expect(typeof session.getSession).toBe('function');

  expect(session).toHaveProperty('commitSession');
  expect(typeof session.commitSession).toBe('function');

  expect(session).toHaveProperty('destroySession');
  expect(typeof session.destroySession).toBe('function');

  expect(session).toHaveProperty('setCookie');
  expect(typeof session.setCookie).toBe('function');
});

it('throws error if the secrets array contains any empty string', () => {
  expect(() =>
    createCookieSessionStorage({
      cookie: {
        name: 'session',
        secrets: ['test', 'test2'],
      },
    })
  ).not.toThrow();

  expect(() =>
    createCookieSessionStorage({
      cookie: {
        name: 'session',
        secrets: ['test', ''],
      },
    })
  ).toThrow('Secrets array can not contain any empty strings');
});
