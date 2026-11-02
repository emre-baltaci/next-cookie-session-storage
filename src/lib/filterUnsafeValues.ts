export function filterUnsafeValues<T extends Record<string, any>>(
  object: T
): T {
  const optionsArray = Object.entries(object);

  const filteredArray = optionsArray.filter(
    (option) => option[1] !== undefined
  );

  return Object.fromEntries(filteredArray) as T;
}
