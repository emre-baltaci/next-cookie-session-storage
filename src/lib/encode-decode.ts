// Default encoder / decoder functions
export function encodeToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  const stringifiedBytes = Array.from(bytes, (byte) => {
    return String.fromCharCode(byte);
  }).join('');

  return btoa(stringifiedBytes);
}

export function decodeFromBase64(value: string) {
  const stringifiedBytes = atob(value);

  const bytes = Uint8Array.from(stringifiedBytes, (stringifiedByte) =>
    stringifiedByte.charCodeAt(0)
  );
  return new TextDecoder().decode(bytes);
}
