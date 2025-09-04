import { useRef, useCallback } from 'react'

export default function useDialog() {
	const refDialog = useRef(null)
	
	const open = useCallback(() => {
		const dialog = refDialog?.current
		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])
	
	const close = useCallback(() => {
		const dialog = refDialog?.current
		if (dialog && dialog.open) {
			dialog.close()
		}
	}, [])
	
	const isOpen = refDialog?.current?.open || false
	
	return { refDialog, open, close, isOpen }
}
