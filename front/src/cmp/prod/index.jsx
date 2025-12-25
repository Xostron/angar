import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import defImg from '@tool/icon'

//Информация по продукту
export default function Prod({ change, style, show }) {
	const { build } = useParams()
	// const [product, sm] = useInputStore(({ input }) => [
	// 	input?.retain?.[build]?.product,
	// 	input?.building?.[build]?.submode,
	// ])
	const automode = useInputStore((s) => s?.input?.retain?.[build]?.automode)
	const product = useInputStore((s) => s?.input?.retain?.[build]?.product)
	const sm = useInputStore((s) => s?.input?.building?.[build]?.submode)
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
