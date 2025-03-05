import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import './style.css'

export default function Forecast({ address, weather, cls }) {
	const { build } = useParams()
	const [tweather] = useInputStore(({ input }) => [input?.[build]?.['tweather']?.value])
	let cl = ['w-fore', cls]
	cl = cl.join(' ')
	const img = weather.code ? <img src={`/img/weather/${weather.code}.svg`} alt={weather.weather} /> : null
	const dt = new Date(weather.time).toLocaleString()
	const updateTime = new Date(weather.update).toLocaleString('ru-RU', {dateStyle:'short', timeStyle:'short'})
	return (
		<div className={cl}>
			{address ? (
				<div className='adr'>
					<img src='/img/geo.svg' />
					<span>{address ?? '--'}</span>
				</div>
			) : null}

			<div className='wthr'>
				<div>
					<span className='status'>{weather.weather ?? ''}</span>
					<span className='temp' title={dt}>
						{tweather ?? '--'}°C
					</span>
					{weather.humidity ? <span>Влажность: {weather.humidity ?? '--'}%</span> : null}
				</div>
				<div>{img}</div>
			</div>

			<div className='wthr-update'>{updateTime}</div>
		</div>
	)
}
