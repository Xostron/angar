import { useCallback } from 'react'
import Item from './item'
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

	function Fan({ img, state }) {
		let cl = ['gr-sens-fan-img']
		if (state === 'run') cl.push('a-run')
		cl = cl.join(' ')
		return <div className='gr-sens-fan'>{!!img ? <img className={cl} src={img} /> : <span className='gr-sens-empty'></span>}</div>
	}
}
