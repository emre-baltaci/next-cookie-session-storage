export class CookieSession<T extends Record<string, any>> {
  constructor(private data: T) {}

  getData(): T {
    return this.data;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.data[key] = value;
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data[key];
  }

  delete<K extends keyof T>(key: K): void {
    delete this.data[key];
  }

  clear() {
    this.data = {} as T;
  }

  toString() {
    return JSON.stringify(this.data);
  }
}
