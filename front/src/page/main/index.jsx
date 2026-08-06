import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import Header from '@cmp/header'
import Weather from './weather'
import List from './list'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'
import './style.css'

const Main = () => {
	const navigate = useNavigate()
	const [list, remote] = useEquipStore(useShallow(({ list, remote }) => [list, remote]))
	const { name } = list?.[0]?.company ?? {}

	// Автоматический переход на склад (список секций)(если складов == 1)
	useEffect(() => {
		// Складов больше одного или нет ниодного то остаемся на главной
		if ( !list || !list?.length) return
		if ( list?.length > 1 || list?.length === 0) return
		// Склад один но есть доступ к доп складам, то остаемся на главной даже если он один
		if(remote && remote?.length)  return
		// Складов == 1 нет доп доступа
		const path = `/building/${list?.[0]?._id}`.replace('//', '/')
		navigate(path)
	}, [list?.length,  remote?.length])

	return (
		<>
			<Header>{name && <span className='header-cmp'>{name ?? ''} </span>}</Header>
			<main className='main'>
				<Weather />
				{list?.length > 0 || remote?.length > 0 ? (
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
