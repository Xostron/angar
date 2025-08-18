import Helmet from 'react-helmet'
import useEquipStore from '@store/equipment'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

function Version() {
	const [title, setTitle] = useState('')
	const list = useEquipStore(useShallow(({ list }) => list))

	const { name, code } = list?.[0]?.company ?? {}

	useEffect(() => {
		if (name && code) setTitle(`${code} ${name} `)
	}, [name, code])

	useEffect(() => {
		console.log('555')
		get('net_info', api)
			.then((o) => {
				setInfo(o.net)
				setTtyS(o.ttyS)
				notification.success('Информация о сети обновлена')
			})
			.catch((e) => {
				setReqIp('127.0.0.1')
				notification.error(e.message || e.error || 'Ошибка получения информации о сети', {
					errorId: e.id,
				})
			})
	}, [])

	return (
		<div style={{ position: 'absolute', bottom: '15px', right: '15px', color: 'darkgray' }}>
			<Helmet title={title} />
			<p>server 4.2.0: {process.env.PUBLIC_SOCKET_URI}</p>
		</div>
	)
}
export default Version
