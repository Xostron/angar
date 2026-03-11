import { useState, useCallback, useMemo } from 'react'
import useEquipStore from '@store/equipment'
import Charts from './charts'
import SensorChart from './sensor-chart'
import './style.css'

const PERIODS = [1, 2, 3, 4, 5, 6, 7]

const MODES = [
	{ key: 'general', label: 'Общий' },
	{ key: 'temperature', label: 'Температура продукта', type: 'tprd' },
	{ key: 'humidity', label: 'Влажность продукта', type: 'hin' },
]

/**
 * Страница «Отчёты».
 * Кнопки складов → режимы → панель управления (период + обновить) → графики.
 */
export default function Report() {
	const list = useEquipStore((s) => s.list)
	const sorted = useMemo(
		() => [...(list || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		[list],
	)
	const [selectedId, setSelectedId] = useState(sorted[0]?._id ?? null)
	const [days, setDays] = useState(1)
	const [tick, setTick] = useState(0)
	const [mode, setMode] = useState('general')

	const refresh = useCallback(() => setTick((t) => t + 1), [])
	const activeMode = MODES.find((m) => m.key === mode)

	return (
		<div className='report-page'>
			<div className='report-buildings'>
				{sorted.map((b) => (
					<button
						key={b._id}
						className={`report-bld-btn${selectedId === b._id ? ' active' : ''}`}
						onClick={() => setSelectedId(b._id)}
					>
						{b.code} {b.name}
					</button>
				))}
			</div>

			{selectedId ? (
				<>
					<div className='report-toolbar'>
						<div className='report-modes'>
							{MODES.map((m) => (
								<button
									key={m.key}
									className={`report-mode-btn${mode === m.key ? ' active' : ''}`}
									onClick={() => setMode(m.key)}
								>
									{m.label}
								</button>
							))}
						</div>
						<div className='report-toolbar-right'>
							<span className='report-toolbar-label'>Период:</span>
							{PERIODS.map((d) => (
								<button
									key={d}
									className={`report-period-btn${days === d ? ' active' : ''}`}
									onClick={() => setDays(d)}
								>
									{d}д
								</button>
							))}
							<button className='report-refresh-btn' onClick={refresh}>
								Обновить
							</button>
						</div>
					</div>

					{mode === 'general' ? (
						<Charts bldId={selectedId} days={days} tick={tick} />
					) : (
						<SensorChart bldId={selectedId} type={activeMode.type} days={days} tick={tick} />
					)}
				</>
			) : (
				<div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
					Выберите склад для отображения отчётов
				</div>
			)}
		</div>
	)
}
