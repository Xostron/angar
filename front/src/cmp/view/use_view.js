import { useEffect, useRef } from 'react'
import useViewStore from '@store/view'

export default function useView() {
	const updateView = useViewStore((s) => s.updateView)
	const tm = useRef(null)
	useEffect((_) => {
		const rs = (_) => {
			if (tm.current) return
			tm.current = setTimeout(() => {
				tm.current = null
				console.log('resize')
				updateView()
			}, 700)
		}
		window.addEventListener('resize', rs)
		return (_) => window.removeEventListener('resize', rs)
	}, [])
}
