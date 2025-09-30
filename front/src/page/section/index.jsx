import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import Sidebar from './sidebar'
import Nav from '@cmp/nav'
import DefSection from './def'

//Подробная информация по секции
export default function Sect({}) {
	const { sect, build } = useParams()
	const getCurB = useEquipStore((s) => s.getCurB)
	const getCurS = useEquipStore((s) => s.getCurS)
	const section = useEquipStore((s) => s.section())
	const setCurB = useEquipStore((s) => s.setCurB)
	const setCurS = useEquipStore((s) => s.setCurS)
	const type = useEquipStore((s) => s.getType(build))
	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(build))
		setCurS(getCurS(sect))
	}, [sect, getCurB(build)])

	if (!section) return null
	
	return (
		<>
			<Nav cur={sect}  ph='section' />
			<Sidebar />
			<DefSection type={type} />
		</>
	)
}
