import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import useOutputStore from '@store/output'
import useWarn from '@store/warn'
import SubHead from './sub_head'
import List from './list'
import Nav from '@cmp/nav'
import {navList, sensList} from './fn'
import './style.css'

//Информация по датчикам склада
export default function Sensor({}) {
	const { build: buildId, sect } = useParams()
	const [section, sections, build, curS, getCurB, setCurB, getCurS, setCurS] = useEquipStore(
		({ section, sections, build, curS, getCurB, setCurB, getCurS, setCurS }) => [
			section(),
			sections(),
			build(),
			curS,
			getCurB,
			setCurB,
			getCurS,
			setCurS,
		]
	)
	const [setSens, sendSens, hasChangedSens] = useOutputStore(({ setSens, sendSens, hasChangedSens }) => [setSens, sendSens, hasChangedSens])

	// Окно подтверждения сохранения
	const navigate = useNavigate()
	const { link, setLink, warnCustom } = useWarn(({ link, setLink,warnCustom }) => ({ link, setLink,warnCustom }))
	const obj = {
		type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
		default() {
			navigate(this.path)
		},
		fnYes() {
			sendSens()
			this.default()
		},
		fnNo() {
			setSens(null)
			this.default()
		},
	}

	// Обработчик вызова окна
	function onDialog(path) {
		warnCustom({ ...obj, path })
	}

	// Окно подтверждения
	useEffect(() => {
		setLink({ action: onDialog, hasChanged: hasChangedSens(buildId) })
		return () => setLink(null)
	}, [hasChangedSens(buildId)])

	// обновление страницы
	useEffect(() => {
		setCurB(getCurB(buildId))
		setCurS(getCurS(sect))
	}, [sect, getCurB(buildId)])

	// Список элементов навигации
	const sec = navList(sections)

	// Склад без оборудования
	if (!build) return null

	// Список датчиков из рамы
	const data = sensList(build, section, sections, sect)

	// Заголовок
	const title = sect === 'all' ? 'Общие' : sect === 'pui' ? 'Сеть' : `Секция ${curS + 1}`
	// Боковая панель
	const nhs = { gridTemplateRows: `repeat(${sec.length}, var(--fsz65))` }
	// Стили

	return (
		<main className='sen' >
			<SubHead title={title} type={sect}/>
			<List data={data} type={sect}/>
			<Nav cls='nav-h-sen' cur={sect} data={sec} ph='sensor' stl={nhs} dialog={onDialog} hasChanged={hasChangedSens(buildId)} />
		</main>
	)
}


