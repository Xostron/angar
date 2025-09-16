import './style.css'
import Sensor from '@cmp/sensor'
import Owner from './owner'
import Forecast from './fore'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import useViewStore from '@store/view'
import { useShallow } from 'zustand/react/shallow'
import { checkS } from '@tool/sensor'

export default function Weather({}) {
	// const [build, getType, weather] = useEquipStore(
	// 	useShallow(({ build, getType, weather }) => [build(), getType, weather])
	// )
	// const [humAbs, getTotal, getTotalBy] = useInputStore(({ input, getTotal, getTotalBy }) => [
	// 	input?.humAbs,
	// 	getTotal,
	// 	getTotalBy,
	// ])
	const build = useEquipStore((s) => s.build())
	const getType = useEquipStore((s) => s.getType)
	const weather = useEquipStore((s) => s.weather)
	const humAbs = useInputStore((s) => s.input?.humAbs)
	const getTotal = useInputStore((s) => s.getTotal)
	const getTotalBy = useInputStore((s) => s.getTotalBy)
	const mb = useViewStore((s) => s.mb())

	if (!build) return null
	// Тип склада
	const type = getType(build._id)

	const sens = [
		// Температура улицы - мин
		{ type: 'tout', ...getTotalBy('tout', 'min', build?._id) },
		// Влажность улицы - max
		{ type: 'hout', ...getTotal('hout', 'max') },
		// Абсолютная влажность улицы
		{ type: 'calcMois', value: humAbs?.out?.com ?? humAbs?.out?.[build._id] },
	]
	sens[2].state = checkS(sens?.[0]?.state, sens?.[1]?.state)
	// const o = { company: build.company, code: build.code, name:address: build?.pc?.address?.value }
	const cls = ['cmp-weather', mb].join(' ')
	const clsOwner = ['cmp-weather-owner', mb].join(' ')
	const clsSens = ['cmp-weather-sens', mb].join(' ')
	return (
		<section className={cls}>
			<Owner data={build} cls={clsOwner} />
			<Sensor data={sens} cls={clsSens} type={type} />
			<Forecast address={build?.pc?.address?.value ?? ''} weather={weather} type={type} />
		</section>
	)
}

// style={{ backgroundImage: 'url(/img/w.jpg)' }}
