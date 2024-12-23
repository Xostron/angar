import useEquipStore from '@store/equipment'
import { useShallow } from 'zustand/react/shallow'
import './style.css'

export default function Region() {
	const [list, weather] = useEquipStore(useShallow(({ list, weather }) => [list, weather]))
	const address = list?.[0]?.pc?.address?.value ?? '--'
	// const img = `/img/weather${weather.code}.svg`
	const img = `/img/wea.svg`
	let temp = weather?.temp 
	if(temp>0) temp = '+' + temp
	// const address = ''
	console.log(weather)
	return (
		<div className='mw-region'>
			<div className='mwr-left'>
				<span>{address}</span>
				<div className='mwrl-info'>
					<div>
						<span>Влажность: {weather.humidity} % </span>
					</div>
					<span>{temp ?? '--'}°C</span>
				</div>
			</div>
			<div className='mwr-right'>
				<img src={img} alt='' />
			</div>
		</div>
	)
}
