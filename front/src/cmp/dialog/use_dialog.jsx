import { useRef } from 'react'

export default function useDialog() {
	const refDialog = useRef(null)
	const open = () => refDialog?.current?.showModal()
	const close = () => refDialog?.current?.close()
	const isOpen = refDialog.current?.open
	return { refDialog, open, close, isOpen }
}
