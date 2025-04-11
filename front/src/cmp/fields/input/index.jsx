import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import { validNumber, decimal } from '@tool/number'
import '../style.css'

//Поле ввода
export default function Input({ value, setValue, style, placeholder, icon, sti, type = 'text', min, max, step, cls, disabled = null, title }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const [val, setVal] = useState(value)

	// Защита от сброса курсора в конец текста
	useEffect(() => {
		if (val !== value) {
			setVal(value)
		}
	}, [value, val])

	let cl = ['cell input', cls]
	if (isAuth) cl.push('auth-input')
	cl = cl.join(' ')

	const mini = min ?? -12000
	const maxi = max ?? 12000

	return (
		<div style={{ ...style }} className={cl}>
			{icon && <img src={icon} />}
			<input
				type={type === 'number' ? 'text' : type}
				style={sti}
				min={mini}
				max={maxi}
				step={step}
				placeholder={placeholder}
				value={val}
				onChange={onChange}
				disabled={disabled === null ? !isAuth : disabled}
				title={title}
			/>
		</div>
	)

	function onChange(e) {
		let v = e.target.value
		// Валидация для Number
		if (type === 'number') v = validNumber(e.target.value, mini)
		if (Number.isInteger(step) && +v) v = Math.floor(+v)

		if ((v || v === 0) && mini > +v) return setValue(mini)
		if ((v || v === 0) && maxi < +v) return setVal(maxi)

		if (type === 'number') v = decimal(v, 2)
		
		setVal(v)
		setValue(v)
	}
}
