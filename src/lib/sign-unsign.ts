import CryptoJS from 'crypto-js';
import { timingSafeCompare } from './timingSafeCompare';

export function sign({
  data,
  secret,
  options = { omitSignPrefix: false },
}: {
  data: string;
  secret: string;
  options?: {
    omitSignPrefix: boolean;
  };
}): string {
  const hmac = CryptoJS.HmacSHA256(data, secret);
  const signature = hmac.toString(CryptoJS.enc.Hex);

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
  const [value, signature] = data.split('.');

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
