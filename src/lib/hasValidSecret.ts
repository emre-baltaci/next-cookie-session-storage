export function hasValidSecret(secrets: string[]) {
  return secrets.some((secret) => secret === '') ? false : true;
}
