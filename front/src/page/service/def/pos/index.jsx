import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Equip({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	// Модальные окна
	const warn = useWarn((s) => s.warn)
	const clear = useWarn((s) => s.clear)

	return (
		<>
			<div className='page-service-row'>
				{/* <Btn title='AutoLogin On' onClick={() => onAL(true, req_ip, warn, clear)} /> */}
				{/* <Btn title='AutoLogin Off' onClick={() => onAL(false, req_ip, warn, clear)} /> */}
				<Btn title='Reboot Устройства' onClick={() => onReboot(req_ip)} />
			</div>
			<div className='page-service-row'>
				<Btn title='Установить дату и время ' onClick={() => onSetDateTime(req_ip, warn, clear)} />
				<Btn title='Синхронизировать дату и время (Интернет!)' onClick={() => syncTime(req_ip)} />
			</div>
		</>
	)
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
				notification.success("AutoLogin действие выполнено")
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
			notification.success('Перезагрузка устройств запущена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки устройств', {
				errorId: e.id,
			})
		})
}

function syncTime(req_ip) {
	get('sync_time', req_ip)
		.then((result) => {
			notification.success('Синхронизация времени завершена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка синхронизации времени', {
				errorId: e.id,
			})
		})
}

// Открыть модальное окно для установки даты и времени
function onSetDateTime(req_ip, warn, clear) {
	const o = {
		type: 'datetime',
		title: 'Установка даты и времени',
		onSave: (formattedDateTime) => {
			// Отправляем запрос на сервер
			post('set_time', { dt: formattedDateTime }, req_ip)
				.then((result) => {
					notification.success('Время и дата успешно установлены')
				})
				.catch((e) => {
					notification.error(e.message || 'Ошибка установки времени и даты', {
						errorId: e.id,
					})
				})
				.finally(() => {
					clear()
				})
		},
	}
	warn(o, 'datetime')
}