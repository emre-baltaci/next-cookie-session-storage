# next-cookie-session-storage

## Table of contents

- [Description](#description)
- [Features](#features)
- [Notes](#notes)
- [Installation](#installation)
- [Usage](#usage)
  - [With API route handlers](#usage-api-route-handler)
  - [With middlewares](#usage-middlewares)
  - [With server actions](#usage-server-actions)
  - [With getServerSideProps](#usage-getserversideprops)
  - [Setting and manipulating session data](#setting-session-data)
  - [Destroying session](#destroying-session)
  - [Signing](#signing)
  - [Encoding](#encoding-usage)
- [API reference](#api-reference)
  - [createCookieSessionStorage](#ccss-reference)
  - [Session instance](#session-instance-reference)
  - [Custom encoding](#encoding-reference)
- [Licence](#licence)

<a id="Description"></a>

## Description

A cookie-based session storage API for Next.js projects, similar to Remix's createCookieSessionStorage. It provides an easy-to-use API for creating and managing cookie sessions, including encoding and signing.

<a id="features"></a>

## Features

- Cookie-based session storage.
- Easy integration with Next.js.
- Built-in Base64 encoding.
- Built-in support for signing.
- Supports custom encoding and encryption.
- Compatible with middlewares, route handlers, server actions and getServerSideProps.

<a id="notes"></a>

## Notes

- This library is designed for use in server-side environments only.
- Cookies are HttpOnly and Secure, with the Path set to '/' by default.
- Cookies are encoded to Base64 by default, but this can be disabled or customized.

<a id="installation"></a>

## Installation

```sh
$ npm install next-cookie-session-storage
```

<a id="usage"></a>

## Usage

<a id="usage-api-route-handlers"></a>

### With API route handlers

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

export async function GET(request) {
  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: { name: '<session cookie name>' },
  });

  const session = await getSession(request);

  session.set('id', 1111);

  const response = NextResponse.json({ message: 'success' }, { status: 200 });
  response.headers.set('Set-Cookie', await commitSession(session));
  return response;
}
```

<a id="usage-middlewares"></a>

### With middlewares

```js
import { NextResponse } from 'next/server';
import { createCookieSessionStorage } from 'next-cookie-session-storage';

export async function middleware(request) {
  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: { name: '<session cookie name>' },
  });

  const session = await getSession(request);

  session.set('id', 1111);

  const response = NextResponse.next();
  response.headers.set('Set-Cookie', await commitSession(session));

  return response;
}
```

<a id="usage-server-actions"></a>

### With server actions

```js
'use server';
import { createCookieSessionStorage } from 'next-cookie-session-storage';
import { cookies } from 'next/headers';

export async function serverAction() {
  const { getSession, setCookie } = createCookieSessionStorage({
    cookie: { name: '<session cookie name>' },
  });

  const session = await getSession(cookies());

  session.set('id', 1111);

  setCookie(session);

  return; //...
}
```

<a id="usage-getserversideprops"></a>

### With getServerSideProps

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

export const getServerSideProps = async ({ req, res }) => {
  const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
      cookie: {
        name: '<session-cookie-name>',
      },
    });

  const session = await getSession(req);

  session.set('id', 1111);

  res.setHeader('Set-Cookie', await commitSession(session));
  return {
    props: {},
  };
};
```

<a id="setting-session-data"></a>

### Setting and manipulating session data

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

export async function GET(request: NextRequest) {
  const storage = createCookieSessionStorage({
    cookie: { name: 'en_session' },
  });

  const session = await storage.getSession(request);

  // setting a new data
  session.set('username', 'John Doe');
  session.set('id', 1111);

  // retrieving the value of a data
  session.get('username');

  // retrieving the entire session data
  session.getData(); // returns { username: 'John Doe', id: 1111 }

  // retrieving the session data as string
  session.toString();

  // deleting a data
  session.delete('username');
}
```

**Important!** Setting or manipulating session data does not automatically set the cookie. The session data must be finalized by committing it in a response's Set-Cookie header using `commitSession` method.

<a id="destroying-session"></a>

### Destroying a session

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

export async function GET(request) {
  const { getSession, destroySession } = createCookieSessionStorage({
    cookie: { name: '<session cookie name>' },
  });

  const session = await getSession(request);

  const response = NextResponse.json({ message: 'success' }, { status: 200 });
  response.headers.set('Set-Cookie', await destroySession(session));
  return response;
}
```

Destroying session with [`deleteCookie`](#deletecookie) method **(Cookies API only)**

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';
import { cookies } from 'next/headers';

export async function serverAction() {
  const storage = createCookieSessionStorage({
    cookie: { name: '<session-cookie-name>' },
  });

  const session = await storage.getSession(cookies());

  storage.deleteCookie(session); // this will work as destroySession

  return; //...;
}
```

<a id="signing"></a>

### Signing

The options.cookie parameter of the `createCookieSessionStorage` function includes a `secrets` property that accepts an array of strings. Once this array is provided, signing will be enabled automatically.

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

const storage = createCookieSessionStorage({
  cookie: { name: 'en_session', secrets: ['qwerty'] },
});
```

<a id="encoding-usage"></a>

### Encoding

Encoding can be enabled, disabled, or customized using the options parameter of the `createCookieSessionStorage` function. By default, cookies are encoded in `Base64`. You can disable this by setting the encoding option to `false`. Note that the cookie string will still be URI encoded.

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

const storage = createCookieSessionStorage({
  cookie: { name: 'en_session' },
  encoding: false, // Default encoding disabled
});
```

Custom encoding or encryption can be added by passing an object with `encoder` and `decoder` functions. These functions must accept at least one parameter, which is the value to encode or decode. If additional parameters are needed, they can be provided as arrays in the `encoderParams` and `decoderParams` properties. For more information, see [createCookieSessionStorage reference](#ccss-reference) and [Custom encoding](#encoding-reference)

**Example without additional parameters:**

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

function customEncoder(value) {
  // encode...

  return encodedValue;
}

function customDecoder(value) {
  // decode...

  return decodedValue;
}

const storage = createCookieSessionStorage({
  cookie: { name: 'en_session' },
  encoding: {
    encoder: customEncoder,
    decoder: customDecoder,
  },
});
```

**Example with additional parameters:**

```js
import { createCookieSessionStorage } from 'next-cookie-session-storage';

function customEncoder(value, secrets, salt) {
  // encode...

  return encodedValue;
}

function customDecoder(value, secrets, salt) {
  // decode...

  return decodedValue;
}

const storage = createCookieSessionStorage({
  cookie: { name: 'en_session' },
  encoding: {
    encoder: customEncoder,
    encoderParams: [process.env.ENCODING_SECRETS, process.env.SALT],
    decoder: customDecoder,
    decoderParams: [process.env.ENCODING_SECRETS, process.env.SALT],
  },
});
```

<a id="API-reference"></a>

## API reference

<a id="ccss-reference"></a>

### `createCookieSessionStorage<T>(options)`

Creates a cookie session storage.

```js
const storage = createCookieSessionStorage({
  cookie: { name: 'en_session' },
});
```

or you can strictly type the session data:

```typescript
const type SessionData = {
  user: string;
  id: number;
}

const storage = createCookieSessionStorage<SessionData>({
  cookie: { name: 'en_session' },
});
```

#### Type Parameters

T extends Record<string, any>: Defines the structure of the session data.

#### Parameters

#### `options`

**Type: Object**
Consists of `cookie` and `encoding` properties.

#### Returns

An object with the following methods:

**[`getSession`](#getsession-reference)**
**[`commitSession`](#commitsession-reference)**
**[`destroySession`](#destroysession-reference)**
**[`setCookie`](#setcookie-reference)**
**[`deleteCookie`](#deletecookie-reference)**

---

#### `options.cookie`

**Type: Object**

**`name`:** Session cookie name

**`domain`:** Specifies the value for the `Domain` attribute in the `Set-Cookie` header. By default, no domain is set, so most clients will consider the cookie to apply only to the current domain.

**`httpOnly`:** Specifies the boolean value for the `HttpOnly` attribute in the `Set-Cookie` header. By default, set to `true`.

**`expires`:** Specifies a `Date` object for the `Expires` attribute in the `Set-Cookie` header. By default, no expiration is set, so most clients will treat this as a "non-persistent cookie" and delete it under conditions such as closing the web browser.

**`maxAge`:** Specifies the number (in seconds) for the `Max-Age` attribute in the `Set-Cookie` header. The given number will be converted to an integer by rounding down. By default, no maximum age is set. According to the cookie storage model specification, if both `Expires` and `Max-Age` are set, `Max-Age` takes precedence. However, not all clients may adhere to this rule, so if both are used, they should refer to the same date and time.

**`path`:** Specifies the value for the `Path` attribute in the `Set-Cookie` header. By default, `path` is set to `"/"`

**`samSite`:** Can be `lax`, `strict` or `none`. `lax` will set the SameSite attribute to `Lax` , which provides lax same-site enforcement. `none` will set the SameSite attribute to `None`, indicating an explicit cross-site cookie. `strict` will set the `SameSite` attribute to `Strict`, enforcing strict same-site restrictions.

**`priority`:** Specifies the string to be the value for the `Priority` `Set-Cookie` attribute. `low` will set the Priority attribute to `Low`. `medium` will set the Priority attribute to `Medium`, which is the default when not specified. `high` will set the Priority attribute to `High`. This attribute is not yet fully standardized and may change in the future, meaning many clients might ignore it until it becomes more widely understood.

**`partitioned`:** Specifies the boolean value for the `Partitioned` attribute in the `Set-Cookie` header. By default, the `Partitioned` attribute is not set. This attribute is not yet fully standardized and may change in the future, meaning many clients might ignore it until it becomes more widely understood.

**`secure`:** Specifies the boolean value for the `Secure` attribute in the `Set-Cookie` header. By default, the `Secure` attribute is enabled, enforcing that the cookie is only sent over `HTTPS` connections.

**`secrets`:** Specifies the secrets used for signing. If no secrets are provided, signing is disabled.

**`omitSignPrefix`:** When set to `true`, omits the `s:` prefix from the cookie string.

---

#### `options.encoding`

**Type: Boolean | Object | undefined**

**Default:** enabled

```js
options.encoding = false; // Disables encoding
```

```js
options.encoding = true; // Explicitly enables encoding
```

or set as an object for custom encoding

```typescript
{
      encoder: (value: string, ...args: any[]) => string;
      encoderParams?: any[];
      decoder: (value: string, ...args: any[]) => string;
      decoderParams?: any[];
    }

```

See [Custom encoding](#encoding-reference) for details

---

<a id="methods-overview"></a>

### createCookieSessionStorage methods overview

<a id="getsession-reference"></a>

### `getSession`

Retrieves the session data from the cookie source.

```typescript
getSession(source: unknown): Promise<CookieSession<T>>
```

**Parameters**
source: unknown: The source from which to extract the cookie (e.g., NextRequest, cookies API).

**Returns**
Promise<CookieSession<T>>: A promise that resolves to the session object.

<a id="commitsession-reference"></a>

### `commitSession`

Serializes and signs the session data for setting in a cookie.

```typescript
commitSession(session: CookieSession<T>): Promise<string>
```

**Parameters**
session: CookieSession<T>: The session object containing the data to commit.

**Returns**
Promise<string>: A promise that resolves to the serialized cookie string.

<a id="destroysession-reference"></a>

### `destroySession`

Destroys the session by invalidating the cookie.

```typescript
destroySession(session: CookieSession<T>): Promise<string>
```

**Parameters**
session: CookieSession<T>: The session object to destroy.

**Returns**
Promise<string>: A promise that resolves to the serialized cookie string with maxAge set to 0.

<a id="setcookie-reference"></a>

### `setCookie`

Sets the session cookie using the Cookies API.
**Important!** Can only be used when the session is retrieved by Cookies API

```typescript
setCookie(session: CookieSession<T>): Promise<void>
```

**Parameters**
session: CookieSession<T>: The session object to set as a cookie.

**Returns**
Promise<void>: A promise that resolves once the cookie has been set.

<a id="deletecookie-reference"></a>

### `deleteCookie`

Deletes the session cookie using Cookies API.
**Important!** Can only be used when the session is retrieved by Cookies API

```typescript
deleteCookie(session: CookieSession<T>): Promise<void>
```

**Parameters**
session: CookieSession<T>: The session object to delete.

**Returns**
Promise<void>: A promise that resolves once the cookie has been deleted.

<a id="session-instance-reference"></a>

### Session instance

Created by the [`createCookieSessionStorage`](#ccss-reference) function's getSession method. Contains the following methods:
**[`set`](#session-set)**
**[`get`](#session-get)**
**[`delete`](#session-delete)**
**[`clear`](#session-clear)**
**[`getData`](#session-getdata)**
**[`toString`](#session-tostring)**

---

#### Methods

<a id="session-set"></a>

#### `set`

Sets the value of the specified key

```typescript
session.set(key: string, value: string): void

```

<a id="session-get"></a>

#### `get`

Retrieves the value of the specified key

```typescript
session.get(key: string): string
```

<a id="session-delete"></a>

#### `delete`

Removes the specified key from the session data

```typescript
session.delete(key: string): void
```

<a id="session-clear"></a>

#### `clear`

Clears the entire session data

```typescript
session.clear(): void

```

<a id="session-getdata"></a>

#### `getData`

Retrieves the entire session data as an object

```typescript
session.getData(): Object
```

<a id="session-tostring"></a>

#### `toString`

Retrieves the entire session data as a string

```typescript
session.toString(): string
```

<a id="encoding-reference"></a>

### Custom encoding

For custom encoding or encryption, set `options.encoding` to an object with the following properties:

**`encoder`:** Custom encoder function

```typescript
encoder: (value: string[, ...args: any[]]) => string
```

**Parameters**
**value:** Session data as string
(You can include additional parameters as needed. Be sure to add them to `encoderParams`.)

**Returns**
Encoded/encrypted string

**`encoderParams`:** encoder function extra parameters (Optional)

**`decoder`:** Custom decoder function

```typescript
decoder: (value: string[, ...args: any[]]) => string
```

**Parameters**
**value:** Encoded/encrypted string
(You can include additional parameters as needed. Be sure to add them to `decoderParams`.)

**Returns**
Decoded/decrypted session data as string

**`decoderParams`:** decoder function extra parameters (Optional)

<a id="licence"></a>

## License

This project is licensed under the MIT [License](./LICENCE).
