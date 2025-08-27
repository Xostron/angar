import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import useWarn from '@store/warn'
import Accordion from '@cmp/accordion'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import Radio from '@cmp/fields/radio'

export default function Equip() {
	const navigate = useNavigate()
	const [ip, setIp] = useState()
	const [req_ip, setReqIp] = useState()
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()
	const [file, setFile] = useState()
	// Модальные окна
	const warn = useWarn((s) => s.warn)
	const clear = useWarn((s) => s.clear)

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
								onSave: () => handleWifiSave(config, req_ip, setInfo),
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
								<span style={{ width: '100px' }}>{el.interface}</span>
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
			{/*  */}
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>
				Управление проектом и оборудованием:
			</span>

			<div className='page-service-row'>
				<Btn
					title='Обновить конфигурацию оборудования по сети'
					onClick={() => onEquip(req_ip)}
				/>
			</div>
			{/*  */}
			<div className='page-service-row'>
				<input
					className='cell input auth-input'
					type='file'
					onChange={(e) => setFile(e.target.files[0])}
				/>
				<Btn title='Обновить конфигурацию из файла' onClick={() => onEquipFile(file)} />
			</div>
			{/*  */}
			<div className='page-service-row'>
				<Btn title='Обновить ПО' onClick={() => onUptSoft(req_ip)} />
				<Btn title='pm2 restart' onClick={() => onPm2(req_ip)} />
				<Btn title='npm install && build' onClick={() => onNpm(req_ip)} />
			</div>
			{/*  */}
			<div className='page-service-row'>
				<Btn title='AutoLogin On' onClick={() => onAL(true, req_ip, warn, clear)} />
				<Btn title='AutoLogin Off' onClick={() => onAL(false, req_ip, warn, clear)} />
				<Btn title='Reboot Устройства' onClick={() => onReboot(req_ip)} />
			</div>
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
				<Btn
					title='Назад'
					onClick={() => {
						navigate('../')
					}}
				/>
			</div>
		</section>
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

// Вызов модального окна для AutoLogin с подтверждением
function onAL(enable, req_ip, warn, clear) {
	const msg = enable ? 'включить' : 'выключить'
	const o = {
		type: 'attention',
		title: `Подтверждение действия`,
		text: `Вы уверены, что хотите ${msg} автоматический вход?`,
	}
	function fnYes() {
		const endpoint = enable ? 'auto_login/true' : 'auto_login/false'
		const successMessage = enable
			? 'Автоматический вход включен'
			: 'Автоматический вход выключен'
		const errorMessage = enable
			? 'Ошибка включения автоматического входа'
			: 'Ошибка выключения автоматического входа'
		get(endpoint, req_ip)
			.then((result) => {
				notification.success(getResponseMessage(result, successMessage))
			})
			.catch((e) => {
				notification.error(e.message || errorMessage, { errorId: e.id })
			})
			.finally(() => {
				clear()
			})
	}
	warn(o, 'warn', fnYes)
}
// Выполнить Reboot устройства
function onReboot(req_ip) {
	get('reboot', req_ip)
		.then((result) => {
			notification.success(getResponseMessage(result, 'Перезагрузка устройств запущена'))
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки устройств', {
				errorId: e.id,
			})
		})
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

// Выполнить обновление конфигурации оборудования через файл
function onEquipFile(file) {
	const formData = new FormData()
	formData.append('file', file)
	post('file', formData)
		.then((o) => {
			notification.success('Конфигурация оборудования установлена: ' + o.message)
		})
		.catch((e) => {
			notification.error(
				e.message || 'Ошибка установки конфигурации оборудования: ' + e.error || e.message,
				{
					errorId: e.id,
				}
			)
		})
}
// Выполнить обновление конфигурации оборудования по сети
function onEquip(req_ip) {
	get('equipment', req_ip)
		.then((o) => {
			notification.success('Конфигурация оборудования обновлена: ' + o.message)
		})
		.catch((e) => {
			notification.error(
				e.message || 'Ошибка обновления конфигурации оборудования: ' + e.error || e.message,
				{
					errorId: e.id,
				}
			)
		})
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

function handleWifiSave(config, req_ip, setInfo) {
	// Валидация IP в конфигурации WiFi
	if (config.ip && !validateIP(config.ip)) {
		notification.warning('Некорректный IP адрес в настройках WiFi')
		return
	}
	post('set_wifi', config, req_ip)
		.then((r) => {
			notification.success('Подключение к WiFi: ' + r.message)
			// Обновляем информацию о сети
			get('net_info', req_ip).then((o) => {
				setInfo(o.net)
			})
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка подключения к WiFi', {
				errorId: e.id,
			})
		})
}

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
