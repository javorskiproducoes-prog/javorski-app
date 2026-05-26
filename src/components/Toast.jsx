import { useState, useCallback } from 'react'

let toastFn = null

export function ToastContainer() {
  const [toast, setToast] = useState({ msg: '', show: false })

  toastFn = useCallback((msg) => {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500)
  }, [])

  return (
    <div className={`toast ${toast.show ? 'show' : ''}`}>
      {toast.msg}
    </div>
  )
}

export const showToast = (msg) => toastFn?.(msg)
