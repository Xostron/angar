import Helmet from 'react-helmet'
import useEquipStore from '@store/equipment'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

function Version() {
	const [title, setTitle] = useState('')
	const list = useEquipStore(useShallow(({ list }) => list))
	const [info, setInfo] = useState()
	const { name, code } = list?.[0]?.company ?? {}

	useEffect(() => {
		if (name && code) setTitle(`${code} ${name} `)
	}, [name, code])

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
		<div style={{ position: 'absolute', bottom: '15px', right: '15px', color: 'darkgray' }}>
			<Helmet title={title} />
			<p>server 4.3.0: {process.env.PUBLIC_SOCKET_URI} {info && ' Сеть: '+info.map(el=>`${el.interface}: ${el.ip || el.mac}`).join('')}</p>
		</div>
	)
}
export default Version
