import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
// import Btn from '@cmp/fields/btn'
import useDialog from '@cmp/dialog/use_dialog'
import Dialog from '@cmp/dialog'
import Entry from './entry'

export default function Today({ weather }) {
	const { build } = useParams()
	const [tweather] = useInputStore(({ input }) => [input?.[build]?.tweather])
	const { refDialog, open, close } = useDialog()
	const img = typeof weather.code == 'number' ? <img src={`/img/weather/${weather.code}.svg`} alt={weather.weather} /> : null
	const dt = new Date(weather.time).toLocaleString('ru', { day: '2-digit', month: '2-digit' })
	
	return (
		<>
			<article className='wthr' onClick={open}>
				<div>
					{/* <div className='wthr-title'>
					<span>Сегодня {dt}</span>
					<Btn cls='seven' onClick={fnFore} title='7 дней'/>
					</div> */}
					<span className='status'>{weather.weather ?? ''}</span>
					<span className='temp' title={dt}>
						{tweather?.value ?? '--'}°C
					</span>
					<span>Влажность: {weather.humidity ?? '--'}%</span>
				</div>
				{img}
			</article>
			{/* Прогноз погоды на 7 дней */}
			<Dialog href={refDialog}>
				<Entry close={close} weather={weather} />
			</Dialog>
		</>
	)
	// Запрос аналитики по погоде
	function fnFore() {
		sForecast({ build }, setFore)
	}
}
