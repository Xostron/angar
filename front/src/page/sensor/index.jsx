import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import useOutputStore from '@store/output'
import useWarn from '@store/warn'
import SubHead from './sub_head'
import List from './list'
import Nav from '@cmp/nav'
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
	const [setSens, sendSens, hasChangedSens] = useOutputStore(({ setSens, sendSens, hasChangedSens }) => [
		setSens,
		sendSens,
		hasChangedSens,
	])

	// Окно подтверждения сохранения
	const navigate = useNavigate()
	const warn = useWarn(({ warn }) => warn)
	const { link, setLink } = useWarn(({ link, setLink }) => ({ link, setLink }))
	const obj = {
		type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
		default() {
			navigate(this.path)
		},
		action() {
			sendSens()
			this.default()
		},
		noaction() {
			setSens(null)
			this.default()
		},
	}
	// Обработчик вызова окна
	function onDialog(path) {
		warn({ ...obj, path })
	}
	useEffect(() => {
		setLink({ action: onDialog, hasChanged: hasChangedSens(buildId) })
		return () => {
			return setLink(null)
		}
	}, [hasChangedSens(buildId)])

	// обновление страницы
	useEffect(() => {
		const b = getCurB(buildId)
		setCurB(b)
		const s = getCurS(sect)
		setCurS(s)
	}, [sect, getCurB(buildId)])

	// Список секций
	const s = sections ?? []
	const sec = [{ _id: 'all', name: 'Общие' }, ...s]

	// Склад без оборудования
	if (!build) return null

	// Список датчиков
	let data = []
	if (curS === -1) {
		// Датчики склад - Общие
		const arr = ['outTemp', 'outMois', 'inTemp', 'inMois', 'pin', 'pout']
		arr.forEach((el) => {
			if (build?.[el]?.length) data.push(...build?.[el])
		})
	} else {
		// Датчики секции
		const arr = ['tcnl', 'tprd', 'p', 'co2']
		arr.forEach((el) => {
			if (section?.[el]?.length) data.push(...section?.[el])
		})
		section?.cooler.forEach((clr) => {
			if (clr?.sensor?.length) data.push(...clr?.sensor)
		})
	}

	// Заголовок
	const title = sect === 'all' ? 'Общие' : `Секция ${curS + 1}`
	// Боковая панель
	const nhs = { gridTemplateRows: `repeat(${sec.length}, var(--fsz65))` }

	return (
		<main className='sen'>
			<SubHead title={title} />
			<List data={data} />
			<Nav
				cls='nav-h-sen'
				cur={sect}
				data={sec}
				ph='sensor'
				stl={nhs}
				dialog={onDialog}
				hasChanged={hasChangedSens(buildId)}
			/>
		</main>
	)
}
