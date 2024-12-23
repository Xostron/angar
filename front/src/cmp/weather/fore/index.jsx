import './style.css'

export default function Forecast({ address, weather, cls }) {
	let cl = ['w-fore', cls]
	cl = cl.join(' ')
	const img = `/img/weather/${weather.code}.svg`
	// const img = `/img/wea.svg`
	return (
		<div className={cl}>
			<div className='adr'>
				<img src='/img/geo.svg' />	
				<span>{address ?? '--'}</span>
			</div>
			
			<div className='wthr'>
				<div>
					<span className='temp'>{weather?.temp ?? '--'}°C</span>
					<span>Влажность: {weather.humidity ?? '--'}%</span>
					<span>{weather.weather ?? ''}</span>
				</div>
				<div>
					<img src={img} alt={weather.weather} />
					
				</div>
			</div>
			
			
		</div>
	)
}
