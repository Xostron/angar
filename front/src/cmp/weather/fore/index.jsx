import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import useEquipStore from '@store/equipment'
import useViewStore from '@store/view'
import Today from './today'
import './style.css'

export default function Forecast({ address, type = 'normal' }) {
	const { build } = useParams()
	const mb = useViewStore((s) => s.mb())
	const point = useInputStore((s) => s.input?.total?.[build]?.point)
	const weather = useEquipStore((s) => s.weather)
	const updateTime = new Date(weather.update).toLocaleString('ru-RU', {
		dateStyle: 'short',
		timeStyle: 'short',
	})
	const cold = type === 'cold' ? 'cold' : ''
	const cls = ['cmp-weather-fore', mb, cold].join(' ')
	const clsPoint = ['cmp-weather-fore-point', mb].join(' ')
	const clsDiv = ['cmp-weather-fore-div', mb].join(' ')
	return (
		<section className={cls}>
			<article className='cmp-weather-fore-adr'>
				<img src='/img/geo.svg' />
				<span>{address ?? '--'}</span>
			</article>
			<div className={clsDiv}>
				{/* Алиса, какая погода на сегодня? */}
				<Today weather={weather} type={type} />
				<article className={clsPoint}>
					<span>Точка росы: {point ?? '--'}°C</span>
					<span>{updateTime}</span>
				</article>
			</div>
		</section>
	)
}
