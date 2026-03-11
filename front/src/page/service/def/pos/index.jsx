import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Pos() {
	const warn = useWarn((s) => s.warn)
	const clear = useWarn((s) => s.clear)

	return (
		<>
			<div className='page-service-row'>
				{/* <Btn title='AutoLogin On' onClick={() => onAL(true, warn, clear)} /> */}
				{/* <Btn title='AutoLogin Off' onClick={() => onAL(false, warn, clear)} /> */}
				<Btn title='Reboot Устройства' onClick={() => onReboot()} />
			</div>
			<div className='page-service-row'>
				<Btn title='Установить дату и время ' onClick={() => onSetDateTime(warn, clear)} />
				<Btn title='Синхронизировать дату и время (Интернет!)' onClick={() => syncTime()} />
			</div>
		</>
	)
}

// function onAL(enable, warn, clear) {
// 	const msg = enable ? 'включить' : 'выключить'
// 	const o = {
// 		type: 'attention',
// 		title: `Подтверждение действия`,
// 		text: `Вы уверены, что хотите ${msg} автоматический вход?`,
// 	}
// 	function fnYes() {
// 		const endpoint = enable ? 'auto_login/true' : 'auto_login/false'
// 		const errorMessage = enable
// 			? 'Ошибка включения автоматического входа'
// 			: 'Ошибка выключения автоматического входа'
// 		get(endpoint)
// 			.then((result) => {
// 				notification.success("AutoLogin действие выполнено")
// 			})
// 			.catch((e) => {
// 				notification.error(e.message || errorMessage, { errorId: e.id })
// 			})
// 			.finally(() => {
// 				clear()
// 			})
// 	}
// 	warn(o, 'warn', fnYes)
// }

function onReboot() {
	get('reboot')
		.then((result) => {
			notification.success('Перезагрузка устройств запущена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки устройств', {
				errorId: e.id,
			})
		})
}

function syncTime() {
	get('sync_time')
		.then((result) => {
			notification.success('Синхронизация времени завершена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка синхронизации времени', {
				errorId: e.id,
			})
		})
}

function onSetDateTime(warn, clear) {
	const o = {
		type: 'datetime',
		title: 'Установка даты и времени',
		onSave: (formattedDateTime) => {
			post('set_time', { dt: formattedDateTime })
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
