import { useMemo, useCallback } from 'react'
import Item from './item'
import Fan from './fan'
import def from '@src/tool/icon'
import './style.css'

//Группа датчиков склада
export default function Sensor({ data, cls, withImg = false }) {
	let cl = ['gr-sens', cls]
	cl = cl.join(' ')

	const row = useCallback((el, i) => {
		const imgF = def.fan?.[el?.fan?.state]
		const state = el?.fan?.state
		return (
			<div key={i}>
				<Item data={el} />
				{withImg && <Fan img={imgF} state={state} />}
			</div>
		)
	}, [])

	return <section className={cl}>{data?.length && data.map(row)}</section>
}
