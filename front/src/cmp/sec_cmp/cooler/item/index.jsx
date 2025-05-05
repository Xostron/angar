import Sensor from './sensor'
import './style.css'

// Отображение Испарителя type=cold Холодильник, = combi - Комбинированный
export default function Cooler({ state, data, start }) {
	if (!state || !data) return null
	// console.log('Cooler',state, data)
	let cls = ['cmp-sec-cooler-item']
	cls = cls.join(' ')
	const img = `/img/cold/cooler/cooler-${data.state}.svg` ?? ''
	const sen = state.sensor ?? []
	const title = start ? data.name : ''
	const sensor = sen.length ? sen.filter(el=>el.type==='cooler').map((el, i) => <Sensor key={i} state={el} data={data?.sensor[el._id]} />) : null

	return (
		<>
			<div className={cls} title={`Режим: ${data.name} (${data.state})`}>
				<span>{title}</span>
				<img src={img} />
			</div>
			{sensor}
		</>
	)
}
