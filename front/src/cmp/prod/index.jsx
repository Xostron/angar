import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import defImg from '@tool/icon'

//Информация по продукту
export default function Prod({ change, style, show }) {
	const { build } = useParams()
	const [automode, product, sm] = useInputStore(({ input }) => [
		input?.retain?.[build]?.automode,
		input?.retain?.[build]?.product,
		input?.building?.[build]?.submode,
	])
	console.log(3333, product)
	const subm = sm?.[1] ? `(${sm[1]})` : ''
	return (
		<div className='prod' style={style}>
			{automode ? (
				<>
					<img src={defImg.automode?.[automode]?.img} />
					<p>{`${defImg.automode?.[automode]?.title}  ${subm}`} </p>
				</>
			) : null}
			{product ? (
				<>
					<img src={defImg.product?.[product?.code]?.img} />
					<p>{product?.name}</p>
				</>
			) : null}
		</div>
	)
}
