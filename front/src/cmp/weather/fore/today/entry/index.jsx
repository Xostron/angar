import { useState } from 'react'
import { sForecast } from '@socket/emit'
import Btn from '@cmp/fields/btn'
import './style.css'
import Weather7d from '@cmp/weather_7d'

export default function Entry({ close, weather }) {
	// Аналитика
	const [fore, setFore] = useState(null)

	return (
		<div className='entry'>
			asd1
			<Weather7d weather={weather} />
			asd2
		</div>
	)
}
