import CryptoJS from 'crypto-js';
import { timingSafeCompare } from './timingSafeCompare';

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

export function unsign({
  signedData,
  secrets,
  options = { omitSignPrefix: false },
}: {
  signedData: string;
  secrets: string[];
  options?: {
    omitSignPrefix: boolean;
  };
}): string | undefined {
  const data = !options.omitSignPrefix ? removePrefix(signedData) : signedData;
  const lastDotIndex = data.lastIndexOf('.');
  const value = data.slice(0, lastDotIndex);
  const signature = data.slice(lastDotIndex + 1);

  if (!value || !signature) {
    return undefined;
  }

  for (const secret of secrets) {
    const hmac = CryptoJS.HmacSHA256(value, secret);
    const expectedSignature = hmac.toString(CryptoJS.enc.Hex);

    if (signatureIsValid(signature, expectedSignature)) {
      return value; // Signature valid
    }
  }

  return undefined;
}

// Helpers
function removePrefix(signedData: string) {
  return signedData.replace(/^s:/, '');
}

function signatureIsValid(signature: string, expectedSignature: string) {
  return timingSafeCompare(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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
