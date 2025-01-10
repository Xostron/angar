import { useMemo } from 'react'
import Item from './item'
import Fan from './fan'
import def from '@src/tool/icon'
import './style.css'

//Группа датчиков склада
export default function Sensor({ data, cls, withImg = false }) {
	let cl = ['gr-sens', cls]
	cl = cl.join(' ')

	const row = useMemo(() => {
		return data.map((el, i) => {
			const imgF = def.fan?.[el?.fan?.state]
			const state = el?.fan?.state
			return (
				<div key={i}>
					<Item data={el} />
					{withImg && <Fan img={imgF} state={state} />}
				</div>
			)
		})
	}, [])

	return <section className={cl}>{data?.length && row}</section>
}
