import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'

export default function BtnHid({ cls, style, nameHid }) {
	const { hid, setHid } = useOutputStore()
	const cl = ['btn-chc', cls].join(' ')
	
	const handle = () => setHid(nameHid, hid?.[nameHid])

	const st = !hid?.[nameHid] ? { transform: 'rotateZ(180deg)' } : {}
	return (
		<button onClick={handle} className={cl} style={style}>
			<img width='24px' src='/img/angle-up.svg' alt='up' style={st} />
		</button>
	)
}
