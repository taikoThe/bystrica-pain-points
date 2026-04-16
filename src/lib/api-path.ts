export const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const api = (path: string) => `${bp}${path}`;
