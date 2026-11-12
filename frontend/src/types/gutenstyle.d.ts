import { type AdminData } from '../admin/data'
import { type EditorData } from '../editor/context'

declare global {
  interface Window {
    gutenStyleAdmin: AdminData
    gutenStyleEditor: EditorData
  }
}

export {}
