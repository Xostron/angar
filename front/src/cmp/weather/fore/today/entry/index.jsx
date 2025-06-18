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
			<Analytic />
		</div>
	)
}

function Analytic({}) {
	const { build } = useParams()
	const [fore, setFore] = useState(null)
	const [setSettingAu, sendSettingAu] = useOutputStore(({ setSettingAu, sendSettingAu }) => [setSettingAu, sendSettingAu])
	const [show, setShow] = useState(false)

	let cl = ['cmp-weather-entry-fore-active']
	if (show) cl = ['cmp-weather-entry-fore-noactive']
	cl = cl.join(' ')

	let cl2 = ['cmp-weather-entry-fore-noactive']
	if (show) cl2.push('cmp-weather-entry-fore-active')
	cl2 = cl2.join(' ')

	useEffect(() => {
		if (fore) setShow(true)
	}, [fore])

	return (
		<>
			<article className='cmp-weather-entry-fore'>
				<section className={cl}>
					<Btn cls='cmp-weather-entry-btn' onClick={fnFore} title='Аналитика' icon='/img/menu/report.svg' />
				</section>
				<section className={cl2}>
					{fore?.msg}
					<div className='cmp-weather-entry-btns'>
						{fore?.value ? (
							<>
								<Btn cls='cmp-weather-entry-btn-ok' onClick={fnOk} title='Да' icon='/img/ok.svg' />
								<Btn cls='cmp-weather-entry-btn-ok' onClick={fnCancel} title='Отмена' icon='/img/cancel.svg' />
							</>
						) : (
							<Btn cls='cmp-weather-entry-btn-ok' onClick={fnCancel} title='ОК' icon='/img/ok.svg' />
						)}
					</div>
				</section>
			</article>

			{/* } */}
		</>
	)
	// Запрос аналитики по погоде
	function fnFore() {
		sForecast({ build }, setFore)
	}
	// Применить расчеты аналитики к настройке "Конечная темп. охлаждения"
	function fnOk() {
		if (typeof fore?.value !== 'object') return
		const obj = { build: fore.buildingId, type: 'cooling', name: 'target.target', value: fore.value.target.target, prdCode: fore.product }
		setSettingAu(obj)
		sendSettingAu()
		setShow(false)
		setTimeout(() => setFore(null), 300)
		// setFore(null)
	}
	// Отмена, очистка сообщения
	function fnCancel() {
		setTimeout(() => setFore(null), 300)
		setShow(false)
		// setFore(null)
	}
}
