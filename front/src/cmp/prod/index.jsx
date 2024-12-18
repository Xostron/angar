import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import defImg from '@tool/icon'

//Информация по продукту
export default function Prod({ change, style, show }) {
	const { build } = useParams()
	const [automode, product] = useInputStore(({ input }) => [
		input?.retain?.[build]?.automode,
		input?.retain?.[build]?.product,
	])
	return (
		<div className='prod' style={style}>
			{ product 
				?<>
					<img src={defImg.product?.[product?.code]?.img} />
					<p>{product?.name}</p>
				</>
				: null}
			
			{
				automode 
				? <>
					<img src={defImg.automode?.[automode]?.img} />
					<p>{defImg.automode?.[automode]?.title}</p>
				</> 
				: null
			}
			
		</div>
	)
}