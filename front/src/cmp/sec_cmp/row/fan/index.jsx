import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import ItemFan from './item/fan'
import ItemCooler from './item/cooler'
import '../style.css'

export default function Row({ active, fan = [], cooler = [], cls = '' }) {
	const { build, sect } = useParams()
	const { warnCustom, warn } = useWarn()
	const { isAuth } = useAuthStore()
	const { getFan } = useInputStore()

	let cl = ['cmp-sec-row', cls]
	cl = cl.join(' ')
	return (
		<>
			<div className={cl}>
				{!!fan?.length &&
					fan.map((el) => {
						// данные о ВНО
						const f = getFan(el)
						return (
							<ItemFan
								key={el._id}
								data={{ ...f, buildingId: build, sectionId: sect, active }}
								onClick={onClick}
								isAuth={isAuth}
							/>
						)
					})}
				{/* Испарители + датчик температуры всасывания */}
				{!!cooler?.length &&
					cooler.map((el) => {
						// данные о ВНО испарителя
						const f = el?.fan?.[0] ? getFan(el?.fan?.[0]) : {}

						return (
							<ItemCooler
								key={el._id}
								data={{ el, ...f, buildingId: build, sectionId: sect, active }}
								onClick={onClick}
								isAuth={isAuth}
							/>
						)
					})}
			</div>
		</>
	)

	function onClick(data) {
		if (!isAuth) {
			return warn('auth', 'warn', () => warnCustom({}, 'person'))
		}
		if (data._id === null) return warn('noexist_cooler', 'warn')
		data?.ao ? warnCustom(data, 'fanao') : warnCustom(data, 'fan')
	}
}
