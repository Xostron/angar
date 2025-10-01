import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import def from '@tool/status/section'
import './style.css'

//Элемент навигации по секциям
export default function Item({ data, cur, ph }) {
	const { build: buildId, sect } = useParams()
	const { name, _id } = data
	const refMode = useRef()
	const isAuth = useAuthStore((s) => s.isAuth)
	const setMode = useOutputStore((s) => s.setMode)
	const input = useInputStore((s) => s.input)
	// Режим работы секции (авто - true, ручной - false, выкл - null || undefined)
	const mode = input.retain?.[buildId]?.mode?.[_id]
	const [md, setMd] = useState(mode)

	const txtMode = def.find((el) => el.value === (md ?? undefined))?.titleM ?? 'Выкл'
	// Панель неактивна (Связь с модулями потеряна, либо авария в главном цикле)
	const deactive = Object.keys(input).length ? false : true

	useEffect(() => {
		setMd(mode)
	}, [sect, mode])

	// Окно подтверждения
	const warn = useWarn((s) => s.warn)
	const obj = {
		title: `Режим работы: ${name}`,
		titleM: txtMode,
		clsEntry: 'cmp-warn-mode-mobile-entry',
		fnYes: (value) => set(value),
	}

	const path = cur ? `../${ph}/` + _id : `${ph}/` + _id
	let cls = ['cmp-nav-item-mobile']
	if (cur == _id) cls.push('active')
	cls = cls.join(' ')

	return (
		<Link onClick={onClick} to={path} className={cls}>
			<span ref={refMode}>{txtMode}</span>
			<span>{name}</span>
		</Link>
	)
	// Вызов окна подтверждения с выбором режимов
	function onClick(e) {
		if (e.target !== refMode.current) return
		if (deactive) return
		e.preventDefault()
		isAuth ? warn(obj, 'mode_mobile') : warn('auth', 'warn', () => warn(null, 'person'))
	}
	// Установить режим и передать на сервер по websocket
	function set(value) {
		setMd(value)
		setMode({ buildId, _id, val: value })
	}
}
