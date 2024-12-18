import useInputStore from '@store/input'
import defUn from '@tool/unit'

export default function ItemTemp({ sensId, type, cls }) {
	const [getVal] = useInputStore(({ getVal }) => [getVal])
	const unit = defUn[type]
	let cl = ['sir-item', cls]
	const v= getVal(sensId)

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
