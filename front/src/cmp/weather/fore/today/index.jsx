import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import useDialog from '@cmp/dialog/hook'
import Dialog from '@cmp/dialog'
import Entry from './entry'

export default function Today({ weather, type }) {
	const { build } = useParams()
	const [tweather] = useInputStore(({ input }) => [input?.[build]?.tweather])
	const { refDialog, open, close, isOpen } = useDialog()
	const img = typeof weather.code == 'number' ? <img src={`/img/weather/${weather.code}.svg`} alt={weather.weather} /> : null
	const dt = new Date(weather.time).toLocaleString('ru', { day: '2-digit', month: '2-digit' })

	return (
		<>
			<article className='wthr' onClick={open}>
				<div>
					<span className='status'>{weather.weather ?? ''}</span>
					<span className='temp' title={dt}>
						{tweather?.value ?? '--'}°C
					</span>
					<span>Влажность: {weather.humidity ?? '--'}%</span>
				</div>
				{img}
			</article>
			{/* Прогноз погоды на 7 дней */}
			{weather?.forecast && (
				<Dialog href={refDialog}>
					<Entry close={close} weather={weather} isOpen={isOpen} type={type} />
				</Dialog>
			)}
		</>
	)
}
