import Sensor from './sensor'
import './style.css'

// Отображение Испарителя
export default function Cooler({state, data}) {
	if(!state || !data)  return null
	// console.log('Cooler',state, data)
	let cls = ['page-section-cold-cooler' ]
	cls = cls.join(' ')
	
	const img = `/img/cold/cooler/cooler-${data.state}.svg`?? ''
	const sen = state.sensor ?? []
	
	return (
		<>
			<div className={cls} title={`Режим: ${data.name} (${data.state})`}>
				<span>{data.name}</span>
				<img src={img}/>
			</div>
			{sen.length
				? sen.map((el, i)=><Sensor key={i} state={el} data={data?.sensor[el._id]}/>)
				:null
			}
		</>
	)
}
