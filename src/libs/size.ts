// https://stackoverflow.com/a/12205668
export function getSize(u: unknown): number {
  if (typeof u === "string") {
    return getSizeOfString(u);
  }
  try {
    return getSizeOfString(JSON.stringify(u));
  } catch (error) {
    return getSizeOfString(String(u));
  }
}

export function getSizeOfString(str: string): number {
  return encodeURI(str).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
}
