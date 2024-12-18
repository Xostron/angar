import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import Header from '@cmp/header'
import Weather from './weather'
import List from './list'
import './style.css'

const Main = () => {
	const list = useEquipStore(useShallow(({ list }) => list))
	const {name} = list?.[0]?.company ?? {}
	
	return (
		<>
			<Header>
				{name && <span className='header-cmp'>{name ?? ''} </span>}
			</Header>
			<main className='main'>
				<Weather />
				<List list={list}/>
			</main>
		</>
	)
}

export default Main
