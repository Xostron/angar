import { useRef } from 'react'

export default function useDialog() {
	const refDialog = useRef(null)
	const open = () => refDialog?.current?.showModal()
	const close = () => refDialog?.current?.close()

	return { refDialog, open, close }
}
