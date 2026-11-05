import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import '../style.css'
import Text from '@cmp/fields/text'

//Выпадающий список
export default function More({ data, style, title }) {
	// При переключении по навигации настроек
	const warn = useWarn((s) => s.warn)

	const obj = {
		text: `Сохранить настройки?`,
		fnYes: data.sendSettingAu,
		...data,
	}
	return (
		<button style={style} className='cell more' onClick={onDialog} title={title}>
			<p className='val'>{data.value} </p>
			<img width='18px' src='/img/arrow-right.svg' />
		</button>
	)

	function onDialog() {
		warn(obj, 'idle')
	}
}
