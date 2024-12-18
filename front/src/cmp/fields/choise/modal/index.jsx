import { useEffect } from 'react'
import '../../style.css'
export default function Modal({ data, setData, list, show, setShow }) {
	useEffect(
		(_) => {
			const onClick = (e) => {
				if (e.target.closest('.popup')) return
				if (e.target.closest('.modal')) return
				if (show) setShow(false)
			}
			document.addEventListener('click', onClick)
			return (_) => document.removeEventListener('click', onClick)
		},
		[show]
	)
	if (!show) return null

	return (
		<div className='modal'>
			{list.map((el, i) => {
				const st = (data === el.code) ? { backgroundColor: 'var(--surface)' } : {}
				return (
					<button key={i} onClick={(_) => setData(el.code)} style={st}>
						{el.title}
					</button>
				)
			})}
			
		</div>
	)
}
