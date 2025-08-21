import Helmet from 'react-helmet'
import useEquipStore from '@store/equipment'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'
import StatusWS from './status_ws'

function Version() {
	const [title, setTitle] = useState('')
	const list = useEquipStore(useShallow(({ list }) => list))
	const [info, setInfo] = useState()
	const { name, code } = list?.[0]?.company ?? {}

	useEffect(() => {
		if (name && code) setTitle(`${code} ${name} `)
	}, [name, code])

	// Запрос у ангар-сервера mac ethernet
	useEffect(() => {
		get('net_info', 'localhost')
			.then((o) => {
				setInfo(o.net)
				notification.success('Сеть обновлена')
			})
			.catch((e) => {
				console.log(e)
			})
	}, [])

	return (
		<div style={stl}>
			<Helmet title={title} />
			<StatusWS />
			server 4.3.0: {process.env.PUBLIC_SOCKET_URI}{' '}
			{info && ' Сеть: ' + info.map((el) => `${el.interface}: ${el.ip || el.mac}`).join('')}
		</div>
	)
}
export default Version

const stl = {
	display: 'flex',
	alignItems: 'center',
	gap: '.3em',
	position: 'absolute',
	bottom: '15px',
	right: '15px',
	color: 'darkgray',
}
