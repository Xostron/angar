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
	const bld = useEquipStore((s) => s.getCurB(build))
	const setCurB = useEquipStore((s) => s.setCurB)
	const sects = useEquipStore((s) => s.sections()) ?? []
	const navigate = useNavigate()
	const location = useLocation()

	// обновление страницы
	useEffect(() => {
		setCurB(bld)
	}, [bld])

	// Редирект на секции
	useEffect(() => {
		if (sects?.length > 1 || sects?.length === 0 || sects?.[0]?.buildingId != build) return
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
