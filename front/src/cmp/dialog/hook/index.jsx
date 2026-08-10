import { useRef, useCallback, useState, useEffect } from 'react'

export default function useDialog() {
	const refDialog = useRef(null)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		const dialog = refDialog?.current
		if (!dialog) return
		const sync = () => setIsOpen(dialog.open)
		dialog.addEventListener('close', sync)
		dialog.addEventListener('cancel', sync)
		return () => {
			dialog.removeEventListener('close', sync)
			dialog.removeEventListener('cancel', sync)
		}
	}, [])

	const open = useCallback(() => {
		const dialog = refDialog?.current
		if (dialog && !dialog.open) {
			dialog.showModal()
			setIsOpen(true)
		}
	}, [])
	
	const close = useCallback(() => {
		const dialog = refDialog?.current
		if (dialog && dialog.open) {
			dialog.close()
			setIsOpen(false)
		}
	}, [])
	
	return { refDialog, open, close, isOpen }
}
