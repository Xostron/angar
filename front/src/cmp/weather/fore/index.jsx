import './style.css'

export default function Forecast({ address, weather, cls }) {
	let cl = ['w-fore', cls]
	cl = cl.join(' ')
	const img = weather.code ?<img src={`/img/weather/${weather.code}.svg`} alt={weather.weather} /> : null
	const dt = new Date(weather.time).toLocaleString()
	return (
		<div className={cl}>
			{address?
			<div className='adr'>
				<img src='/img/geo.svg' />	
				<span>{address ?? '--'}</span>
			</div>
			: null}
			
			<div className='wthr'>
				<div>
					<span className='status'>{weather.weather ?? ''}</span>
					<span className='temp' title={dt}>{weather?.temp ?? '--'}°C</span>
					{weather.humidity?<span>Влажность: {weather.humidity ?? '--'}%</span>:null}
				</div>
				<div>
					{img}
				</div>
			</div>
		</div>
	)
}
