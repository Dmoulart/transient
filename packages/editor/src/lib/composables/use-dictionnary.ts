const componentModules = import.meta.glob(['@/samples/**/*.vue', '@/tests/**/*.vue'])

export async function loadAllComponents(): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      const mod = await componentModules[path]()
      // @ts-expect-error : check if it is possible to type
      result[name] = mod.default
      // schemasByName.value[name] = getTransientComponentSchemaByTag(name)
    }
  }

  return result
}
