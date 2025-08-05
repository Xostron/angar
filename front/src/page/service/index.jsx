import './style.css'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import { get, post } from '@tool/api/service'
import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router'

function Service() {
	const navigate = useNavigate()
	const [ip, setIp] = useState()
	const [info, setInfo] = useState()
	const [equip, setEquip] = useState()
	// const [info, setInfo] = useReducer(action, null)

	return (
		<main className='page-service'>
			<div className='page-service-row'>
				<Btn
					title='Показать IP, Mac-адрес'
					onClick={async () => {
						const o = await get('net_info')
						console.log(888, o)
						setInfo(o)
					}}
				/>
				{!info?.error?.code ? (
					<>
						<span>IP-адрес: {info?.ip}</span>
						<span>MAC-адрес: {info?.mac?.mac}</span>
					</>
				) : (
					<span title={`${info?.error?.code}: ${info?.error?.message}`}>
						Возникла ошибка!
					</span>
				)}
			</div>

			<div className='page-service-row'>
				<Btn title='Установить IP' onClick={() => post('set_ip', { ip })} />
				<Input value={ip} setValue={setIp} placeholder='0.0.0.0' disabled={1} />
			</div>

			<Btn title='Перезагрузить POS' onClick={() => get('reboot')} />

			<div className='page-service-row'>
				<Btn
					title='Обновить оборудование'
					onClick={async () => {
						const o = await get('equipment')
						console.log(999, o)
						setEquip(o)
					}}
				/>
				{!equip?.error?.code ? (
					<span>Обновление: {equip}</span>
				) : (
					<span title={`${equip?.error?.code}: ${equip?.error?.message}`}>
						Возникла ошибка!
					</span>
				)}
			</div>

			<Btn title='Обновить ПО' onClick={() => get('upt_soft')} />
			<Btn title='pm2 restart' onClick={() => get('pm2/restart')} />
			<Btn title='npm install && build' onClick={() => get('build')} />
			<Btn
				title='Назад'
				onClick={() => {
					navigate('../')
				}}
			/>
		</main>
	)
}

export default Service
