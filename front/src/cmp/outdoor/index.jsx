import Sensor from '@cmp/sensor'
import Weather from '@cmp/weather'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import { useShallow } from 'zustand/react/shallow'
import { checkS } from '@tool/sensor'

//Параметры улицы(погода, датчики)
export default function Outdoor() {
	// const [build] = useEquipStore(({ build }) => [build()])
	const [build, section, type] = useEquipStore(({ build, section, curType }) => [build(),section(), curType()])
	const [getTotalBy, getFan, humAbs] = useInputStore(({ getTotalBy, getFan, input }) => [
		getTotalBy,
		getFan,
		input?.humAbs,
	])
	if (!build) return null
	
	// Внутри склада
	const sens = [
		// Температура потолка (мин) и Разгонный вентилятор
		{ type: 'tin', ...getTotalBy('tin', 'min', build?._id), fan: getFan(build?.fan?.[0]) },
		// Влажность продукта (макс)
		{ type: 'hin', ...getTotalBy('hin', 'max', build?._id) },
		
	]
	// Холодильник. датчик со2
	if(type === 'cold') 
		sens.push({type: 'co2', ... getTotalBy('co2', 'min', section?._id)})
	// Абс влажность продукта
	else 
		sens.push({ type: 'calcMois', value: humAbs?.[build?._id] })
	
	return (
		<section className='outdoor'>
			<Weather />
			<Sensor data={sens} cls={'sens'} withImg={true} />
		</section>
	)
}
