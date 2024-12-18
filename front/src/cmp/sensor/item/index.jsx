import './style.css'
import defImg from '@src/tool/icon'
import defUn from '@src/tool/unit'

//Датчик
export default function Item({ data = {} }) {

	const { type, state, value } = data

	let t
	if (['tout', 'tin'].includes(type)) {
		t = 'temp'
	} else if (['hin', 'hout'].includes(type)) {
		t = 'mois'
	}else if('co2' === type) {
		t = type
	} else t = 'calcMois'

	const imgS = defImg?.[t]?.['on']
	const unit = defUn?.[t]
	let cls = ['sens-item']
	if (!imgS) cls.push('sens-item-center')
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
