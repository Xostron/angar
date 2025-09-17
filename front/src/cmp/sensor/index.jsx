import { useMemo, useCallback } from 'react'
import useViewStore from '@store/view'
import Item from './item'
import Fan from './fan'
import def from '@src/tool/icon'
import './style.css'

//Группа датчиков склада
export default function Sensor({ data, cls, type = 'normal', withImg = false }) {
	const mb = useViewStore((s) => s.mb())
	const cl = ['cmp-sensor', mb, cls].join(' ')

	// Датчик / Датчик + разгонный
	const row = useCallback((el, i) => {
		const imgF = def.fan?.[el?.fan?.state]
		const state = el?.fan?.state
		return (
			<div key={i}>
				<Item data={el} />
				{withImg && <Fan className={mb} img={imgF} state={state} />}
			</div>
		)
	}, [])

	if (type === 'cold') return null
	return <section className={cl}>{data?.length && data.map(row)}</section>
}
