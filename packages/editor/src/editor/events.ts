import type { Edition } from './edition'

export type EditorEvents = {
  edit: [edition: Edition]
  'insert-component': [data: { targetID: string }]
}
