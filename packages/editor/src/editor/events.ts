import type { Edition } from './edition'

// Shared by every editor UI component and the components relaying them: one `edit` pipe
// carrying a discriminated Edition, so adding an action never adds a relay line.
export type EditorEvents = {
  edit: [edition: Edition]
  // UI request (needs the component panel), not an edition yet
  'insert-component': [data: { targetNodeID: string }]
}
