import { useEffect } from 'react'
import useSocketStore from '@store/socket'
import { notification } from '@cmp/notification'

export default function StatusWS() {
	const on = useSocketStore((s) => s.on)
	useEffect(() => {
		const date = new Date().toLocaleString('ru-RU')
		notification.info('���������� � ��������: ' + (on ? '��� '+ date	 : '���� '+ date))
	}, [on])
	return (
		<div
			style={{
				width: '.5em',
				height: '.5em',
				borderRadius: '50%',
				backgroundColor: !on ? 'darkgray' : 'lightgreen',
			}}
		></div>
	)
}
