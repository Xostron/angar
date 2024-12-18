import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import Text from '@cmp/fields/text'

import '../style.css'

//Компонент свитч для переключения ВКЛ/Выкл
export default function Switch({ value, setValue, style = {}, cls }) {
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [check, setCheck] = useState(value ?? false)
	useEffect(() => {
		setCheck(value)
	}, [value])
	const onClick = (_) => {
		setCheck(!check)
		setValue(!check)
	}
	const title = check ? 'Вкл' : 'Выкл'

	if (!isAuth) return <Text cls={cls} data={{ value: title }} />
	return (
		<label className='switch' style={style}>
			<input type='checkbox' checked={check} onChange={onClick} />
			<span className='slider'>
				<p>{title}</p>
			</span>
		</label>
	)
}
