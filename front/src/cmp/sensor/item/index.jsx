import useViewStore from '@store/view'
import defImg from '@src/tool/icon'
import defUn from '@src/tool/unit'
import './style.css'

//Датчик
export default function Item({ data = {} }) {
	const mb = useViewStore((s) => s.mb())
	const { type, state, value } = data

	let t
	if (['tout', 'tin'].includes(type)) {
		t = 'temp'
	} else if (['hin', 'hout'].includes(type)) {
		t = 'mois'
	} else if ('co2' === type) {
		t = type
	} else t = 'calcMois'

	let cls = ['cmp-sensor-item',mb]
	const unit = defUn?.[t]
	const imgS = defImg?.[t]?.['on']
	if (!imgS) cls.push('center')
	// ошибка датчика
	if (state === 'alarm') cls.push('error')
	if (state === 'off') cls.push('off')
	cls = cls.join(' ')

	return (
		<div className={cls}>
			{imgS && <img src={imgS} alt='' />}
			<span>
				{value ?? '--'} {unit}
			</span>
		</div>
	)
}
