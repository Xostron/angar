import './style.css'
import defUn from '@src/tool/unit'

// Отображение Испарителя
export default function Product({state, data}) {
	if(!state || !data)  return null
	// console.log('Product',state, data)
	let cls = ['page-section-cold-product', 'brd', data?.state ?? '']
	cls = cls.join(' ')

	const unit = defUn?.temp
	return (
		<div  className={cls} title={data?.state ?? ''}>
			<span>{data?.value ?? '--'} {unit}</span>
		</div>
	)
}
