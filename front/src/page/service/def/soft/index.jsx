import Btn from '@cmp/fields/btn'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Soft({ props }) {
	const { req_ip } = props
	return (
		<>
			<div className='page-service-row'>Первоначальная настройка. Обновить - Пересобрать - Сохранить (! Не забудь настроить сначала ip) </div>
			<div className='page-service-row'>
				<Btn title='1. Обновить ПО' onClick={() => onUptSoft(req_ip)} />
				<Btn title='2. npm install && build' onClick={() => onNpm(req_ip)} />
				<Btn title='3. pm2 save (Сохранить)' onClick={() => onPm2(req_ip,'save')} />
			</div>
			<div className='page-service-row'>Дополнительное управление PM2 (Внутренний сервер).</div>
			<div className='page-service-row'>
				{/* <Btn title='Запуск' onClick={() => onPm2(req_ip, 'start')} /> */}
				{/* <Btn title='Остновка' onClick={() => onPm2(req_ip, 'stop')} /> */}
				<Btn title='Перезапуск' onClick={() => onPm2(req_ip, 'restart')} />
				<Btn title='Очистка логов' onClick={() => onPm2(req_ip, 'flush')} />
			</div>
		</>
	)
}

// Выполнить npm i && build
function onNpm(req_ip) {
	get('build', req_ip)
		.then((result) => {
			notification.success('Сборка проекта запущена подождите 10-20 секунд')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка сборки проекта', {
				errorId: e.id,
			})
		})
}

// Выполнить pm2 restart
function onPm2(req_ip, cmd='restart') {
	get('pm2/'+cmd, req_ip)
		.then((result) => {
			notification.success('Команда pm2 запущена подождите 10-20 секунд')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка выполнения команды pm2'+cmd, {
				errorId: e.id,
			})
		})
}

// Выполнить обновление ПО
function onUptSoft(req_ip) {
	get('upt_soft', req_ip)
		.then((result) => {
			notification.success('Обновление ПО запущено')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка обновления ПО', {
				errorId: e.id,
			})
		})
}
