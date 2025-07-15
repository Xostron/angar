import { useState } from 'react'
import Control from './control'
import Field from './field'
import './style.css'

//Авторизация
export default function Entry({ data, entryCode }) {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	return (
		<div className='entry'>
			<img src='/img/logo.svg' alt='logo' className='cmp-person-entry-logo' />
			<Field
				login={login}
				password={password}
				setLogin={setLogin}
				setPassword={setPassword}
			/>
			<Control login={login} password={password} />
		</div>
	)
}
