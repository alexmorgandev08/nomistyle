import { useEffect, useState } from 'react'

/**
 * A text box that keeps what the user types until Enter or blur, then saves it only
 * when valid. An invalid entry is marked and the last valid value comes back.
 */
export function useDraft(value: string | undefined, commit: (text: string) => boolean) {
  const [draft, setDraft] = useState(value ?? '')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    setDraft(value ?? '')
    setInvalid(false)
  }, [value])

  const save = (text = draft) => {
    const ok = commit(text.trim())
    setInvalid(!ok)
    if (!ok) setDraft(value ?? '')
  }

  return { draft, invalid, save, setDraft }
}
