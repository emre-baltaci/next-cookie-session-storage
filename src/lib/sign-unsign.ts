export async function sign({
  data,
  secret,
  options = { omitSignPrefix: false },
}: {
  data: string;
  secret: string;
  options?: {
    omitSignPrefix: boolean;
  };
}): Promise<string> {
  const key = await getSignatureKey(secret);
  const rawSignature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  const signature = convertArrayBufferToHex(rawSignature);

  return `${!options.omitSignPrefix ? 's:' : ''}${data}.${signature}`;
}

export async function unsign({
  signedData,
  secrets,
  options = { omitSignPrefix: false },
}: {
  signedData: string;
  secrets: string[];
  options?: {
    omitSignPrefix: boolean;
  };
}): Promise<string | undefined> {
  const data = !options.omitSignPrefix ? removePrefix(signedData) : signedData;
  const lastDotIndex = data.lastIndexOf('.');
  const value = data.slice(0, lastDotIndex);
  const signature = data.slice(lastDotIndex + 1);
  const valueBuffer = new TextEncoder().encode(value);
  const signatureBuffer = convertHexToBytes(signature);

  if (!value || !signature || !signatureBuffer) {
    return undefined;
  }

  for (const secret of secrets) {
    const key = await getSignatureKey(secret);

    if (await crypto.subtle.verify('HMAC', key, signatureBuffer, valueBuffer)) {
      return value; // Signature valid
    }
  }

  return undefined;
}

// Helpers
function removePrefix(signedData: string) {
  return signedData.replace(/^s:/, '');
}

async function getSignatureKey(secret: string) {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function convertArrayBufferToHex(buffer: ArrayBuffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) => {
    const hexValue = byte.toString(16);
    return hexValue.padStart(2, '0');
  }).join('');
}

function convertHexToBytes(value: string) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) {
    return undefined;
  }

  const hexArray = value.match(/../g);

  if (!hexArray) {
    return undefined;
  }

  return new Uint8Array(Array.from(hexArray, (hex) => parseInt(hex, 16)));
}
