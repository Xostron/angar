import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import Sidebar from './sidebar'
import Nav from '@cmp/nav'
import DefSection from './def'
import './style.css'

//Подробная информация по секции
export default function Sect({}) {
	const { sect, build } = useParams()
	const [section, sections, getCurB, setCurB, getCurS, setCurS, getType] = useEquipStore(
		({ section, sections, getCurB, setCurB, getCurS, setCurS, getType }) => [
			section(),
			sections(),
			getCurB,
			setCurB,
			getCurS,
			setCurS,
			getType,
		]
	)

	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(build))
		setCurS(getCurS(sect))
	}, [sect, getCurB(build)])

	if (!section) return null
	const nhs = { gridTemplateRows: `repeat(${sections.length}, var(--fsz65))` }
	const type = getType(build)
	return (
		<>
			<Nav cls='nav-h-section' cur={sect} data={sections} ph='section' stl={nhs} />
			<Sidebar />
			<DefSection type={type} />
		</>
	)
}
