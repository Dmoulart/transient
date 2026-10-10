export function getCaretOffsetRelativeTo(
  container: Node,
  targetTextNode: Node,
  caretOffset: number,
) {
  if (container === targetTextNode) {
    return caretOffset
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)

  let totalOffset = 0
  let currentNode

  // Parcourt tous les nœuds de texte dans l'ordre du document
  while ((currentNode = walker.nextNode())) {
    if (currentNode === targetTextNode) {
      return totalOffset + caretOffset
    }
    totalOffset += currentNode.nodeValue!.length
  }

  return -1
}
