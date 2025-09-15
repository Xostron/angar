import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import useViewStore from '@store/view'
import './style.css'

export default function Region() {
	const [list, weather] = useEquipStore(useShallow(({ list, weather }) => [list, weather]))
	const address = list?.[0]?.pc?.address?.value
	const img = weather.code ? <img src={`/img/weather/${weather.code}.svg`} alt='' /> : null
	const dt = new Date(weather.time).toLocaleString()
	const mb = useViewStore((s) => s.mb())
	const cls = ['mw-region', mb].join(' ')
	const clsInfo = ['mwrl-info', mb].join(' ')
	const clsL = ['mwr-left', mb].join(' ')
	const clsR = ['mwr-right', mb].join(' ')
	return (
		<div className={cls}>
			<div className={clsL}>
				{address ? (
					<>
						<span>{address}</span>
						<div className={clsInfo}>
							<div>
								<span>Влажность: {weather.humidity ?? '--'} % </span>
							</div>
							<span title={dt}>{weather.temp ?? '--'}°C</span>
						</div>
					</>
				) : (
					<>
						<div className={clsInfo}>
							<span>Адрес не указан</span>
						</div>
					</>
				)}
			</div>
			<div className={clsR}>{img}</div>
		</div>
	)
}
