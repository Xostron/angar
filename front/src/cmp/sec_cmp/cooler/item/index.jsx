import useInputStore from '@src/store/input'
import Sensor from './sensor'
import './style.css'
import { useParams } from 'react-router-dom'

// Отображение Испарителя type=cold Холодильник, = combi - Комбинированный
export default function Cooler({ state, data, start }) {
	const { sect } = useParams()
	const newClr = useInputStore((s) => s?.input?.total?.[sect]?.cooler?.[state?._id])
	if (!state || !data) return null
	let cls = ['cmp-sec-cooler-item']
	if (data?.status === 'alarm') cls.push('alarm')
	cls = cls.join(' ')
	const img = `/img/cold/cooler/cooler-${data.state}.svg` ?? ''
	// const sen = state.sensor ?? []
	const title = start ? data.name : ''

	const tmpCooler = newClr?.tmpCooler
	const sensor = <Sensor state={{}} data={{ ...tmpCooler, value: tmpCooler?.min }} />

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
