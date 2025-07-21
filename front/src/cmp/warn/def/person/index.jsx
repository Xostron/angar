import { useReducer } from 'react'
import Control from './control'
import Field from './field'
import './style.css'

//Авторизация
export default function Entry({ data, entryCode }) {
	const [form, setForm] = useReducer(reducer, { login: '', password: '' })
	return (
		<div className='entry'>
			<img src='/img/logo.svg' alt='logo' className='cmp-person-entry-logo' />
			<Field dispatch={setForm} form={form} />
			<Control form={form} />
		</div>
	)
}

/**
 *
 * @param {*} state Предыдущее состояние
 * @param {*} action Входные данные
 * @returns Текущее состояние
 */
function reducer(prev, action) {
	return { ...prev, [action.type]: action.val }
}
