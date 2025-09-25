import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import useViewStore from '@src/store/view'
import Sidebar from './sidebar'
import Nav from '@cmp/nav'
import DefSection from './def'
import './style.css'

//Подробная информация по секции
export default function Sect({}) {
	const { sect, build } = useParams()
	const getCurB = useEquipStore((s) => s.getCurB)
	const getCurS = useEquipStore((s) => s.getCurS)
	const sections = useEquipStore((s) => s.sections())
	const section = useEquipStore((s) => s.section())
	const setCurB = useEquipStore((s) => s.setCurB)
	const setCurS = useEquipStore((s) => s.setCurS)
	const type = useEquipStore((s) => s.getType(build))
	const mb = useViewStore((s) => s.mb())
	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(build))
		setCurS(getCurS(sect))
	}, [sect, getCurB(build)])

	if (!section) return null
	const nhs = { gridTemplateRows: `repeat(${sections.length}, var(--fsz65))` }
	const cls = ['page-section-nav', mb].join(' ')
	return (
		<>
			<Nav cls={cls} cur={sect} data={sections} ph='section' stl={nhs} />
			<Sidebar />
			<DefSection type={type} />
		</>
	)
}
