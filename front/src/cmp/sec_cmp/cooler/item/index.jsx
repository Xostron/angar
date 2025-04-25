import Sensor from './sensor'
import './style.css'

// Отображение Испарителя
export default function Cooler({ state, data, start, cl = '', clSensor = '' }) {
	if (!state || !data) return null
	// console.log('Cooler',state, data)
	let cls = [cl, 'cmp-sec-cooler-item']
	cls = cls.join(' ')
	const img = `/img/cold/cooler/cooler-${data.state}.svg` ?? ''
	const sen = state.sensor ?? []
	const title = start ? data.name : ''
	const sensor = sen.length ? sen.map((el, i) => <Sensor key={i} cl={clSensor} state={el} data={data?.sensor[el._id]} />) : null

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
