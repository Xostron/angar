import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '@src/cmp/header'
import def from './def'
import './style.css'
import Nav from './nav'
import RadioIp from './radio_ip'
import { notification } from '@cmp/notification'
import { get } from '@tool/api/service'
import {uri} from '@store/uri';

function Service({ header = false }) {
	const [req_ip, setReqIp] = useState()
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()
	const { type } = useParams()
	const Content = def[type]

	// Обновление IP, MAC, COM-порты
	useEffect(() => {
		setReqIp(uri)
		get('net_info', uri)
			.then((o) => {
				notification.success('IP для запросов установлен на ' + uri)
				setInfo(o.net)
				setTtyS(o.ttyS)
				notification.success('Информация о сети обновлена')
			})
			.catch((e) => {
				notification.error(
					e.message || e.error || 'Ошибка получения информации о сети от : ' + uri,
					{
						errorId: e.id,
					}
				)
				setInfo(null)
				setReqIp('127.0.0.1')
				notification.success('IP для запросов установлен на ' + uri)
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
