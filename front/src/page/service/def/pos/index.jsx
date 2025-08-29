import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Equip({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	// Модальные окна
	const warn = useWarn((s) => s.warn)
	const clear = useWarn((s) => s.clear)

	return (
		<>
			{/*  */}
			{/* <div className='page-service-row'>
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
			</div> */}

			{/*  */}
			<div className='page-service-row'>
				<Btn title='AutoLogin On' onClick={() => onAL(true, req_ip, warn, clear)} />
				<Btn title='AutoLogin Off' onClick={() => onAL(false, req_ip, warn, clear)} />
				<Btn title='Reboot Устройства' onClick={() => onReboot(req_ip)} />
			</div>
		</>
	)
}

// Функция валидации IP-адреса
// function validateIP(ip) {
// 	if (!ip) return false
// 	const ipRegex =
// 		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
// 	return ipRegex.test(ip) && ip !== '0.0.0.0'
// }

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
