import { useState, useEffect } from 'react'
import useWarn from '@store/warn'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import def from '@tool/status/section'
import './style.css'

export default function Wifi({ data }) {
	const clear = useWarn((s) => s.clear)
	const list = def.filter((el) => el.titleM !== data.titleM)
	console.log(111, data)
	useEffect(() => {}, [])

	return (
		<div className='entry'>
			<ul className='cmp-warn-mode-mobile'>
				{list.map((el) => (
					<li>{el.title}</li>
				))}
			</ul>
		</div>
	)
}
