import { useMemo, useCallback } from 'react'
import useViewStore from '@store/view'
import Item from './item'
import Fan from './fan'
import def from '@src/tool/icon'
import './style.css'
import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'

//Группа датчиков склада
export default function Sensor({ data, cls, type = 'normal', withImg = false }) {
	const mb = useViewStore((s) => s.mb())
	const cl = ['cmp-sensor', mb, cls].join(' ')
	const input = useInputStore(({ input }) => input)
	const {sect} = useParams()
	let wetting = ''
	if (sect) wetting = input?.total?.[sect]?.device.wetting
	// Датчик / Датчик + разгонный
	const row = useCallback((el, i) => {
		let cmp = false
		if(el.type === 'tin') {
			const img = def.fan?.[el?.fan?.state]
			const state = el?.fan?.state
			cmp = <Fan className={mb} img={img} state={state} />
		}
		if(el.type === "hin") {
			if(sect) {
				const img = "/img/cold/humidifier.svg"
				cmp = wetting === 'run'? <Fan className={mb} img={img} state={''} />: false
			} 
		}
		return (
			<div key={i}>
				<Item data={el} />
				{withImg && cmp}
			</div>
		)
	}, [wetting])

	if (type === 'cold') return null
	return <section className={cl}>{data?.length && data.map(row)}</section>
}
