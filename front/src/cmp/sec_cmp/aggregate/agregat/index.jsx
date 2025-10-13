import './style.css'

// Отображение Агрегатов
/**
 *
 * @param {*} state рама
 * @param {*} data мясо
 * @returns
 */
export default function Agregat({ state, data, cl = '' }) {
	if (!state || !data) return null
	const aggregate = data?.state

	let cls = [cl, 'page-section-cold-aggregate', aggregate ?? '']
	cls = cls.join(' ')

	const stl = {
		backgroundImage: `url('/img/cold/aggregate2.svg')`,
	}
	const compressor = getState(data.compressor)
	return (
		<div className={cls} title={`Агрегат:${state.aggregate._id} ${aggregate ?? ''}`} style={stl}>
			{compressor.state !== 'alarm' ? (
				<img className={compressor.state} title={`Компрессор:  ${compressor.state ?? ''}`} src='/img/periphery/fan/stop.svg' />
			) : (
				<img src='/img/periphery/fan/alr.svg' />
			)}

			{compressor.alarm ? <img className='someAlr' src='/img/main/danger.svg' /> : null}
		</div>
	)
}
// Определяем состояние компрессоров и есть ли в аварии
function getState(doc = {}) {
	const arr = Object.values(doc)?.map((el) => el?.state)
	const o = {
		state: 'stop',
		alarm: arr.some((el) => el === 'alarm'),
	}
	if (arr.every((el) => el === 'stop')) o.state = 'stop'
	else if (arr.every((el) => el === 'alarm')) o.state = 'alarm'
	else if (arr.some((el) => el === 'run')) o.state = 'run'
	return o
}
