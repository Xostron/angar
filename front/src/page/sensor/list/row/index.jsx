import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Text from '@cmp/fields/text'
import Input from '@cmp/fields/input'
import IconText from '@cmp/fields/icon_text'
import Switch from '@cmp/fields/switch'
import useInputStore from '@store/input'
import useOutputStore from '@store/output'
import defUn from '@tool/unit'
import defImg from '@tool/icon'

const t = ['tout', 'tin', 'tprd', 'tcnl', 'tweather']
const m = ['hin', 'hout', 'hweather']

export default function Row({ data }) {
	const { build } = useParams()
	// сохранить настройки на сервере ангара
	const [setSens, sens] = useOutputStore(({ setSens, sens }) => [setSens, sens])
	// настройка датчика
	const [getRaw, setting, input] = useInputStore(({ getRaw, input }) => [getRaw, input?.retain?.[build], input])
	const el = ['tweather', 'hweather'].includes(data?.type) ? data?.type : data?._id
	// Датчик вкл/выкл
	const onn = setting?.[el]?.on === undefined ? true : setting?.[el]?.on ? true : false
	const [on, setOn] = useState(onn)

	// Коррекция датчика
	const [corr, setCorr] = useState(setting?.[el]?.corr ?? 0)

	// Истинное значение датчика
	const raw = input?.[el]?.raw
	const r = getRaw(el)

	// Значение датчика с коррекцией
	const result = input?.[el]?.value

	// Обработка коррекции и вкл/выкл датчика
	useEffect(() => {
		setCorr(setting?.[el]?.corr ?? 0)
		setOn(onn)
	}, [el])

	// Ед. измерения, иконка
	let unit = defUn['p']
	let ico = defImg['pressure'].on
	if (t.includes(data.type)) {
		unit = defUn['temp']
		ico = defImg['temp'].on
	}
	if (m.includes(data.type)) {
		unit = defUn['mois']
		ico = defImg['mois'].on
	}

	//Подсветка - Измененные данные
	const chg = !!sens?.[build]?.[el]?.corr
	let clCorr = ['cell-w']
	if (chg) clCorr.push('changed')

	// ошибка датчика
	let cls = ['cell-w']
	if (r === null) cls.push('error')
	cls = cls.join(' ')
	// датчик выключен
	let cl = ['cell-w']
	if (!on) {
		cl.push('error')
		clCorr.push('error')
	}
	cl = cl.join(' ')
	clCorr = clCorr.join(' ')

	return (
		<>
			<IconText cls={cl} data={{ value: data.name, icon: ico }} />
			<Switch cls={cl} value={on} setValue={actOn} style={{ border: 'none' }} />
			<Input cls={clCorr} type='number' min={-1000} max={1000} step={0.1} value={corr} setValue={actCorr} placeholder={0} />
			<Text cls={cls} data={{ value: raw }} />
			<Text cls={cls} data={{ value: result }} />
			<Text cls={cl} data={{ value: unit }} />
		</>
	)
	// Вкл/выкл датчик
	function actOn(val) {
		setOn(val)
		setSens({ build, _id: el, on: val })
	}
	// Поле "Коррекция"
	function actCorr(val) {
		setCorr(val)
		setSens({ build, _id: el, corr: val })
	}
}
