import { useState } from 'react'
import Btn from '@cmp/fields/btn'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Equip({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	const [file, setFile] = useState()

	return (
		<>
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>
				Управление проектом и оборудованием:
			</span>
			<div className='page-service-row'>
				<Btn
					title='Обновить конфигурацию оборудования по сети'
					onClick={() => onEquip(req_ip)}
				/>
			</div>
			<div className='page-service-row'>
				<input
					className='cell input auth-input'
					type='file'
					onChange={(e) => setFile(e.target.files[0])}
				/>
				<Btn title='Обновить конфигурацию из файла' onClick={() => onEquipFile(file)} />
			</div>
		</>
	)
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
