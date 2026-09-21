export const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const REVISION = /^[a-f0-9]{64}$/;

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function isUtcTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  if (!isCalendarDate(value.slice(0, 10))) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) &&
    new Date(time).toISOString() === (value.length === 20 ? value.replace("Z", ".000Z") : value);
}

export function isLocalImage(value: string): boolean {
  return /^\/images\/[a-z0-9][a-z0-9/_.-]*\.(?:svg|webp|avif|png|jpe?g)$/i.test(value) &&
    !value.includes("..") && !value.includes("//");
}

export function record(input: unknown, path: string, keys: readonly string[]): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error(`${path}: Expected an object`);
  }
  const value = input as Record<string, unknown>;
  const extra = Object.keys(value).filter((key) => !keys.includes(key));
  if (extra.length) throw new Error(`${path}: Unrecognized key "${extra[0]}"`);
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new Error(`${path}.${key}: Required field is missing`);
  }
  return value;
}

export function text(input: unknown, path: string, max = 2000): string {
  if (typeof input !== "string" || !input.trim()) throw new Error(`${path}: Must not be blank`);
  if (input.length > max || /[\u0000-\u001f\u007f]/.test(input)) {
    throw new Error(`${path}: Use at most ${max} characters without control characters`);
  }
  return input;
}

export function identifier(input: unknown, path: string): string {
  const value = text(input, path, 80);
  if (!IDENTIFIER.test(value)) throw new Error(`${path}: Use a lowercase, hyphenated identifier`);
  return value;
}

export function boolean(input: unknown, path: string): boolean {
  if (typeof input !== "boolean") throw new Error(`${path}: Expected a boolean`);
  return input;
}

export function positiveInteger(input: unknown, path: string): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 1) {
    throw new Error(`${path}: Quantity or count must be a positive safe integer`);
  }
  return input;
}

export function price(input: unknown, path: string): number | null {
  if (input === null) return null;
  if (typeof input !== "number" || !Number.isFinite(input) || input < 0) {
    throw new Error(`${path}: Price must be null or a finite, non-negative number`);
  }
  return input;
}

export function choice<const T extends readonly string[]>(input: unknown, path: string, values: T): T[number] {
  if (typeof input !== "string" || !values.includes(input)) {
    throw new Error(`${path}: Expected one of ${values.join(", ")}`);
  }
  return input;
}

export function array<T>(
  input: unknown,
  path: string,
  parse: (value: unknown, path: string) => T,
  min = 0,
): T[] {
  if (!Array.isArray(input) || input.length < min || input.length > 1000) {
    throw new Error(`${path}: Expected an array with ${min}–1000 entries`);
  }
  return input.map((value, index) => parse(value, `${path}.${index}`));
}
