import { useState } from 'react'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import useWarn from '@store/warn'
import Accordion from '@cmp/accordion'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Network({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	const [ip, setIp] = useState()
	// Модальные окна
	const warn = useWarn((s) => s.warn)

	return (
		<>
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>COM/USB</span>
			<Accordion
				title={`Устройства последовательных портов (${ttyS?.length || 0})`}
				defaultOpen={false}
			>
				{ttyS && !ttyS.error ? (
					ttyS.map((el, i) => {
						return (
							<div key={i} className='page-service-row'>
								<span>
									[ {i} ]: {el.raw}
								</span>
							</div>
						)
					})
				) : (
					<div className='page-service-row'>
						<span>Нет доступных устройств</span>
					</div>
				)}
			</Accordion>

			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Настройка сети:</span>
			<div className='page-service-row'>
				<Btn
					title='Ethernet'
					onClick={() =>
						warn(
							{
								cls: 'network-modal',
								onSave: () => handleEthernetSave(config, req_ip, setInfo),
							},
							'ethernet'
						)
					}
				/>
				<Btn
					title='WiFi'
					onClick={() =>
						warn(
							{
								cls: 'network-modal wifi-modal',
								req_ip,
								info,
								// onSave: () => handleWifiSave(config, req_ip, info, setInfo),
							},
							'wifi'
						)
					}
				/>
				<Btn title='Перезагрузка сети' onClick={() => onReloadNet(req_ip)} />
			</div>

			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>
				Настройка IP-адреса для проекта:
			</span>
			<div className='page-service-row'>
				<Input value={ip} setValue={setIp} auth={false} placeholder='192.168.1.100' />
				<Btn title='Установить IP вручную' onClick={() => set_ip(ip)} />
				<div className='page-service-row'>
					<Btn title='Обновить' onClick={() => onNetInfo(req_ip, setInfo, setTtyS)} />
				</div>
			</div>
			<Accordion
				title={`Список сетевых интерфейсов (${info?.length || 0})`}
				defaultOpen={false}
			>
				{info && !info.error ? (
					info.map((el, i) => {
						return (
							<div
								key={i}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '5px',
								}}
							>
								<span style={{ width: '100px' }}>{el.interface} [{el.state}]</span>
								<span style={{ width: '160px' }}>mac: {el.mac || '--'}</span>
								<span style={{ width: '160px' }}>ip: {el.ip || '--'}</span>
								{el.ip ? (
									<Btn
										title={'Установить ' + el.ip}
										onClick={() => set_ip(el.ip)}
									/>
								) : (
									<span style={{ width: '310px' }}></span>
								)}
							</div>
						)
					})
				) : (
					<div className='page-service-row'>
						<span>Нет доступных сетевых интерфейсов</span>
					</div>
				)}
			</Accordion>
		</>
	)
}

// Функция валидации IP-адреса
function validateIP(ip) {
	if (!ip) return false
	const ipRegex =
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	return ipRegex.test(ip) && ip !== '0.0.0.0'
}

function set_ip(ip, req_ip) {
	if (!validateIP(ip)) {
		notification.warning(
			'Некорректный IP адрес. Укажите валидный IP адрес (например: 192.168.1.100)'
		)
		return
	}
	post('set_ip', { ip }, req_ip)
		.then((r) => {
			if (r.success) {
				notification.success(`IP адрес установлен: ${r.message}`)
			} else {
				notification.error(`Ошибка установки IP: ${r.message}`)
			}
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка установки IP адреса', {
				errorId: e.id,
			})
		})
}

// Функция для извлечения сообщения из ответа сервера
function getResponseMessage(result, defaultMessage = 'Выполнено') {
	if (typeof result === 'string' && result.trim()) return result
	if (typeof result === 'object' && result?.message) return result.message
	// Если result пустой, undefined, null или пустая строка
	return defaultMessage
}

// Настройка сети
function handleEthernetSave(config, req_ip, setInfo) {
	// Валидация IP в конфигурации Ethernet
	if (config.ip && !validateIP(config.ip)) {
		notification.warning('Некорректный IP адрес в настройках Ethernet')
		return
	}
	post('set_ethernet', config, req_ip)
		.then((r) => {
			notification.success('Настройки Ethernet сохранены: ' + r.message)
			// Обновляем информацию о сети
			get('net_info', req_ip).then((o) => {
				setInfo(o.net)
			})
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка настройки Ethernet', {
				errorId: e.id,
			})
		})
}

// function handleWifiSave(config, req_ip, setInfo) {
// 	// Валидация IP в конфигурации WiFi
// 	if (config.ip && !validateIP(config.ip)) {
// 		notification.warning('Некорректный IP адрес в настройках WiFi')
// 		return
// 	}
// 	post('set_wifi', config, req_ip)
// 		.then((r) => {
// 			notification.success('Подключение к WiFi: ' + r.message)
// 			// Обновляем информацию о сети
// 			get('net_info', req_ip).then((o) => {
// 				setInfo(o.net)
// 			})
// 		})
// 		.catch((e) => {
// 			notification.error(e.message || 'Ошибка подключения к WiFi', {
// 				errorId: e.id,
// 			})
// 		})
// }

// Перезагрузка сети
function onReloadNet(req_ip) {
	get('reload_net', req_ip)
		.then((result) => {
			notification.success(getResponseMessage(result, 'Перезагрузка сети запущена'))
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки сети', {
				errorId: e.id,
			})
		})
}

// Обновить сеть
function onNetInfo(req_ip, setInfo, setTtyS) {
	get('net_info', req_ip)
		.then((o) => {
			notification.success('Информация о сети обновлена')
			setInfo(o.net)
			setTtyS(o.ttyS)
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка обновления информации о сети', {
				errorId: e.id,
			})
		})
}
