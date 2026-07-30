import './style.css'

export default function Tout({ doc }) {
	if(!doc) return null
	const {tprd, hin, countAlr} = doc 
	const imgT = '/img/periphery/temp/on.svg'
	const imgWet = '/img/periphery/moisture/on.svg'
	const imgAlrm = '/img/alarm/alr.svg'

	return (
		<div className='temp-block'>
			{/* Влажность */}
			<div className={`temp ${hin?.state ?? 'off'}`}>
				<img src={imgWet} />
				{hin?.value!=null ? <span> {hin.value} %</span> : null}
			</div>
			{/* Температура продукта min */}
			<div className={`temp ${tprd?.state ?? ''}`}>
				<img src={imgT} />
				{tprd?.min !=null ? <span> min {tprd?.min} °C</span> : null}
			</div>
			{/* Температура подукта max  */}
			<div className={`temp ${tprd?.state  ?? ''}`}>
				<img src={imgT} />
				{tprd?.max !=null ? <span> max {tprd?.max } °C</span> : null}
			</div>
			{/* Аварии */}
			{countAlr ? (
				<div className={`msg alarm`}>
					<img src={imgAlrm} />
					<span>Сообщения</span>
					<span className='count'>{countAlr}</span>
				</div>
			) : null}
		</div>
	)
}
