import Btn from '@cmp/fields/btn'
import { get } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Soft({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	return (
		<>
			<div className='page-service-row'>
				<Btn title='Обновить ПО' onClick={() => onUptSoft(req_ip)} />
				<Btn title='pm2 restart' onClick={() => onPm2(req_ip)} />
				<Btn title='npm install && build' onClick={() => onNpm(req_ip)} />
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
function onPm2(req_ip) {
	get('pm2/restart', req_ip)
		.then((result) => {
			notification.success('Перезапуск pm2 запущен подождите 10-20 секунд')
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
			notification.success('Обновление ПО запущено')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка обновления ПО', {
				errorId: e.id,
			})
		})
}
