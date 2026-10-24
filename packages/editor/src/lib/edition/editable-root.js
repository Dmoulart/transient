"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editableRoots = void 0;
// mounted EditableRoot copies, per `${ownerId}:${slotName}`: a root being replaced by
// another slot's (still mounted while the new one sets up) must not shift its count
exports.editableRoots = new Map();
