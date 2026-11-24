import { type DescribeStyleAction, type DescribeStyleArgs } from './describeStyleAction.types'

/** "Describe a style with AI" in the ⋯ menu: not in the free plugin. Nomi Style Pro replaces this module. */
export const useDescribeStyleAction = (_args: DescribeStyleArgs): DescribeStyleAction => ({ actions: [], dialog: null })
