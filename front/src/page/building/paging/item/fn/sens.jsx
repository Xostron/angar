import defUn from '@src/tool/unit'
// import '@page//style.css'
export default function Sens({ data = {} }) {
	const { name, value, type, state } = data
	const unit = defUn?.[type]

	let cls = ['sensor-item']
	// ошибка датчика
	if (state === 'alarm') cls.push('error')
	if (state === 'off') cls.push('off')
	cls = cls.join(' ')
	return (
		<div className={cls}>
			{name} {value ?? '--'} {unit}
		</div>
	)
}
