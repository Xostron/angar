import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'

export default function Count({ buildId, cls }) {
	const [count] = useInputStore(useShallow(({ alarm }) => [alarm.count]))
	return (
		<>
			{count?.[buildId] > 0 && (
				<div className={`danger dx${cls}`}>
					<img className={`icon-danger dax${cls}`} src='/img/signal/reset.svg' />
					<span>Сообщения</span>
					<span className={`count-danger dcx${cls}`}>{count?.[buildId]}</span>
				</div>
			)}
		</>
	)
}
