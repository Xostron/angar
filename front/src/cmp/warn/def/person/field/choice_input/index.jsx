import './style.css'
import { useEffect, useState } from 'react'
import Modal from './modal'
const list = [
	{ code: 'admin', name: 'Админ' },
	{ code: 'emp', name: 'Сотрудник' },
	{ code: 'root', name: 'Сервис' },
]
//Поле ввода
export default function ChoiceInput({ value, setValue, style, placeholder, icon, sti, cls, title }) {
	const [val, setVal] = useState(value)
	const [show, setShow] = useState(false)
	// Защита от сброса курсора в конец текста
	useEffect(() => {
		if (val !== value) {
			setVal(value)
		}
	}, [value, val])

	let cl = ['cmp-choice-input', 'cell input', 'auth-input', cls]
	cl = cl.join(' ')

	return (
		<div style={{ ...style }} className={cl}>
			{icon && <img src={icon} />}
			<input
				type='text'
				style={sti}
				placeholder={placeholder}
				value={val}
				onChange={onChange}
				title={title}
			/>
			<img onClick={onClick} className='cmp-choice-input-arrow' src='/img/popup.svg' alt='' />
			<Modal value={value} setValue={setValue} list={list} show={show} setShow={setShow} />
		</div>
	)

	function onChange(e) {
		let v = e.target.value
		setVal(v)
		setValue({ login: v, name: v })
	}
	function onClick(e) {
		setShow(!show)
	}
}


