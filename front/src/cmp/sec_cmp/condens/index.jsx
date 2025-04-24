import './style.css'

// Отображение Конденсатора
export default function Condens({state, data}) {
	if(!state || !data)  return null
	data = data?.condenser[state?._id]
	if(!data)  return null
	// console.log('Condens',data, state)
	let cls = ['page-section-cold-condens', 'brd']
	cls = cls.join(' ')
	const img =  `/img/cold/condens-${data.state === 'run'?'on': 'off'}.svg`
	return (
		<div className={cls}>
			<img src={img}/>
			{data?.fan?.length
				? data?.fan
					?.map((el, i)=>
						<img key={i} className={el} title={el} src='/img/periphery/fan/stop.svg'/>
					) 
				:null}
		</div>
	)
}
