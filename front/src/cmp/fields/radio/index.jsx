// radio кнопка
export default function Radio({ value, selected, change, title, name, cls, disabled }) {
	let cl = ['radio', cls]
	cl = cl.join(' ')
	return (
		<label className={cl}>
			<input
				type='radio'
				id={value}
				name={name}
				value={value}
				checked={selected === value}
				onChange={change}
				disabled={disabled}
			/>
			{title}
		</label>
	)
}
