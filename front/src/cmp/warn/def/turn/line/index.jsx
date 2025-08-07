import Choise from '@cmp/fields/choise'
import defImg from '@tool/icon'


function Line({ bType, am, actAutomode, aAm, pr, actProduct, aProd }) {
	return bType != 'cold' ? (
		<span className='line3'>
			<Dropdown name='' type='automode' data={am} setData={actAutomode} list={aAm} />
			<Dropdown name='' type='product' data={pr} setData={actProduct} list={aProd} />
		</span>
	) : (
		<span className='line3'>
			<Dropdown name='' type='product' data={pr} setData={actProduct} list={aProd} />
		</span>
	)
}


function Dropdown({ name, type, data, setData, list }) {
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
