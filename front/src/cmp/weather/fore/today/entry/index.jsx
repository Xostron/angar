import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { sForecast } from '@socket/emit'
import Btn from '@cmp/fields/btn'
import './style.css'
import Weather7d from '@cmp/weather_7d'

export default function Entry({ close, weather }) {
	const { build } = useParams()
	// Аналитика
	const [fore, setFore] = useState(null)
	console.log(111, fore)
	return (
		<div className='entry entry-fore'>
			<Weather7d weather={weather} />
			<Btn cls='entry-fore-btn' onClick={fnFore} title='Аналитика' />
			{fore && (
				<div>
					{fore.msg}
					<Btn cls='entry-fore-btn-ok' onClick={fnFore} title='Применить' />
					<Btn cls='entry-fore-btn-ok' onClick={fnFore} title='Отмена' />
				</div>
			)}
		</div>
	)
	// Запрос аналитики по погоде
	function fnFore() {
		sForecast({ build }, setFore)
	}
}
