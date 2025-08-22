import data from '@src/cmp/menu/data'
import Item from '@src/cmp/menu/item'
import './style.css'

export default function Entry() {
	// return <Menu/>
	return (
		<div className='cmp-warn-def-burger'>
			{data.map((el) => (
				<Item data={el} key={el.id} />
			))}
		</div>
	)
}
