import { useEffect } from 'react'

export default function Modal({ show, setShow, list, setValue, value }) {
	useEffect(() => {
		const onClick = (e) => {
			if (e.target.closest('.cmp-choice-input')) return
			if (show) setShow(false)
		}
		document.addEventListener('click', onClick)
		return (_) => document.removeEventListener('click', onClick)
	}, [])
	if (!show) return null

	return (
		<div className='cmp-choice-input-modal'>
			{list.map((el, i) => {
				const st = value === el.name ? { backgroundColor: 'var(--surface)' } : {}
				return (
					<span
						key={i}
						onClick={() => {
							setValue(el)
							setShow(false)
						}}
						style={st}
					>
						{el.name}
					</span>
				)
			})}
		</div>
	)
}
