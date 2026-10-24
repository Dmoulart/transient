export function unescapeString(str: string) {
  if (isEscapedString(str)) {
    return str.slice(1, str.length - 1)
  }

  return str
}

export function isEscapedString(str: string) {
  return str.startsWith(`"`) && str.endsWith(`"`)
}

export function isNumeric(str: string) {
  return !Number.isNaN(Number(str)) && !Number.isNaN(parseFloat(str))
}
