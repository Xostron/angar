import { useEffect, useRef, useCallback } from 'react'
import useHistoryStore from '@store/history'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import { getHistory } from '@tool/api/history'
import './style.css'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function fmtTs(val) {
	if (!val) return 'нет данных'
	const d = new Date(val)
	return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU')
}

export default function HistoryBar() {
	const { active, collapsed, playing, ts, step, loading, dataTimes } = useHistoryStore()
	const { setTs, play, pause, forward, backward, setStep, setLoading, setDataTimes, toggleCollapsed, toggle } = useHistoryStore()
	const intervalRef = useRef(null)
	const lastFetchRef = useRef(null)

	const fetchData = useCallback(
		async (date) => {
			const key = date.toISOString()
			if (lastFetchRef.current === key) return
			lastFetchRef.current = key
			setLoading(true)
			try {
				const res = await getHistory(date)
				// if (res.input) useInputStore.getState().initIn(res.input)
				// if (res.equip) useEquipStore.getState().initE(res.equip)
				// /if (res.alarm) useInputStore.getState().initAlr(res.alarm)
				useInputStore.getState().initIn(res.input ?? {})
				useEquipStore.getState().initE(res.equip ?? {})
				useInputStore.getState().initAlr(res.alarm ?? {})
				setDataTimes({
					input: res.ts?.input ?? null,
					equip: res.ts?.equip ?? null,
					alarm: res.ts?.alarm ?? null,
				})
			} catch (e) {
				console.error('Ошибка загрузки истории:', e)
				setDataTimes({ input: null, equip: null, alarm: null })
			} finally {
				setLoading(false)
			}
		},
		[setLoading, setDataTimes],
	)

	useEffect(() => {
		if (!active) return
		const timer = setTimeout(() => fetchData(ts), 300)
		return () => clearTimeout(timer)
	}, [active, ts, fetchData])

	useEffect(() => {
		if (!playing || !active) {
			clearInterval(intervalRef.current)
			return
		}
		intervalRef.current = setInterval(() => {
			const { ts, step } = useHistoryStore.getState()
			const next = new Date(ts.getTime() + step * 1000)
			const now = new Date()
			if (next >= now) {
				useHistoryStore.getState().pause()
				return
			}
			setTs(next)
		}, 1000)
		return () => clearInterval(intervalRef.current)
	}, [playing, active, setTs])

	if (!active) return null

	const now = new Date()
	const min = new Date(now.getTime() - SEVEN_DAYS_MS)
	const ticks = buildTicks(min, now)

	return (
		<div className={`history-bar ${collapsed ? 'history-bar--collapsed' : ''}`}>
			<div className='history-bar__label'>
				<span onClick={toggleCollapsed} title='Свернуть / развернуть' style={{ cursor: 'pointer' }}>
					Просмотр {collapsed ? '▲' : '▼'}
				</span>
				{loading && <span className='history-bar__loading'>загрузка...</span>}
				<button className='history-bar__btn history-bar__btn--exit' onClick={() => toggle(false)} title='Выйти из режима просмотра'>
					Выйти
				</button>
			</div>

			{!collapsed && (
				<>
					<div className='history-bar__controls'>
						<button className='history-bar__btn' onClick={backward} title='Назад'>⏮</button>
						{playing ? (
							<button className='history-bar__btn' onClick={pause} title='Пауза'>⏸</button>
						) : (
							<button className='history-bar__btn' onClick={play} title='Проиграть'>▶</button>
						)}
						<button className='history-bar__btn' onClick={forward} title='Вперёд'>⏭</button>
						<label className='history-bar__step-label'>
							Шаг (сек):
							<input
								className='history-bar__step-input'
								type='number'
								min={3}
								max={1000}
								value={step}
								onChange={(e) => setStep(e.target.value)}
							/>
						</label>
						<span className='history-bar__time'>
							{ts.toLocaleDateString('ru-RU')} {ts.toLocaleTimeString('ru-RU')}
						</span>
					</div>

					<div className='history-bar__data-times'>
						<DataTag name='input' ts={dataTimes.input} />
						<DataTag name='equip' ts={dataTimes.equip} />
						<DataTag name='alarm' ts={dataTimes.alarm} />
					</div>

					<div className='history-bar__timeline'>
						<input
							className='history-bar__slider'
							type='range'
							min={min.getTime()}
							max={now.getTime()}
							value={ts.getTime()}
							onChange={(e) => setTs(new Date(Number(e.target.value)))}
						/>
						<div className='history-bar__ticks'>
							{ticks.map((t, i) => (
								<div
									key={i}
									className={`history-bar__tick ${t.major ? 'history-bar__tick--major' : ''}`}
									style={{ left: `${t.pct}%` }}
								>
									{t.label && <span className='history-bar__tick-label'>{t.label}</span>}
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

function DataTag({ name, ts }) {
	const hasData = !!ts
	return (
		<span className={`history-bar__dtag ${hasData ? '' : 'history-bar__dtag--empty'}`}>
			{name}: {fmtTs(ts)}
		</span>
	)
}

function buildTicks(min, max) {
	const ticks = []
	const range = max.getTime() - min.getTime()
	const start = new Date(min)
	start.setMinutes(0, 0, 0)
	start.setHours(start.getHours() + 1)

	for (let d = new Date(start); d <= max; d.setHours(d.getHours() + 1)) {
		const pct = ((d.getTime() - min.getTime()) / range) * 100
		if (pct < 0 || pct > 100) continue
		const isDay = d.getHours() === 0
		const label = isDay
			? d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
			: d.getHours() % 6 === 0
				? `${String(d.getHours()).padStart(2, '0')}:00`
				: null
		ticks.push({ pct, major: isDay, label })
	}
	return ticks
}
