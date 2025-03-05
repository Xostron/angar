import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import Sidebar from './sidebar'
import Nav from '@cmp/nav'
import Info from './info'
import Cold from './cold'
import './style.css'

//Подробная информация по секции
export default function Sect({}) {
	const { sect, build } = useParams()
	const [section, sections, getCurB, setCurB, getCurS, setCurS, getType] = useEquipStore(
		({ section, sections, getCurB, setCurB, getCurS, setCurS, getType }) => [section(), sections(), getCurB, setCurB, getCurS, setCurS, getType]
	)

	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(build))
		setCurS(getCurS(sect))
	}, [sect, getCurB(build)])

	if (!section) return null
// console.log(333)
	const nhs = { gridTemplateRows: `repeat(${sections.length}, var(--fsz65))` }
	const type = getType(build)
	return (
		<>
			<Nav cls='nav-h-section' cur={sect} data={sections} ph='section' stl={nhs} />
			<Sidebar />
			{type === 'cold' ? <Cold /> : <Info />}
		</>
	)
}
