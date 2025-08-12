import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useEquipStore from '@store/equipment'
import Header from '@cmp/header'
import Weather from './weather'
import List from './list'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'
import './style.css'

const Main = () => {
	const navigate = useNavigate()
	const [list] = useEquipStore(({ list }) => [list])
	// const [status, setStatus] = useState()
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
				{list?.length > 0 ? (
					<List list={list} />
				) : (
					<div style={{ textAlign: 'center', fontSize: '40px', padding: '100px', cursor: 'pointer' }} onClick={async () => {
						get('equipment').then((o) => {
							console.log('equipment', o)
							notification.info('Конфигурация оборудования получена')
						}).catch((e) => {
							notification.error(e.message || 'Ошибка получения конфигурации оборудования', {
								errorId: e.id
							})
						})
					}}>
						Нет складов
					</div>
				)}
			</main>
		</>
	)
}

export default Main
