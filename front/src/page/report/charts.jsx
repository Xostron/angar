import { useState, useEffect, useMemo } from 'react'
import { notification } from '@cmp/notification'
import { getCharts } from '@tool/api/report'
import { useTimeStore } from '@store/time'
import { posNow, posDayStart, posDateTime, posShiftMs } from '@tool/datetime'
import EChart from './echart'

const STATE_LABELS = ['Выкл', 'Норма', 'Авария']
const TITLES = ['Температура продукта', 'Влажность продукта', 'Клапана', 'Вентиляторы']
const UNITS = ['°C', '%']

/**
 * Один совмещённый график: 4 sub-grid с общей осью времени.
 * Температура и влажность — крупные, клапана и вентиляторы — компактные.
 */
export default function Charts({ bldId, days = 7, tick }) {
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!bldId) return
		setLoading(true)
		getCharts(bldId, days)
			.then(setData)
			.catch((e) => {
				notification.error(e?.message || 'Ошибка загрузки данных отчёта')
				setData(null)
			})
			.finally(() => setLoading(false))
	}, [bldId, days, tick])

	// Зона POS (после синхронизации времени) — перестраиваем график
	const offset = useTimeStore((s) => s.offset)
	const option = useMemo(() => buildOption(data, days), [data, days, offset])

	if (!bldId) return null

	return (
		<div className='report-chart-wrap'>
			<EChart option={option} loading={loading} style={{ width: '100%', height: '100%' }} />
		</div>
	)
}

const DAY_MS = 24 * 60 * 60 * 1000

function buildOption(data, days = 7) {
	const temp = data?.temperature || []
	const hum = data?.humidity || []
	const valve = data?.valve || []
	const fan = data?.fan || []

	if (!temp.length && !hum.length && !valve.length && !fan.length) {
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
	// Точки: [ts, value, state] -> [сдвинутая ts, value, state]
	const convPoints = (list) => list.map((v) => [conv(v[0]), ...v.slice(1)])

	const axisBase = { type: 'time', min: conv(start), max: conv(now) }

	return {
		// Ось времени рисуем по UTC со сдвинутыми метками = время POS
		useUTC: pos,

		title: [
			{ text: TITLES[0], left: 'center', top: '0%', textStyle: { fontSize: 13 } },
			{ text: TITLES[1], left: 'center', top: '28%', textStyle: { fontSize: 13 } },
			{ text: TITLES[2], left: 'center', top: '57%', textStyle: { fontSize: 13 } },
			{ text: TITLES[3], left: 'center', top: '75%', textStyle: { fontSize: 13 } },
		],

		grid: [
			{ left: 60, right: 20, top: '4%', height: '22%' },
			{ left: 60, right: 20, top: '32%', height: '22%' },
			{ left: 60, right: 20, top: '61%', height: '11%' },
			{ left: 60, right: 20, top: '79%', height: '11%' },
		],

		xAxis: [
			{ ...axisBase, gridIndex: 0, axisLabel: { show: false }, axisTick: { show: false } },
			{ ...axisBase, gridIndex: 1, axisLabel: { show: false }, axisTick: { show: false } },
			{ ...axisBase, gridIndex: 2, axisLabel: { show: false }, axisTick: { show: false } },
			{ ...axisBase, gridIndex: 3 },
		],

		yAxis: [
			{ type: 'value', gridIndex: 0, name: '°C', nameTextStyle: { fontSize: 11 } },
			{ type: 'value', gridIndex: 1, name: '%', nameTextStyle: { fontSize: 11 } },
			{
				type: 'value', gridIndex: 2, min: 0, max: 1, interval: 1,
				axisLabel: { formatter: (v) => (v ? 'ВКЛ' : 'ВЫКЛ'), fontSize: 10 },
			},
			{
				type: 'value', gridIndex: 3, min: 0, max: 1, interval: 1,
				axisLabel: { formatter: (v) => (v ? 'ВКЛ' : 'ВЫКЛ'), fontSize: 10 },
			},
		],

		axisPointer: { link: [{ xAxisIndex: 'all' }] },

		tooltip: {
			trigger: 'axis',
			formatter(params) {
				const p = params[0]
				if (!p) return ''
				const dt = tsFmt(p.value[0])
				const i = p.seriesIndex
				if (i <= 1) {
					const st = STATE_LABELS[p.value[2]] || '—'
					return `${dt}<br/>${TITLES[i]}: <b>${p.value[1] ?? '—'} ${UNITS[i]}</b><br/>Статус: ${st}`
				}
				return `${dt}<br/>${TITLES[i]}: <b>${p.value[1] ? 'ВКЛ' : 'ВЫКЛ'}</b>`
			},
		},

		dataZoom: [
			{ type: 'inside', xAxisIndex: [0, 1, 2, 3] },
			{ type: 'slider', xAxisIndex: [0, 1, 2, 3], bottom: '1%', height: 18 },
		],

		visualMap: [{
			show: true,
			dimension: 2,
			seriesIndex: [0, 1],
			pieces: [
				{ value: 0, color: '#999', label: 'Выкл' },
				{ value: 1, color: '#5470c6', label: 'Норма' },
				{ value: 2, color: '#ee6666', label: 'Авария' },
			],
			top: 0, right: 10, orient: 'horizontal',
		}],

		series: [
			{
				name: TITLES[0], type: 'line', xAxisIndex: 0, yAxisIndex: 0,
				data: convPoints(temp), showSymbol: false, encode: { x: 0, y: 1 },
			},
			{
				name: TITLES[1], type: 'line', xAxisIndex: 1, yAxisIndex: 1,
				data: convPoints(hum), showSymbol: false, encode: { x: 0, y: 1 },
			},
			{
				name: TITLES[2], type: 'line', step: 'end',
				xAxisIndex: 2, yAxisIndex: 2,
				data: convPoints(valve), showSymbol: false,
				areaStyle: { opacity: 0.3 },
				itemStyle: { color: '#91cc75' }, lineStyle: { width: 2 },
			},
			{
				name: TITLES[3], type: 'line', step: 'end',
				xAxisIndex: 3, yAxisIndex: 3,
				data: convPoints(fan), showSymbol: false,
				areaStyle: { opacity: 0.3 },
				itemStyle: { color: '#fac858' }, lineStyle: { width: 2 },
			},
		],
	}
}
