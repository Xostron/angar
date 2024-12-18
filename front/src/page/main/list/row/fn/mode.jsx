import defImg from '@tool/icon'
import useInputStore from '@store/input'

export default function Mode({ buildId, cls }) {
	const retain = useInputStore(({ input }) => input.retain)
	const automode = retain?.[buildId]?.automode ?? null
	const product = retain?.[buildId]?.product ?? null
	return (
		<div className='item-prod'>
			<div className={`icon-text icx${cls}`}>
				<img className={`icon-prod imx${cls}`} src={defImg.product?.[product?.name]?.img} alt='' />
				{product?.name}
			</div>
			<div className={`icon-text icx${cls}`}>
				<img className={`icon-prod imx${cls}`} src={defImg.mode?.[automode]?.img} alt='' />
				{defImg.mode?.[automode]?.value || automode}
			</div>
		</div>
	)
}
