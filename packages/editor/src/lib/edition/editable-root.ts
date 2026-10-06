// mounted EditableRoot copies, per `${ownerId}:${slotName}`: a root being replaced by
// another slot's (still mounted while the new one sets up) must not shift its count
export const editableRoots = new Map<string, number>()
