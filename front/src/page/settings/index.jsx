import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
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
import { ms } from '@src/tool/datetime'
import fnSkip from './skip'

//Настройки склада
export default function Settings({}) {
	const { type, build } = useParams()
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
	const retainTune = useInputStore((s) => s.input?.retain?.[build]?.valve)

	// Изменение и запись настроек
	const setSettingAu = useOutputStore((s) => s.setSettingAu)
	const sendSettingAu = useOutputStore((s) => s.sendSettingAu)
	const hasChangedSettingAu = useOutputStore((s) => s.hasChangedSettingAu)

	// Выбранный продукт
	const prd = useOutputStore((s) => s.prd)
	// Продукт склада
	const curPrd = useInputStore((s) => s.input?.retain?.[build]?.product?.code)
	// Заводские настройки - значения
	const factory = useInputStore((s) => s.input?.factory)
	// Пользовательские настройки - значения
	const retain = useInputStore((s) => s.input?.retain?.[build]?.setting?.[type]?.[prd?.code])

	// Спрятанные настройки
	// Активные коэффициенты
	const coef = useInputStore((s) => s.input.coef?.[build]?.[type])
	// Состояние кнопок свернуть/показать спрятанные настройки
	const hid = useOutputStore((s) => s.hid)
	// skip - настройки которые необходимо скрыть, настройки которые нужно показать
	const skip = fnSkip(prd?.code, factory?.[type], coef, retain, hid)
	// const skip = []
	// const show = []
	const show = fnSkip(prd?.code, factory?.[type], coef, retain, hid, false)
	// Заводские настройки - отфильтрованная рама (с учетом скрытых настроек)
	const fct = useEquipStore((s) => s.getFactory(type, skip, prd?.code, curPrd))
	console.log(33, fct, factory?.[type])

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
		setLink({ action: onDialog, hasChanged: hasChangedSettingAu(build, type) })
		return () => {
			return setLink(null)
		}
	}, [hasChangedSettingAu(build, type)])

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
		show,
		skip,
	}

	let data = rack(o, setSettingAu, sendSettingAu, sendTune, onSwitch)
	// ***************** Стили *****************
	const sumStg = kindList.length + def.length
	const { st, stl, sth, stn } = sty(data, sumStg)

	return (
		<main className='sett' style={st}>
			<SubHead title={data.title} head={data.head} st={sth} dataWarn={data.warn} />
			<List data={data} st={stl} />
			<Nav
				st={stn}
				cur={type}
				dialog={onDialog}
				hasChanged={hasChangedSettingAu(build, type)}
			/>
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
