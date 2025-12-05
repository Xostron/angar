import { useState} from 'react'
import Control from './control'
import Field from './field'
import Keyboard from '@cmp/keyboard'
import './style.css'
import { useReducer } from 'react'
import useEquipStore from '@store/equipment'	

//Авторизация
export default function Entry({ data, entryCode, refDialog }) {
	// Отдельные стейты для каждого поля
	const [form, setForm] = useReducer(reducer, { name: '', login: '', password: '' })

	const [activeKeyboard, setActiveKeyboard] = useState(null) // 'login', 'password', или null
	const apiInfo = useEquipStore((s) => s.apiInfo)
	
	const hideKeyboard = () => {
		setActiveKeyboard(null)
	}

	return (
		<div className='entry'>
			<div className='entry-logo-container'>
				<img src='/img/logo.svg' alt='logo' className='cmp-person-entry-logo' />
				<Field 
					form={form}
					setForm={setForm}
					show= {setActiveKeyboard}
					container={refDialog?.current}
					/>
		<Control form={form} />
			</div>
		
		
	{apiInfo?.keyboard && activeKeyboard === 'login' && (
		<Keyboard 
			value={form.login} 
			onChange={(val)=>{
				console.log()
				setForm({type: 'login', val})
				setForm({type: 'name', val})
			}} 
			container={refDialog?.current}
			onClose={hideKeyboard}
			showInput={true}
		/>
	)}
	{/* {activeKeyboard === 'password' && (
		<Keyboard 
			type='numeric' 
			value={form.password} 
			onChange={(val)=>setForm({type: 'password', val})} 
			container={refDialog?.current}
			onClose={hideKeyboard}
		/>
	)} */}

		</div>
	)
}

/**
 *
 * @param {*} prev Предыдущее состояние
 * @param {*} action Входные данные
 * @returns Текущее состояние
 */
function reducer(prev, action) {
	return { ...prev, [action.type]: action.val }
}