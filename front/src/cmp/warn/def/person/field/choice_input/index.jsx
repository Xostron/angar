import './style.css'
import { useEffect, useState } from 'react'
import Modal from './modal'
const list = [
	{ code: 'emp', name: 'Сотрудник' },
	{ code: 'admin', name: 'Админ' },
	// { code: 'root', name: 'Сервис' },
]
//Поле ввода
export default function ChoiceInput({ value, setValue, style, placeholder, icon, sti, cls, title, onFocus, onClick }) {
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
				onFocus={onFocus}
				onClick={onClick}
				title={title}
				keyboard={false}
			/>
			<img onClick={toggleModal} className='cmp-choice-input-arrow' src='/img/popup.svg' alt='' />
			<Modal value={value} setValue={setValue} list={list} show={show} setShow={setShow} />
		</div>
	)

	function onChange(e) {
		let v = e.target.value
		setVal(v)
		setValue({ login: v, name: v })
	}
	function toggleModal(e) {
		setShow(!show)
	}
}