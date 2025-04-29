import ItemTemp from './item'
import '../style.css'

export default function RowTemp({  data = [], cls }) {
	let cl = ['cmp-sec-row', cls]
	cl = cl.join(' ')

	return (
		<>
			<div className={cl}>
				{!!data?.length 
					&& data.map((el, idx) => <ItemTemp key={idx} sensId={el?._id} type={el?.type}/>)}
			</div>
		</>
	)
}
