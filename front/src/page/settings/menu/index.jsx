import List from './list'
import SubHead from './sub_head'
import './style.css'

//Список настроек склада
export default function Menu({}) {
	return (
		<main className='setting-menu'>
			<SubHead change={true} />
			<List />
		</main>
	)
}
