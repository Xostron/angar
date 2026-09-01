//Просто текст
export default function Text({ data, style, cls, title }) {
	if (Number.isNaN(data.value)) return
	let cl = ['cell', cls]
	cl = cl.join(' ')

	return (
		<span style={style} className={cl} title={title}>
			{data.value}
		</span>
	)
}
