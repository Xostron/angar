import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import Text from '@cmp/fields/text'

import '../style.css'

//Компонент свитч для переключения ВКЛ/Выкл
export default function Switch({ value, setValue, style = {}, cls, title }) {
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [check, setCheck] = useState(value ?? false)
	useEffect(() => {
		setCheck(value)
	}, [value])
	const onClick = (_) => {
		setCheck(!check)
		setValue(!check)
	}
	const txt = check ? 'Вкл' : 'Выкл'

	if (!isAuth) return <Text style={style} cls={cls} data={{ value: txt }} title={title} />
	return (
		<label className='switch' style={style} title={title}>
			<input type='checkbox' checked={check} onChange={onClick} />
			<span className='slider'>
				<p>{txt}</p>
			</span>
		</label>
	)
}
