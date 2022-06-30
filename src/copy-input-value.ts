import { isInputElement, isSelectElement, isTextareaElement } from './utils'

export function copyInputValue<T extends HTMLElement | SVGElement>(
  node: T,
  clone: T,
) {
  if (isTextareaElement(node)) {
    clone.innerHTML = node.value
  }

  if (
    (isTextareaElement(node) || isInputElement(node) || isSelectElement(node))
    && (isTextareaElement(clone) || isInputElement(clone) || isSelectElement(clone))
  ) {
    clone.value = node.value
  }
}