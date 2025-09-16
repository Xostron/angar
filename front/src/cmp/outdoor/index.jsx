import Sensor from '@cmp/sensor'
import Weather from '@cmp/weather'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import useViewStore from '@store/view'
import './style.css'
import { useShallow } from 'zustand/react/shallow'
import { checkS } from '@tool/sensor'

//Параметры улицы(погода, датчики)
export default function Outdoor() {
	// const [build, section, type] = useEquipStore(({ build, section, curType }) => [build(),section(), curType()])
	// const [getTotalBy, getFan, humAbs] = useInputStore(({ getTotalBy, getFan, input }) => [
	// 	getTotalBy,
	// 	getFan,
	// 	input?.humAbs,
	// ])
	const mb = useViewStore((s) => s.mb())
	const build = useEquipStore((s) => s.build())
	const section = useEquipStore((s) => s.section())
	const type = useEquipStore((s) => s.curType())
	const getTotalBy = useInputStore((s) => s.getTotalBy)
	const getFan = useInputStore((s) => s.getFan)
	const humAbs = useInputStore((s) => s.input?.humAbs)
	console.log(111, build?.fan)
	if (!build) return null

	// Внутри склада
	const sens = [
		// Температура потолка (мин) и Разгонный вентилятор
		{ type: 'tin', ...getTotalBy('tin', 'min', build?._id), fan: getFan(build?.fan?.[0]) },
		// Влажность продукта (макс)
		{ type: 'hin', ...getTotalBy('hin', 'max', build?._id) },
	]
	// Холодильник. датчик со2
	if (type === 'cold') sens.push({ type: 'co2', ...getTotalBy('co2', 'min', section?._id) })
	// Абс влажность продукта
	else sens.push({ type: 'calcMois', value: humAbs?.in?.[build?._id] })
	const cls = ['outdoor', mb].join(' ')
	return (
		<section className={cls}>
			<Weather />
			<Sensor data={sens} cls={'sens'} withImg={true} />
		</section>
	)
}
