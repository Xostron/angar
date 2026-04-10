import useInputStore from '@store/input'

export default function Tprd({ buildId, cls }) {
	const [getTotalBy] = useInputStore(({ getTotalBy }) => [getTotalBy])
	const min = getTotalBy('tprd', 'min', buildId)
	const max = getTotalBy('tprd', 'max', buildId)

	// ошибка датчика
	let cl = []
	if (min?.state === 'alarm') cl.push('error')
	if (min?.state === 'off') cl.push('off')
	cl = cl.join(' ')
	return (
		<div className='temp-block'>
			<div className={`temp tx${cls} ${cl}`}>min {min?.value ?? '--'} °C</div>
			<div className={`temp tx${cls} ${cl}`}>max {max?.value ?? '--'} °C</div>
		</div>
	)
}
