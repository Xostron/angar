import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import Today from './today'
import './style.css'

export default function Forecast({ address, weather, type = 'normal' }) {
	const { build } = useParams()
	const [point] = useInputStore(({ input }) => [input?.total?.[build]?.point])
	const updateTime = new Date(weather.update).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
	let cl = type === 'cold' ? 'weather-fore forecast-cold' : 'weather-fore'

	return (
		<div className={cl}>
			{address ? (
				<article className='adr'>
					<img src='/img/geo.svg' />
					<span>{address ?? '--'}</span>
				</article>
			) : null}
			<Today weather={weather} type={type}/>
			<article className='wthr-update'>
				<span>Точка росы: {point ?? '--'}°C</span>
				<span>{updateTime}</span>
			</article>
		</div>
	)
}
