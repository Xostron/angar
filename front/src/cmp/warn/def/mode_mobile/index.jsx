import { useState, useEffect } from 'react'
import useWarn from '@store/warn'
import Input from '@cmp/fields/input'
import Radio from '@cmp/fields/radio'
import Btn from '@cmp/fields/btn'
import def from '@tool/status/section'
import './style.css'

export default function Wifi({ data, cls }) {
	const clear = useWarn((s) => s.clear)
	const list = def.filter((el) => el.titleM !== data.titleM)
	console.log(111, data, list)
	useEffect(() => {}, [])

	return (
		<div className={'entry ' + data.clsEntry}>
			<h4>{data.title}</h4>
			<ul className='cmp-warn-mode-mobile' onClick={onClick}>
				{list.map((el, i) => (
					<li key={i} id={'' + el.value}>
						{el.title}
					</li>
				))}
			</ul>
		</div>
	)
	function onClick(e) {
		if (e.target===e.currentTarget) return
		switch (e.target.id) {
			case 'false':
				data.fnYes(false)
				break
			case 'true':
				data.fnYes(true)
				break
			default:
				data.fnYes(null)
				break
		}
		clear()
	}
}
