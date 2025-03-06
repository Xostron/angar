import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import AlarmBar from '@cmp/alarm_bar'
import Paging from './paging'
import './style.css'

// Склад: список секций
export default function Building({}) {
	let { build } = useParams()
	const [getCurB, setCurB, sects = []] = useEquipStore(({ getCurB, setCurB, sections }) => [getCurB, setCurB, sections()])
	const navigate = useNavigate()
	const location = useLocation()

	// обновление страницы
	useEffect(() => {
		const b = getCurB(build)
		setCurB(b)
	}, [getCurB(build)])

	// Редирект на секции
	useEffect(() => {
		if (sects?.length > 1 || sects?.length === 0 || sects?.[0]?.buildingId != build) {
			// console.log(1112, 'Редирект на секции отклонен', build, sects)
			return
		}
		// console.log(1113, build, 'Переход в секцию', sects?.[0]?._id, 'length = ' + sects.length)
		const path = `${location.pathname}/section/${sects?.[0]?._id}`.replace('//', '/')
		navigate(path)
	}, [sects])

	return (
		<>
			<Paging bId={build} sects={sects} />
			<AlarmBar />
		</>
	)
}
