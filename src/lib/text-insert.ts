export interface InsertTextResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function insertTextAtSelection(
  currentValue: string,
  text: string,
  selectionStart?: number | null,
  selectionEnd?: number | null
): InsertTextResult {
  const start = selectionStart ?? currentValue.length;
  const end = selectionEnd ?? currentValue.length;
  const nextValue = currentValue.slice(0, start) + text + currentValue.slice(end);
  const nextCaret = start + text.length;

  return {
    value: nextValue,
    selectionStart: nextCaret,
    selectionEnd: nextCaret,
  };
}

export function isSupportedTextInsertionElement(
  element: Element | null | undefined
): element is HTMLInputElement | HTMLTextAreaElement {
  if (!element) return false;
  if (element instanceof HTMLTextAreaElement) return true;
  if (!(element instanceof HTMLInputElement)) return false;

  const disallowedTypes = new Set(["number", "url", "email", "password", "date", "datetime-local", "time"]);
  return !disallowedTypes.has(element.type);
}

export function insertTextIntoElement(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
) {
  const result = insertTextAtSelection(
    element.value,
    text,
    element.selectionStart,
    element.selectionEnd
  );

  element.focus();
  element.value = result.value;
  element.setSelectionRange(result.selectionStart, result.selectionEnd);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}
