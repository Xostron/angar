import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import List from './list'
import Menu from './menu'
import Nav from './nav'
import './style.css'
import SubHead from './sub_head'
import { rack, sty } from './fn'
import def from './def'

//Настройки склада
export default function Settings({}) {
	const { type, build } = useParams()
	// EquipStore - Рама
	// Склад
	const curB = useEquipStore((s) => s.getCurB(build))
	// Меню настроек
	const kindList = useEquipStore((s) => s.getKindList(build))

	// ***************** Калибровка клапанов *****************
	const bldType = useEquipStore((s) => s.list?.[curB]?.type)
	// Рама секции + оборудование секции
	const equipSect = useEquipStore((s) => s.list?.[curB]?.section)
	const setTune = useOutputStore((s) => s.setTune)
	const tune = useOutputStore((s) => s.tune)
	const sendTune = useOutputStore((s) => s.sendTune)
	// Пользовательские значения калибровки
	const retainTune = useInputStore((s) => s.input?.retain?.[build]?.valve)

	// Изменение, запись настроек, было ли изменение(для подсветки измененных значений)
	const setSettingAu = useOutputStore((s) => s.setSettingAu)
	const sendSettingAu = useOutputStore((s) => s.sendSettingAu)
	const hasChanged = useOutputStore((s) => s.hasChangedSettingAu(build, type))

	// Выбранный продукт, чьи настройки хотят посмотреть
	const prd = useOutputStore((s) => s.prd)
	// Продукт склада
	const curPrd = useInputStore((s) => s.input?.retain?.[build]?.product?.code)

	// ***************** Спрятанные настройки *****************
	// skip - настройки которые необходимо скрыть, настройки которые нужно показать
	const skip = useOutputStore((s) => s.getSkip(build, type))
	// Заводские настройки - Рама
	const fct = useEquipStore((s) => s.getFactory(skip, type, prd?.code, curPrd))
	// Окно подтверждения сохранения
	const navigate = useNavigate()
	// При переключении по навигации
	const setLink = useWarn((s) => s.setLink)
	// При переключении по навигации настроек
	const warn = useWarn((s) => s.warn)

	const obj = {
		type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
		default() {
			navigate(this.path)
		},
		fnYes() {
			sendSettingAu()
			this.default()
		},
		fnNo() {
			setSettingAu(null)
			this.default()
		},
	}

	useEffect(() => {
		setLink({ action: onDialog, hasChanged: hasChanged })
		return () => setLink(null)
	}, [hasChanged])

	// ***************** Экран - Меню *****************
	if (type === 'menu') return <Menu />

	// ***************** Экраны - Настроек *****************
	const o = {
		fct,
		bldType,
		type,
		build,
		equipSect,
		retainTune,
		tune,
		prd: prd?.code,
		curPrd,
	}

	let data = rack(o, setSettingAu, sendSettingAu, sendTune, onSwitch)
	// ***************** Стили *****************
	const sumStg = kindList.length + def.length
	const { st, stl, sth, stn } = sty(data, sumStg)

	return (
		<main className='sett' style={st}>
			<SubHead title={data.title} head={data.head} st={sth} dataWarn={data.warn} />
			<List data={data} st={stl} />
			<Nav st={stn} cur={type} dialog={onDialog} hasChanged={hasChanged} />
		</main>
	)

	// Вызов окна подтверждения
	function onDialog(path) {
		warn({ ...obj, path }, 'warn')
	}
	// Вкл/выкл калибровку клапанов - Обработчик Switch
	function onSwitch(vlv, val) {
		if (!val) {
			setTune({ ...vlv, _stage: null })
			return
		}
		setTune({ ...vlv, _stage: 'begin', _build: build })
	}
}
