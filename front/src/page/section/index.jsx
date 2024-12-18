import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import SubHeader from '@cmp/sub_header'
import Outdoor from '@cmp/outdoor'
import Nav from '@cmp/nav'
import Info from './info'
import Sidebar from './sidebar'
import Banner from '@cmp/banner'
import './style.css'
import Warming from './sidebar/warming'
import Cold from './cold'

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
			getType
		]
	)	

	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(build))
		setCurS(getCurS(sect))
	}, [sect, getCurB(build)])

	if (!section || !sections) return null

	const nhs = { gridTemplateRows: `repeat(${sections.length}, var(--fsz65))` }
	const type = getType(build)
	return (
		<main className='build'>
			<SubHeader />
			<Outdoor />
			<Nav cls='nav-h-section' cur={sect} data={sections} ph='section' stl={nhs} />
			<Sidebar />
			{type === 'cold'
				? <Cold/>
				: <Info/>
			}
			<Banner type='section' />
		</main>
	)
}