import { useRef } from 'react'
// const { clear } = useWarn(({ clear }) => ({ clear }))

export default function useDialog() {
	const refDialog = useRef(null)
	const open = () => refDialog?.current?.showModal()
	const close = () => {
		refDialog?.current?.close()
		// clear()
	}
	const isOpen = refDialog?.current?.open
	return { refDialog, open, close, isOpen }
}
