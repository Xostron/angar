import { useState, useEffect, useMemo } from 'react'
import { notification } from '@cmp/notification'
import { getSensorChart } from '@tool/api/report'
import {useTimeStore} from '@store/time'
import { posNow, posDayStart, posDateTime, posShiftMs } from '@tool/datetime'
import EChart from './echart'

const COLORS = [
	'#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
	'#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4dc9f6',
	'#f7797d', '#c0ca33', '#26a69a', '#ab47bc', '#ff7043',
]

/**
 * Детальный график датчиков (температура или влажность продукта).
 * Каждый датчик — отдельная линия на одном графике.
 * @param {{ bldId: string, type: 'tprd'|'hin', days: number, tick: number }} props
 */
export default function SensorChart({ bldId, type, days = 7, tick }) {
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!bldId || !type) return
		setLoading(true)
		getSensorChart(bldId, type, days)
			.then(setData)
			.catch((e) => {
				notification.error(e?.message || 'Ошибка загрузки данных датчиков')
				setData(null)
			})
			.finally(() => setLoading(false))
	}, [bldId, type, days, tick])

	// Зона POS (после синхронизации времени) — перестраиваем график
	const offset = useTimeStore((s) => s.offset)
	const option = useMemo(() => buildSensorOption(data, days, type), [data, days, type, offset])

	if (!bldId) return null

	return (
		<div className='report-chart-wrap'>
			<EChart option={option} loading={loading} style={{ width: '100%', height: '100%' }} />
		</div>
	)
}

/**
 * @param {Array<{id: string, name: string, data: number[][]}>|null} series
 * @param {number} days
 * @param {'tprd'|'hin'} type
 */
function buildSensorOption(series, days, type) {
	if (!series?.length) {
		return {
			graphic: {
				type: 'text', left: 'center', top: 'middle',
				style: { text: 'Нет данных', fontSize: 18, fill: '#999' },
			},
		}
	}

	// Окно и подписи — по времени POS (клиент может быть не на POS)
	const now = posNow()
	const start = posDayStart(now, days - 1)
	const shift = posShiftMs()
	const pos = shift !== null
	// Метки сдвигаем в «настенное» время POS, ось считаем по UTC (useUTC)
	const conv = (v) => v + (shift ?? 0)
	// Метка тултипа: значение на графике -> время POS
	const tsFmt = (v) => posDateTime(v - (shift ?? 0))
	// Точки: [ts, value] -> [сдвинутая ts, value]
	const convPoints = (list) => list.map((v) => [conv(v[0]), ...v.slice(1)])

	const unit = type === 'tprd' ? '°C' : '%'

	return {
		// Ось времени рисуем по UTC со сдвинутыми метками = время POS
		useUTC: pos,

		grid: { left: 60, right: 20, top: 40, bottom: 80 },

		xAxis: {
			type: 'time',
			min: conv(start),
			max: conv(now),
		},

		yAxis: {
			type: 'value',
			name: unit,
			nameTextStyle: { fontSize: 11 },
		},

		tooltip: {
			trigger: 'axis',
			formatter(params) {
				if (!params?.length) return ''
				const dt = tsFmt(params[0].value[0])
				const lines = params.map(
					(p) => `${p.marker} ${p.seriesName}: <b>${p.value[1] ?? '—'} ${unit}</b>`,
				)
				return `${dt}<br/>${lines.join('<br/>')}`
			},
		},

		legend: {
			bottom: 35,
			type: 'scroll',
			textStyle: { fontSize: 11 },
		},

		dataZoom: [
			{ type: 'inside', xAxisIndex: 0 },
			{ type: 'slider', xAxisIndex: 0, bottom: 8, height: 20 },
		],

		series: series.map((s, i) => ({
			name: s.name,
			type: 'line',
			data: convPoints(s.data),
			showSymbol: false,
			encode: { x: 0, y: 1 },
			itemStyle: { color: COLORS[i % COLORS.length] },
			lineStyle: { width: 1.5 },
		})),
	}
}
