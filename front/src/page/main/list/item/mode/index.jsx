import defImg from '@tool/icon'
// import useInputStore from '@store/input'
import './style.css'

export default function Mode({ doc }) {
	if(!doc) return null 
	const {product, automode, type} = doc
	const img = `/img/type/${type}.svg`
	return (
		<div className='item-prod'>
			<div className='main-list-item-mode-prd'>
				<div className='icon-text'>
					{product.name ? (
						<img
							className='icon-prod'
							src={defImg.product?.[product?.code]?.img}
							alt=''
						/>
					) : null}
					{product?.name}
				</div>
				<div className='icon-text'>
					{automode ? (
						<img
							className='icon-prod'
							src={defImg.automode?.[automode.code]?.img}
							alt=''
						/>
					) : null}
					{automode?.name ?? '--'}
				</div>
			</div>
			<div className='main-list-item-mode'>
				{type ? <img className='icon-prod' src={img} alt='' /> : null}
			</div>
		</div>
	)
}
