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
		// fnYes: sendSettingAu,
		fnYes: () => {
			console.log(123)
		},
		code: 'idleCold',
		...data
	}
	// const isAuth = useAuthStore((s) => s.isAuth)
	// console.log(33, data)
	// if (!data || !data.list?.length) return null
	// data.value = 'Режим управления'
	// const [show, setShow] = useState(false)

	// if (!isAuth) return <Text data={{ value: data.value }} title={title} />
	// console.log(11,data)
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
