import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { sForecast } from '@socket/emit'
import Btn from '@cmp/fields/btn'
import './style.css'
import Weather7d from '@cmp/weather_7d'
import useOutputStore from '@store/output'

export default function Entry({ close, weather, isOpen }) {
	return (
		<div className='entry cmp-weather-entry'>
			<Weather7d weather={weather} />
			{isOpen ? <Analytic /> : <span>Аналитика</span>}
		</div>
	)
}

function Analytic({}) {
	const { build } = useParams()
	const [fore, setFore] = useState(null)
	const [setSettingAu, sendSettingAu] = useOutputStore(({ setSettingAu, sendSettingAu }) => [setSettingAu, sendSettingAu])

	let cl = ['cmp-weather-entry-fore']
	if (fore) cl.push('cmp-weather-entry-fore-active')
	cl = cl.join(' ')

	return (
		<>
			<Btn cls='cmp-weather-entry-btn' onClick={fnFore} title='Аналитика' />
			{!fore?.buildingId ? (
				<>{fore?.msg}</>
			) : (
				<div className={cl}>
					{fore?.msg}
					<div className='cmp-weather-entry-btns'>
						<Btn cls='cmp-weather-entry-btn-apy' onClick={fnOk} title='Применить' />
						<Btn cls='cmp-weather-entry-btn-apy' onClick={fnCancel} title='Отмена' />
					</div>
				</div>
			)}
		</>
	)
	// Запрос аналитики по погоде
	function fnFore() {
		sForecast({ build }, setFore)
	}
	// Применить расчеты аналитики к настройке "Конечная темп. охлаждения"
	function fnOk() {
		if (typeof fore?.value !== 'object') return
		const obj = { build:fore.buildingId, type: 'cooling', name: 'target.target', value: fore.value.target.target, prdCode:fore.product }
		setSettingAu(obj)
		sendSettingAu()
		setFore(null)
	}
	// Отмена, очистка сообщения
	function fnCancel() {
		setFore(null)
	}
}
