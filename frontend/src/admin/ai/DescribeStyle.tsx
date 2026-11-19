import { type ReactNode } from 'react'

import { type StyleValues } from '../../shared/schema'

export interface DescribeStyleProps {
  /** Block label, e.g. "Table". */
  label: string
  onApply: (values: StyleValues) => void
  type: string
}

/** "Describe with AI" in Global Styles. The AI assistant is part of Block Style Pro, which replaces this module. */
export default function DescribeStyle(_props: DescribeStyleProps): ReactNode {
  return null
}
