import { useRef, useEffect } from 'react'
import * as echarts from 'echarts'

/**
 * Обёртка ECharts для React.
 * @param {{ option: object, style?: object, loading?: boolean }} props
 */
export default function EChart({ option, style, loading }) {
	const el = useRef(null)
	const chart = useRef(null)

	useEffect(() => {
		if (!el.current) return
		chart.current = echarts.init(el.current)
		const onResize = () => chart.current?.resize()
		window.addEventListener('resize', onResize)
		return () => {
			window.removeEventListener('resize', onResize)
			chart.current?.dispose()
			chart.current = null
		}
	}, [])

	useEffect(() => {
		if (!chart.current) return
		if (loading) {
			chart.current.showLoading()
		} else {
			chart.current.hideLoading()
			if (option) chart.current.setOption(option, true)
		}
	}, [option, loading])

	return <div ref={el} style={style || { width: '100%', height: '350px' }} />
}
