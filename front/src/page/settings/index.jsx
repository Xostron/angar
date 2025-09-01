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

//Настройки склада
export default function Settings({}) {
	const { type, build } = useParams()
	const curB = useEquipStore((s) => s.getCurB(build))
	const kindList = useEquipStore((s) => s.getKindList(build))

	// ***************** Калибровка клапанов *****************
	const bldType = useEquipStore((s) => s.list?.[curB]?.type)
	const equipSect = useEquipStore((s) => s.list?.[curB]?.section)

	// Изменение и запись настроек
	const setTune = useOutputStore((s) => s.setTune)
	const tune = useOutputStore((s) => s.tune)
	const sendTune = useOutputStore((s) => s.sendTune)
	const setSettingAu = useOutputStore((s) => s.setSettingAu)
	const sendSettingAu = useOutputStore((s) => s.sendSettingAu)
	const hasChangedSettingAu = useOutputStore((s) => s.hasChangedSettingAu)
	const prd = useOutputStore((s) => s.prd)
	const hid = useOutputStore((s) => s.hid?.[`${type}.text-collapse`]?.hid ?? true)

	const retainTune = useInputStore((s) => s.input?.retain?.[build]?.valve)
	const coef = useInputStore((s) => s.input.coef?.[build]?.[type])
	const factory = useInputStore((s) => s.input?.factory)
	const retain = useInputStore((s) => s.input?.retain?.[build]?.setting?.[type]?.[prd?.code])
	const curPrd = useInputStore((s) => s.input?.retain?.[build]?.product?.code)

	// Спрятанные настройки
	const skip = fnSkip(prd, factory?.[type], coef, retain)
	const show = fnAct(prd, factory?.[type], coef, retain)
	// Заводские настройки - рама
	const fct = useEquipStore((s) => s.getFactory(type, hid, skip, prd?.code, curPrd))

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
		hid,
		prd: prd?.code,
		curPrd,
		show,
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

// Спрятанные настройки
function fnSkip(prd, factory, coef, retain) {
	let o = prd?.code ? factory?.[prd?.code] ?? factory : null
	let cf = coef ? Object.keys(coef) : null
	return coef && o
		? Object?.entries(o).reduce((acc, [code, val]) => {
				const nv = retain?.[code] ?? {}
				let o = {}
				if (!isNaN(val[cf?.[0]]) && (!isNaN(val[cf?.[1]]) || !!val[cf?.[1]])) {
					o = { ...val, ...nv }
					const one = o[cf?.[0]] != coef[cf?.[0]]
					let two
					if (`${o[cf?.[1]]}`.includes(':')) two = ms(o[cf?.[1]]) != coef[cf?.[1]]
					else two = o[cf?.[1]] != coef[cf?.[1]]
					if ((one && two) || one != two) acc.push(code)
				}
				return acc
		  }, [])
		: null
}

// Активная настройка
function fnAct(prd, factory, coef, retain) {
	let o = prd?.code ? factory?.[prd?.code] ?? factory : null
	let cf = coef ? Object.keys(coef) : null
	return coef && o
		? Object.entries(o).reduce((acc, [code, val]) => {
				const nv = retain?.[code] ?? {}
				let o = {}
				if (!isNaN(val[cf?.[0]]) && (!isNaN(val[cf?.[1]]) || !!val[cf?.[1]])) {
					o = { ...val, ...nv }
					// Для времени ожидания (CO2)
					let time
					if (`${o[cf?.[1]]}`.includes(':')) time = ms(o[cf?.[1]])
					console.log(444, o[cf?.[0]], coef[cf?.[0]], o[cf?.[1]], time, coef[cf?.[1]])

					if (
						o[cf?.[0]] == coef[cf?.[0]] &&
						(o[cf?.[1]] == coef[cf?.[1]] || time === coef[cf?.[1]])
					)
						acc.push(code)
				}
				return acc
		  }, [])
		: null
}
