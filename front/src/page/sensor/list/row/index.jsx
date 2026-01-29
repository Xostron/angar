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

const t = ['tout', 'tin', 'tprd', 'tcnl', 'tweather', 'cooler']
const m = ['hin', 'hout', 'hweather', 'co2']

export default function Row({ data }) {
	const { build } = useParams()
	// сохранить настройки на сервере ангара
	const [setSens, sens] = useOutputStore(({ setSens, sens }) => [setSens, sens])
	// настройка датчика
	const [getSens, setting, input] = useInputStore(({ getSens, input }) => [
		getSens,
		input?.retain?.[build],
		input,
	])
	const el = ['tweather', 'hweather'].includes(data?.type) ? data?.type : data?._id
	// Датчик вкл/выкл
	const onn = setting?.[el]?.on === undefined ? true : setting?.[el]?.on ? true : false
	const [on, setOn] = useState(onn)
	// Коррекция датчика
	const [corr, setCorr] = useState(setting?.[el]?.corr ?? 0)
	// Истинное значение датчика
	// Значение датчика с коррекцией
	let raw, result
	if (['tweather', 'hweather'].includes(data?.type)) {
		raw = input?.[build]?.[el]?.raw
		result = input?.[build]?.[el]?.value
	} else {
		raw = getSens(el)?.raw
		result = getSens(el)?.value
	}

	// Обработка коррекции и вкл/выкл датчика
	useEffect(() => {
		setCorr(setting?.[el]?.corr ?? 0)
		setOn(onn)
	}, [el])
	const { unit, ico } = fnUnit(data)
	const { cl, cls, clCorr } = fnStyle(sens?.[build]?.[el]?.corr, raw, on)
	return (
		<>
			<IconText cls={cl} data={{ value: data.name, icon: ico }} />
			<Switch cls={cl} value={on} setValue={actOn} style={{ border: 'none' }} />
			<Input
				cls={clCorr}
				type='number'
				min={-1000}
				max={1000}
				step={0.1}
				value={corr}
				setValue={actCorr}
				placeholder={0}
			/>
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

/**
 * Стиль строки
 * @param {number} corr коррекция датчика (из state на отправление формы)
 * @param {number} raw Истинное значение датчика
 * @param {boolean} on вкл/выкл датчик
 * @returns {object} { cl, cls, clCorr } стили
 */
function fnStyle(corr, raw, on) {
	//Подсветка - Измененные данные
	let clCorr = ['cell-w']
	if (!!corr) clCorr.push('changed')
	// ошибка датчика
	let cls = ['cell-w']
	if (raw === null) cls.push('error')
	// датчик выключен
	let cl = ['cell-w']
	if (!on) {
		cl.push('error')
		clCorr.push('error')
	}
	cl = cl.join(' ')
	cls = cls.join(' ')
	clCorr = clCorr.join(' ')
	return { cl, cls, clCorr }
}

/**
 * Иконки
 * @param {object} data скелет датчика
 * @returns {object} {unit, ico} иконки
 */
function fnUnit(data) {
	// Ед. измерения, иконка
	let unit = defUn['p']
	let ico = defImg['pressure'].on
	// Ток двигателя
	if (['fan'].includes(data.type)) {
		unit = defUn['ampere']
		ico = defImg['pui'].current
	}

	if (['pin', 'pout'].includes(data.type)) {
		unit = defUn['bar']
	}
	if (t.includes(data.type)) {
		unit = defUn['temp']
		ico = defImg['temp'].on
	}
	if (m.includes(data.type)) {
		unit = defUn['mois']
		ico = defImg['mois'].on
	}
	return { unit, ico }
}
