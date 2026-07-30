import defImg from '@tool/icon'
import useInputStore from '@store/input'
import './style.css'

export default function Mode({ buildingId, type }) {
	const retain = useInputStore(({ input }) => input.retain)
	const am = retain?.[buildingId]?.automode ?? null
	const product = retain?.[buildingId]?.product ?? null
	const img = `/img/type/${type}.svg`

	return (
		<div className='item-prod'>
			<div className='main-list-item-mode-prd'>
				<div className='icon-text'>
					{product?.name ? (
						<img
							className='icon-prod'
							src={defImg.product?.[product?.code]?.img}
							alt=''
						/>
					) : null}
					{product?.name}
				</div>
				<div className='icon-text'>
					{am ? (
						<img className='icon-prod' src={defImg.automode?.[am]?.img} alt='' />
					) : null}
					{defImg.automode?.[am]?.title || am}
				</div>
			</div>
			<div className='main-list-item-mode'>
				{type ? <img className='icon-prod' src={img} alt='' /> : null}
			</div>
		</div>
	)
}
