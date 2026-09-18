import './style.css'

export default function Tout({ doc }) {
	if (!doc) return null
	const [tmin, tmax, hin] = doc.sensor
	const imgT = '/img/periphery/temp/on.svg'
	const imgWet = '/img/periphery/moisture/on.svg'
	const imgAlrm = '/img/alarm/alr.svg'

	return (
		<div className='temp-block'>
			{/* Влажность */}
			<div className={`temp ${hin?.state ?? 'off'}`}>
				<img src={imgWet} />
				{hin?.value != null ? <span> {hin.value} %</span> : null}
			</div>
			{/* Температура продукта min */}
			<div className={`temp ${tmin?.state ?? ''}`}>
				<img src={imgT} />
				{tmin?.value != null ? <span> min {tmin?.value} °C</span> : null}
			</div>
			{/* Температура подукта max  */}
			<div className={`temp ${tmax?.state ?? ''}`}>
				<img src={imgT} />
				{tmax?.value != null ? <span> max {tmax?.value} °C</span> : null}
			</div>
			{/* Аварии */}
			{doc?.countAlr ? (
				<div className={`msg alarm`}>
					<img src={imgAlrm} />
					<span>Сообщения</span>
					<span className='count'>{doc?.countAlr}</span>
				</div>
			) : null}
		</div>
	)
}
