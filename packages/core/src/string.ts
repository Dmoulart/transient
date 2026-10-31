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

export function pascalCase(str: string) {
  return capitalize(camelCase(str))
}

export function camelCase(str: string) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim()
  return result.split(' ').join('-').toLowerCase()
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
