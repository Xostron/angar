import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import Header from '@cmp/header'
import Weather from './weather'
import List from './list'
import './style.css'

const Main = () => {
	const navigate = useNavigate()
	const [list] = useEquipStore(({ list }) => [list])
	const { name } = list?.[0]?.company ?? {}

	// Автоматический переход на склад (список секций)(если складов == 1)
	useEffect(() => {
		// Складов больше одного
		if (list?.length > 1 || list?.length === 0) return
		// Складов == 1
		const path = `/building/${list?.[0]?._id}`.replace('//', '/')
		navigate(path)
	}, [list?.length])

	return (
		<>
			<Header>{name && <span className='header-cmp'>{name ?? ''} </span>}</Header>
			<main className='main'>
				<Weather />
				<List list={list} />
			</main>
		</>
	)
}

export default Main
