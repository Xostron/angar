import { useEffect } from 'react'
import { useParams} from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import AlarmBar from '@cmp/alarm_bar'
import Paging from './paging'
import './style.css'

// Склад: список секций
export default function Building({}) {
	let { build } = useParams()
	const [getCurB, setCurB, sections] = useEquipStore(({ getCurB, setCurB, sections }) => [getCurB, setCurB, sections()])

	// обновление страницы
	useEffect(() => {
		const b = getCurB(build)
		setCurB(b)
	}, [getCurB(build)])

	return (
		<>
			<Paging bId={build} sections={sections} />
			<AlarmBar />
		</>
	)
}
