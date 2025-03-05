import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import AlarmBar from '@cmp/alarm_bar'
import Paging from './paging'
import './style.css'

// Склад: список секций
export default function Building({}) {
	let { build, sect } = useParams()
	const [getCurB, setCurB, sects] = useEquipStore(({ getCurB, setCurB, sections }) => [getCurB, setCurB, sections()])
	const navigate = useNavigate()
	const location = useLocation()
	// обновление страницы
	useEffect(() => {
		const b = getCurB(build)
		setCurB(b)
	}, [ build, getCurB(build)])

	// useEffect(() => {
	// 	if (sects?.length === 1 && !sect) {
	// 		console.log(1111, build, 'Переход в секцию', sect, 'length = '+sects.length)
	// 		const path = `${location.pathname}/section/${sects?.[0]?._id}`.replace('//', '/')
	// 		navigate(path)
	// 	}
	// }, [sects])

	// console.log(222, sects)
	return (
		<>
			<Paging bId={build} sects={sects} />
			<AlarmBar />
		</>
	)
}
