//Текст с иконкой
export default function Ti({ data, style, cls }) {
	const { value, icon } = data
	let cl = ['cell ti', cls]
	cl = cl.join(' ')

	return (
		<span style={style} className={cl}>
			<img src={icon} />
			{value}
		</span>
	)
}
