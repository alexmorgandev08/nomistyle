/**
 * Writes CSS into a `<style>` element in `doc`, creating it on first use.
 *
 * Looks up `style#id` rather than `#id`: WordPress gives every enqueued stylesheet the
 * id "{handle}-css", so an id lookup could find a `<link>` and silently write into it.
 * Use ids that do not end in "-css" for the same reason.
 */
export function writeStyleElement(doc: Document, id: string, css: string): void {
  let element = doc.querySelector<HTMLStyleElement>(`style#${id}`)
  if (!element) {
    element = doc.createElement('style')
    element.id = id
    doc.head.appendChild(element)
  }
  if (element.textContent !== css) element.textContent = css
}
