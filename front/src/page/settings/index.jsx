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

//Настройки склада
export default function Settings({}) {
	const { type, build } = useParams()
	const [curB, kindList] = useEquipStore(({ getCurB, getKindList }) => [getCurB(build), getKindList(build)])
	
	// ***************** Калибровка клапанов *****************
	const [bldType, equipSect] = useEquipStore(({ bldType, list }) => [list?.[curB]?.type, list?.[curB]?.section])
	const retainTune = useInputStore(({ input }) => input?.retain?.[build]?.valve)

	// Изменение и запись настроек
	const [setTune, tune, sendTune, setSettingAu, sendSettingAu, hasChangedSettingAu, prd] = useOutputStore(
		({ setTune, tune, sendTune, setSettingAu, sendSettingAu, hasChangedSettingAu, prd }) => [
			setTune,
			tune,
			sendTune,
			setSettingAu,
			sendSettingAu,
			hasChangedSettingAu,
			prd,
		]
	)
	// Заводские настройки - рама
	const [fct] = useEquipStore(({ getFactory }) => [getFactory(type)])

	// Окно подтверждения сохранения
	const navigate = useNavigate()
	const warn = useWarn(({ warn }) => warn)
	const { setLink } = useWarn()

	const obj = {
		type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
		default() {
			navigate(this.path)
		},
		action() {
			sendSettingAu()
			this.default()
		},
		noaction() {
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
	const data = rack(
		fct,
		bldType,
		type,
		build,
		setSettingAu,
		sendSettingAu,
		equipSect,
		retainTune,
		tune,
		sendTune,
		onSwitch,
		prd
	)
	// ***************** Стили *****************
	const sumStg = kindList.length + def.length
	const { st, stl, sth, stn } = sty(data, sumStg)

	return (
		<main className='sett' style={st}>
			<SubHead title={data.title} head={data.head} st={sth} warn={data.warn} />
			<List data={data} st={stl} />
			<Nav st={stn} cur={type} dialog={onDialog} hasChanged={hasChangedSettingAu(build, type)} />
		</main>
	)

	// Обработчик вызова окна
	function onDialog(path) {
		warn({ ...obj, path })
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
