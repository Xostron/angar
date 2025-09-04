import { useState } from 'react'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'
import onLogin from './fn'

//Кнопки войти и отмена
export default function Control({ form }) {
	const { clear } = useWarn(({ clear }) => ({ clear }))
	return (
		<div className='entry-control'>
			<Btn title={'Войти'} icon={'/img/entry.svg'} onClick={(_) => onLogin(form, clear)} />
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={(_) => clear()} />
		</div>
	)
}
