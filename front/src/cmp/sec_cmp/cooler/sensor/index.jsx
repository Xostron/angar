// import './style.css'
import defUn from '@src/tool/unit'

// Отображение Испарителя
export default function Sensor({state, data}) {
	if(!state || !data)  return null
	// console.log('Sensor',state, data)
	let cls = ['page-section-cold-cooler-sensor', 'brd', data?.state ?? '' ]
	cls = cls.join(' ')
	
	const unit = defUn?.temp
	return (
		<div  className={cls} title={`${state.name} ${data.state}: ${data.value}`}>
			<img src='/img/periphery/temp/on.svg'/>
			<span>
				{data?.value ?? '--'} {unit}
			</span>
		</div >
	)
}
