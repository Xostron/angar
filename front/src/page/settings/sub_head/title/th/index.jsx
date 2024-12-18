

//Шапка таблицы
export default function Th({head}) {
	return (
		<>
		{head.map((el, i) => <p key={i} style={{gridArea: `1/${2+i}/2/${3+i}`, textAlign: 'center'}} className="th">{el}</p>)}
		</>
	)
}