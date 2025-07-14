import { useState } from 'react'
import Control from './control'
import Field from './field'
import './style.css'

//Аваторизация
export default function Entry({ close }) {
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
			<Control login={login} password={password} setShow={close} />
		</div>
	)
}
