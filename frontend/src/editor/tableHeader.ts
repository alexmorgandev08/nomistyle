import { type StyleValues } from '../shared/schema'

/** A row as the core/table block stores it in its `head` / `body` / `foot` attributes. */
export interface TableRow {
  cells: Record<string, unknown>[]
}

/** True when any header setting is set, on any screen size ("headerBackground", "headerFontSize@mobile", …). */
export const hasHeaderStyles = (values: StyleValues): boolean => Object.keys(values).some(key => key.startsWith('header'))

/**
 * Moves the first body row into the header, as header cells.
 * Users often type column names into the first row without turning on the header section.
 */
export function firstRowAsHeader(body: TableRow[]): { body: TableRow[]; head: TableRow[] } {
  const [first, ...rest] = body
  return {
    body: rest,
    head: [{ cells: first.cells.map(cell => ({ ...cell, tag: 'th' })) }]
  }
}
