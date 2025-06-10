import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import { sForecast } from '@socket/emit'
import './style.css'
import { useState } from 'react'

export default function Forecast({ address, weather, cls }) {
	const { build } = useParams()
	const [tweather, point] = useInputStore(({ input }) => [input?.[build]?.tweather?.value, input?.total?.[build]?.point])
	let cl = ['w-fore', cls]
	cl = cl.join(' ')
	const img = typeof weather.code == 'number' ? <img src={`/img/weather/${weather.code}.svg`} alt={weather.weather} /> : null
	const dt = new Date(weather.time).toLocaleString()
	const updateTime = new Date(weather.update).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
	// Аналитика
	const [fore, setFore] = useState(null)
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
					{/* <span>Точка росы: {point ?? '--'}°C</span> */}
					{weather.humidity ? <span>Влажность: {weather.humidity ?? '--'}%</span> : null}
				</div>
				<div>{img}</div>
			</div>

			<div className='wthr-update'>
				<span>Точка росы: {point ?? '--'}°C</span>
				<button onClick={() => sForecast({ build }, setFore)}>Аналитика</button>
				<span>{updateTime}</span>
			</div>
		</div>
	)
}
