import './style.css'
import defUn from '@src/tool/unit'

// Отображение датчика давления
export default function Pressure({ data, state = [], value = 'min' }) {
	// Нет структуры
	if (!state?.length || !data) return null
	const unit = defUn?.['p'] ?? ''
	// ошибка датчика
	let cls = ['page-section-cold-pressure', 'brd']
	if (data?.state) cls.push(data?.state)
	cls = cls.join(' ')

	return (
		<div className={cls} title={`${state?.[0]?.name} : ${data.state}`}>
			<img src='/img/cold/pressure.svg' />
			<span>
				{data[value] ?? '--'} {unit}
			</span>
		</div>
	)
}
