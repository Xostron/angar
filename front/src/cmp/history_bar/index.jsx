import { useEffect, useRef, useCallback, useState } from 'react'
import useHistoryStore from '@store/history'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import { getHistory } from '@tool/api/history'
import {
	posNow,
	posDate,
	posTime,
	posDateTime,
	posParts,
	posHourStart,
	posInput,
	posFromInput,
	pad2,
} from '@tool/datetime'
import './style.css'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

// Отметка времени в зоне POS
function fmtTs(val) {
	return val ? posDateTime(val) : 'нет данных'
}

export default function HistoryBar() {
	const { active, collapsed, playing, ts, step, loading, dataTimes } = useHistoryStore()
	const { setTs, play, pause, forward, backward, setStep, setLoading, setDataTimes, toggleCollapsed, toggle } = useHistoryStore()
	const intervalRef = useRef(null)
	const lastFetchRef = useRef(null)
	// Выбор даты и времени для быстрого перехода
	const [picker, setPicker] = useState({ open: false, value: '' })

	// При включении режима просмотра держим позицию внутри окна «последние 7 дней» (по времени POS)
	useEffect(() => {
		if (!active) return
		const now = posNow()
		const t = useHistoryStore.getState().ts.getTime()
		if (t < now - SEVEN_DAYS_MS || t > now) setTs(new Date(now))
	}, [active, setTs])

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
			// Ограничение — по времени POS
			const now = posNow()
			if (next.getTime() >= now) {
				useHistoryStore.getState().pause()
				return
			}
			setTs(next)
		}, 1000)
		return () => clearInterval(intervalRef.current)
	}, [playing, active, setTs])

	if (!active) return null

	// Границы диапазона и подписи — по времени POS
	const now = posNow()
	const min = now - SEVEN_DAYS_MS
	const ticks = buildTicks(min, now)

	// Открыть выбор даты и времени для быстрого перехода
	const openPicker = () => setPicker({ open: true, value: posInput(ts.getTime()) })
	const closePicker = () => setPicker({ open: false, value: '' })
	// Перейти к выбранной дате и времени (значение трактуется как время POS)
	const jumpTo = (value) => {
		const t = posFromInput(value)
		if (t === null) return
		setTs(new Date(t))
		closePicker()
	}
	// Установить «сейчас» по времени POS
	const setNowValue = () => setPicker({ open: true, value: posInput(posNow()) })

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
						<span
							className='history-bar__time history-bar__time--click'
							onClick={openPicker}
							title='Переход к дате и времени'
						>
							{posDate(ts)} {posTime(ts)}
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
							min={min}
							max={now}
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

					{picker.open && (
						<div className='history-bar__picker'>
							<div className='history-bar__picker-title'>Переход к дате и времени (время POS)</div>
							<input
								className='history-bar__picker-input'
								type='datetime-local'
								step='60'
								min={posInput(min)}
								max={posInput(now)}
								value={picker.value}
								onChange={(e) => setPicker({ open: true, value: e.target.value })}
								onKeyDown={(e) => {
									if (e.key === 'Enter') jumpTo(picker.value)
									if (e.key === 'Escape') closePicker()
								}}
							/>
							<div className='history-bar__picker-btns'>
								<button className='history-bar__btn history-bar__btn--wide' onClick={setNowValue}>
									Сейчас
								</button>
								<button className='history-bar__btn history-bar__btn--wide' onClick={closePicker}>
									Отмена
								</button>
								<button className='history-bar__btn history-bar__btn--wide' onClick={() => jumpTo(picker.value)}>
									Перейти
								</button>
							</div>
						</div>
					)}
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

/**
 * Деления шкалы по времени POS
 * @param {number} minMs Начало диапазона
 * @param {number} maxMs Конец диапазона
 */
function buildTicks(minMs, maxMs) {
	const ticks = []
	const range = maxMs - minMs
	if (range <= 0) return ticks
	const start = posHourStart(minMs)
	if (start === null) return ticks

	for (let t = start + HOUR_MS; t <= maxMs; t += HOUR_MS) {
		const p = posParts(t)
		if (!p) continue
		const pct = ((t - minMs) / range) * 100
		const isDay = p.h === 0
		const label = isDay
			? `${pad2(p.d)}.${pad2(p.mo)}`
			: p.h % 6 === 0
				? `${pad2(p.h)}:00`
				: null
		ticks.push({ pct, major: isDay, label })
	}
	return ticks
}

