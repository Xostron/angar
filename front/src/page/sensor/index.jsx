import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import useOutputStore from '@store/output'
import useWarn from '@store/warn'
import SubHead from './sub_head'
import List from './list'
import Nav from '@cmp/nav'
import { sensList } from './fn'
import './style.css'

//Информация по датчикам склада
export default function Sensor({}) {
	const { build: buildId, sect } = useParams()
	const section = useEquipStore((s) => s.section())
	const sections = useEquipStore((s) => s.sections())
	const build = useEquipStore((s) => s.build())
	const curS = useEquipStore((s) => s.build())
	const getCurB = useEquipStore((s) => s.getCurB)
	const setCurB = useEquipStore((s) => s.setCurB)
	const getCurS = useEquipStore((s) => s.getCurS)
	const setCurS = useEquipStore((s) => s.setCurS)
	const setSens = useOutputStore((s) => s.setSens)
	const sendSens = useOutputStore((s) => s.sendSens)
	const hasChangedSens = useOutputStore((s) => s.hasChangedSens)
	// Окно подтверждения сохранения
	const navigate = useNavigate()
	const setLink = useWarn((s) => s.setLink)
	const warn = useWarn((s) => s.warn)
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
		warn({ ...obj, path }, 'warn')
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
	// Склад без оборудования
	if (!build) return null
	// Список датчиков из рамы
	const data = sensList(build, section, sections, sect)
	// Заголовок
	const title = sect === 'all' ? 'Общие' : sect === 'pui' ? 'Сеть' : `Секция ${curS + 1}`

	return (
		<main className='sen'>
			<SubHead title={title} type={sect} />
			<List data={data} type={sect} />
			<Nav
				cls='nav-h-sen'
				cur={sect}
				//data={sec}
				ph='sensor'
				dialog={onDialog}
				hasChanged={hasChangedSens(buildId)}
			/>
		</main>
	)
}
