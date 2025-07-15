import Choise from '@cmp/fields/choise'
import defImg from '@tool/icon'

function Line({ name, type, data, setData, list }) {

	const img = defImg?.[type]?.[data]?.img ? <img src={defImg?.[type]?.[data]?.img} /> :null
	const title = defImg?.[type]?.[data]?.title ?? '--'
	return (
		<div className='line'>
			<p>{name}</p>
			<Choise data={data} setData={setData} list={list} />

			<div className='line2'>
				{img}
				<p>{title}</p>
			</div>
		</div>
	)
}

export default Line
