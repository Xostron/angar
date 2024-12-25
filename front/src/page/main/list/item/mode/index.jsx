import defImg from '@tool/icon'
import useInputStore from '@store/input'
import './style.css'
import useEquipStore from '@store/equipment'

export default function Mode({ buildingId , type}) {
	const retain = useInputStore(({ input }) => input.retain)
	const automode = retain?.[buildingId]?.automode ?? null
	const product = retain?.[buildingId]?.product ?? null
	const img = `/img/type/${type}.svg`
	return (
		<div className='item-prod'>
			<div className='main-list-item-mode-prd'>
				<div className='icon-text'>
					{product?.name 
						?<img className='icon-prod' src={defImg.product?.[product?.code]?.img} alt='' /> 
						: null
					}
					{product?.name}
				</div>
				<div className='icon-text'>
					{automode
						?<img className='icon-prod' src={defImg.mode?.[automode]?.img} alt='' />
						: null
					}
					{defImg.mode?.[automode]?.value || automode}
				</div>
			</div>
			<div className='main-list-item-mode'>
				{type
						?<img className='icon-prod' src={img} alt='' />
						: null
					}
			</div>
		</div>
	)
}
