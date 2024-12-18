import { useRef } from 'react'

export default function useDialog() {
	const refBanner = useRef(null)
	const open = () => refBanner?.current?.show()
	const close = () => refBanner?.current?.close()

	return { refBanner, open, close }
}