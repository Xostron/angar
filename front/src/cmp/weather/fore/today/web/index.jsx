import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import './style.css'

export default function Today({ weather, type }) {
	const { build } = useParams()

	const tweather = useInputStore((s) => s.input?.[build]?.tweather)
	const warn = useWarn((s) => s.warn)

	const dt = new Date(weather.time).toLocaleString('ru', { day: '2-digit', month: '2-digit' })
	const cls = ['cmp-weather-fore-today'].join(' ')
	const clsTemp = ['temp'].join(' ')
	return (
		<>
			<article className={cls} onClick={onClick}>
				<div>
					<span className='status'>{weather.weather ?? ''}</span>
					<span className={clsTemp} title={dt}>
						{tweather?.value ?? '--'}°C
					</span>
					<span>Влажность: {weather.humidity ?? '--'}%</span>
				</div>
				<img
					src={`/img/weather/${weather.code}.svg`}
					alt={weather.weather}
				/>
			</article>
		</>
	)
	function onClick() {
		warn({ weather, type }, 'forecast_analytic')
	}
}
