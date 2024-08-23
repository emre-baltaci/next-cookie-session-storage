export function timingSafeCompare(
  buffer1: ReturnType<typeof Buffer.from>,
  buffer2: ReturnType<typeof Buffer.from>
) {
  const buffer1Length = buffer1.length;
  const buffer2Length = buffer2.length;

  // Make sure both buffers are the same length
  let result = buffer1Length ^ buffer2Length;

  const maxLength = Math.max(buffer1Length, buffer2Length);

  // Need to compare byte by byte to avoid timing attacks
  for (let i = 0; i < maxLength; i++) {
    // If the buffer is shorter, treat missing bytes as 0
    const byte1 = i < buffer1Length ? buffer1[i] : 0;
    const byte2 = i < buffer2Length ? buffer2[i] : 0;

    result |= byte1 ^ byte2;
  }

  // Return true if result is 0 (all bytes and lengths matched), false otherwise
  return result === 0;
}
