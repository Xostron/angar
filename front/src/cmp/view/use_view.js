import { useEffect, useRef } from 'react'
import useViewStore from '@store/view'
import throttle from '@tool/throttle'

export default function useView() {
	const updateView = useViewStore((s) => s.updateView)
	const tm = useRef(null)
	useEffect((_) => {
		const rs = (_) => {
			if (tm.current) return
			throttle(tm, updateView,1000)
		}
		window.addEventListener('resize', rs)
		return (_) => window.removeEventListener('resize', rs)
	}, [])
}
