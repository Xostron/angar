import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import Radio from '@cmp/fields/radio'

export default function Soft() {
	const [req_ip, setReqIp] = useState()
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()

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
		<section className='page-service'>
			{/*  */}
			<div className='page-service-row'>
				<span>IP для запросов:</span>
				<Radio
					value='127.0.0.1'
					title='127.0.0.1'
					name='ip'
					selected={req_ip}
					change={() => {
						notification.success('IP для запросов установлен на 127.0.0.1')
						setReqIp('127.0.0.1')
					}}
				/>
				{info?.length > 0 &&
					info
						.filter((el) => el.ip)
						.map((el, i) => {
							return (
								<Radio
									key={i}
									value={el.ip}
									title={el.ip}
									name='ip'
									selected={req_ip}
									change={() => {
										notification.success(
											'IP для запросов установлен на ' + el.ip
										)
										setReqIp(el.ip)
									}}
								/>
							)
						})}
			</div>
			{/*  */}

			{/*  */}
			<div className='page-service-row'>
				<Btn title='Обновить ПО' onClick={() => onUptSoft(req_ip)} />
				<Btn title='pm2 restart' onClick={() => onPm2(req_ip)} />
				<Btn title='npm install && build' onClick={() => onNpm(req_ip)} />
			</div>
			{/*  */}

			{/*  */}
		</section>
	)
}


// Функция для извлечения сообщения из ответа сервера
function getResponseMessage(result, defaultMessage = 'Выполнено') {
	if (typeof result === 'string' && result.trim()) return result
	if (typeof result === 'object' && result?.message) return result.message
	// Если result пустой, undefined, null или пустая строка
	return defaultMessage
}


// Выполнить npm i && build
function onNpm(req_ip) {
	get('build', req_ip)
		.then((result) => {
			notification.success(getResponseMessage(result, 'Сборка проекта запущена'))
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка сборки проекта', {
				errorId: e.id,
			})
		})
}

// Выполнить pm2 restart
function onPm2(req_ip) {
	get('pm2/restart', req_ip)
		.then((result) => {
			notification.success(getResponseMessage(result, 'Перезапуск pm2 запущен'))
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезапуска pm2', {
				errorId: e.id,
			})
		})
}

// Выполнить обновление ПО
function onUptSoft(req_ip) {
	get('upt_soft', req_ip)
		.then((result) => {
			notification.success(getResponseMessage(result, 'Обновление ПО запущено'))
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка обновления ПО', {
				errorId: e.id,
			})
		})
}

