import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'

export default function Alarm({ buildId, cls }) {
	const [barB, timer] = useInputStore(useShallow(({ alarm }) => [alarm.barB, alarm.timer]))

	const alr = {}
	alr.timer = { val: Object.keys(timer?.[buildId] ?? {}).length || 0, title: 'Таймер запретов' }
	alr.tout = { val: barB?.[buildId]?.tout?.length || 0, title: barB?.[buildId]?.tout?.[0]?.msg ?? '' }
	alr.hout = { val: barB?.[buildId]?.hout?.length || 0, title: barB?.[buildId]?.hout?.[0]?.msg ?? '' }
	alr.antibliz = { val: barB?.[buildId]?.antibliz?.length || 0, title: barB?.[buildId]?.antibliz?.[0]?.msg ?? '' }
	alr.alrClosed = { val: barB?.[buildId]?.alrClosed?.length || 0, title: barB?.[buildId]?.alrClosed?.[0]?.msg ?? '' }

	return (
		<>
			{(!!alr?.alrClosed?.val || !!alr?.tout?.val || !!alr?.hout?.val || !!alr?.antibliz?.val || !!alr?.timer?.val) && (
				<div className='line-alarm'>
					{!!alr.alrClosed.val && (
						<img className={`icon six${cls}`} src={def['alrClosed']} title={alr.alrClosed.title} />
					)}
					{!!alr.tout.val && <img className={`icon six${cls}`} src={def['tout']} title={alr.tout.title} />}
					{!!alr.hout.val && <img className={`icon six${cls}`} src={def['hout']} title={alr.hout.title} />}
					{!!alr.antibliz.val && (
						<img className={`icon six${cls}`} src={def['antibliz']} title={alr.antibliz.title} />
					)}
					{!!alr.timer.val && (
						<div className='timer'>
							<img className={`icon six${cls}`} src={def['timer']} title={alr.timer.title} />
							<span className={`count-timer ctx${cls}`}>{alr?.timer?.val}</span>
						</div>
					)}
				</div>
			)}
		</>
	)
}

const def = {
	alrClosed: '/img/main/danger.svg',
	tout: '/img/main/cold.svg',
	hout: '/img/main/humidity.svg',
	antibliz: '/img/main/wind.svg',
	timer: '/img/main/timer.svg',
}
