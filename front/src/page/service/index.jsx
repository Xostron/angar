import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Header from '@src/cmp/header'
import def from './def'
import './style.css'
import Nav from './nav'
import RadioIp from './radio_ip'
import { notification } from '@cmp/notification'
import { get } from '@tool/api/service'

function Service({ header = false }) {
	const [req_ip, setReqIp] = useState()
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()
	const { type } = useParams()
	const Content = def[type]

	// Обновление IP, MAC, COM-порты
	useEffect(() => {
		let api = process.env.PUBLIC_LOCAL_API || process.env.PUBLIC_API || '127.0.0.1'
		api = api.replace('http://', '').replace('https://', '').replace(':4000/api/', '')
		setReqIp(api)
		get('net_info', api)
			.then((o) => {
				notification.success('IP для запросов установлен на ' + api)
				setInfo(o.net)
				setTtyS(o.ttyS)
				notification.success('Информация о сети обновлена')
			})
			.catch((e) => {
				notification.error(
					e.message || e.error || 'Ошибка получения информации о сети от : ' + api,
					{
						errorId: e.id,
					}
				)
				setReqIp('127.0.0.1')
				notification.success('IP для запросов установлен на ' + api)
			})
	}, [])

	return (
		<>
			{header && <Header />}
			<main className='page-service-main'>
				<section className='page-service'>
					{type !== 'journal' && (
						<RadioIp props={{ req_ip, setReqIp, info, setInfo, ttyS, setTtyS }} />
					)}
					{Content && (
						<Content props={{ req_ip, setReqIp, info, setInfo, ttyS, setTtyS }} />
					)}
				</section>
				<Nav />
			</main>
		</>
	)
}

export default Service
