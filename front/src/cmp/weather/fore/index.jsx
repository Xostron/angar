import './style.css'

export default function Forecast({ address, weather, cls }) {
	let cl = ['w-fore', cls]
	cl = cl.join(' ')
	// const img = `img/weather${weather.code}.svg`
	const img = `/img/wea.svg`
	let temp = weather?.temp 
	if(temp>0) temp = '+' + temp
	return (
		<div className={cl}>
			<div className='adr'>
				<img src='/img/geo.svg' />	
				<span>{address}</span>
			</div>
			
			<div className='wthr'>
				<div>
					<div className='temp'>{temp}°C</div>
					<div>Влажность: {weather.humidity}%</div>
				</div>
				<div>
					<img src={img} alt='' />
				</div>
			</div>
			
			
		</div>
	)
}
