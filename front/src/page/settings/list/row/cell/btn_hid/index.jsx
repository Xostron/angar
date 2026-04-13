import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'

export default function BtnHid({ cls, style, value, hid }) {
	const { setHid } = useOutputStore()
	const cl = ['btn-chc', cls].join(' ')

	const handle = () => setHid(value, hid)

	const st = hid ? { transform: 'rotateZ(180deg)' } : {}
	return (
		<button onClick={handle} className={cl} style={style}>
			<img width='24px' src='/img/angle-up.svg' alt='up' style={st} />
		</button>
	)
}
