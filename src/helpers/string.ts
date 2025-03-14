export function unescapeString(str: string) {
  if (str.startsWith(`\"`) && str.endsWith(`\"`)) {
    return str.slice(1, str.length - 1);
  }

  return str;
}
