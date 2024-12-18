


//Элемент выпадающего списка
export default function Item({data, setVal, val}) {
	const st = val === data.title ? {backgroundColor: 'var(--surface)'} : {}
	return (
		<button onClick={_ => setVal(data.code)} style={st}>
			{data.title}
		</button>
	)
}