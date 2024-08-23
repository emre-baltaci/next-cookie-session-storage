import { beforeAll, expect, it } from 'vitest';
import { createCookieSessionStorage } from '../src/createCookieSessionStorage';
import { CookieSession } from '../src/CookieSession';
import { createMockNextRequest } from './mocks';

let session: CookieSession<any>;

beforeAll(async () => {
  const { getSession } = createCookieSessionStorage({
    cookie: {
      name: 'session',
    },
  });

  const mockNextRequest = createMockNextRequest('');
  session = await getSession(mockNextRequest);
});

it('should return the data with the getData method', async () => {
  session.set('id', 1111);
  expect(session.getData()).toEqual({ id: 1111 });
});

it('should set a new session property with the set method', async () => {
  session.set('user', 'Test');

  expect(session.getData()).toEqual({ user: 'Test', id: 1111 });
});

it('should update an existing session property with the set method', async () => {
  session.set('user', 'Test2');
  expect(session.getData()).toEqual({ user: 'Test2', id: 1111 });
});

it('should delete the session property with the delete method', async () => {
  session.delete('user');
  session.delete('id');

  expect(session.getData()).toEqual({});
});
