//Просто текст
export default function Text({ data, style, cls }) {
	if (Number.isNaN(data.value)) return
	let cl = ['cell', cls]
	cl = cl.join(' ')

	return (
		<span style={style} className={cl}>
			{data.value}
		</span>
	)
}
