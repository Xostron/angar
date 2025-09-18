import { useEffect, useRef } from 'react'
import useViewStore from '@store/view'
import throttle from '@tool/throttle'
const root = document.querySelector('#root')

export default function useView() {
	const updateView = useViewStore((s) => s.updateView)
	const mb = useViewStore((s) => s.mb())
	if (mb) root.style.paddingInline = '.25em'
	else root.style.paddingInline = '1em'
	const tm = useRef(null)
	useEffect((_) => {
		const rs = (_) => {
			if (tm.current) return
			throttle(tm, updateView, 1000)
		}
		updateView()
		window.addEventListener('resize', rs)
		return (_) => window.removeEventListener('resize', rs)
	}, [])
}
