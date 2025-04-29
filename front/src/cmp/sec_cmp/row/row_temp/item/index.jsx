import useInputStore from '@store/input'
import defUn from '@tool/unit'

export default function ItemTemp({ sensId, type, cls }) {
	const [getSens] = useInputStore(({ getSens }) => [getSens])
	const unit = defUn[type]
	let cl = ['cmp-sec-row-item', cls]
	const v= getSens(sensId)

	// ошибка датчика
	if (v?.state === 'alarm') cl.push('error')
	if (v?.state === 'off') cl.push('off')
	cl = cl.join(' ')

	return (
		<div className={cl}>
			<span>
				{v?.state === 'on' ? v?.value : '--'} {unit}
			</span>
		</div>
	)
}
