import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import Outdoor from '@cmp/outdoor'
import SubHeader from '@cmp/sub_header'
import AlarmBar from '@cmp/alarm_bar'
import Paging from './paging'
import Banner from '@cmp/banner'
import './style.css'

//Информация по складу
export default function Building({}) {
	let { build } = useParams()
	const [getCurB, setCurB, sections] = useEquipStore(
		useShallow(({ getCurB, setCurB , sections}) => [getCurB, setCurB, sections()])
	)
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		// обновление страницы
		const b = getCurB(build)
		setCurB(b)
	}, [getCurB(build)])

	useEffect(() => {
		// Перенаправление на страницу секции (если у склада только одна секция)
		const path = `${location.pathname}/section/${sections?.[0]?._id}`.replace('//', '/')
		if (sections?.length === 1) navigate(path)
	}, [sections])
	if (!sections) return null
	return (
		<main className='build'>
			<SubHeader />
			<Outdoor />
			<section className='sect'>{sections?.length && <Paging bId={build} sections={sections}/>}</section>
			<AlarmBar />
			<Banner />
		</main>
	)
}
