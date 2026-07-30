import useInputStore from '@store/input'
import './style.css'

export default function Tout({ buildingId }) {
	const { input, alarm } = useInputStore()
	//console.log('total: ', input?.total)
	const total = input?.total?.[buildingId]
	if (!total) return null
	const count = alarm?.count?.[buildingId]
	const imgT = '/img/periphery/temp/on.svg'
	const imgWet = '/img/periphery/moisture/on.svg'
	const imgAlrm = '/img/alarm/alr.svg'

	return (
		<div className='temp-block'>
			{/* Влажность */}
			<div className={`temp ${total?.hin?.state ?? 'off'}`}>
				<img src={imgWet} />
				{total?.hin?.max!=null ? <span> {total?.hin?.max} %</span> : null}
			</div>
			{/* Температура продукта min */}
			<div className={`temp ${total?.tprd?.state ?? ''}`}>
				<img src={imgT} />
				{total?.tprd?.min!=null ? <span> min {total?.tprd?.min} °C</span> : null}
			</div>
			{/* Температура подукта max  */}
			<div className={`temp ${total?.tprd?.state ?? ''}`}>
				<img src={imgT} />
				{total?.tprd?.max!=null ? <span> max {total?.tprd?.max} °C</span> : null}
			</div>
			{/* Аварии */}
			{count ? (
				<div className={`msg alarm`}>
					<img src={imgAlrm} />
					<span>Сообщения</span>
					<span className='count'>{count}</span>
				</div>
			) : null}
		</div>
	)
}
