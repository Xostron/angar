import useEquipStore from '@store/equipment'
import { useShallow } from 'zustand/react/shallow'
import './style.css'

export default function Region() {
	const [list, weather] = useEquipStore(useShallow(({ list, weather }) => [list, weather]))
	const address = list?.[0]?.pc?.address?.value
	const img = weather.code ? <img src={`/img/weather/${weather.code}.svg`} alt='' /> : null
	const dt = new Date(weather.time).toLocaleString()
	return (
		<div className='mw-region'>
			<div className='mwr-left'>
				{address ? 
				<>
					<span>{address}</span>
					<div className='mwrl-info'>
						<div>
							<span>Влажность: {weather.humidity ?? '--'} % </span>
						</div>
						<span title={dt}>{weather.temp ?? '--'}°C</span>
					</div>
				</>
				: 
				<>
					<div className='mwrl-info'>
						<span>Адрес не указан</span>
					</div>
				</>
				}
			</div>
			<div className='mwr-right'>{img}</div>
		</div>
	)
}
