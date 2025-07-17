import './style.css'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import { get, post } from '@tool/service_angar'
import { useState } from 'react'
import { useNavigate } from 'react-router'

function Service() {
	const navigate = useNavigate()
	const [ip, setIp] = useState()
	const [info, setInfo] = useState()
	return (
		<main className='page-service'>
			<div className='page-service-ip'>
				<Btn
					title='Показать IP, Mac-адрес'
					onClick={async () => {
						const o = await get('mac')
						console.log(o)
						setInfo(o)
					}}
				/>
				{info && <span>IP-адрес: {info?.ip}</span>}
				{info && <span>MAC-адрес: {info?.mac?.mac}</span>}
			</div>
			<div className='page-service-ip'>
				<Btn title='Установить IP' onClick={() => post('ip', { ip })} />
				<Input value={ip} setValue={setIp} placeholder='0.0.0.0' disabled={1} />
			</div>
			<Btn title='Перезагрузить POS' onClick={() => get('reboot')} />
			<Btn title='Обновить оборудование' onClick={() => get('equipment')} />
			<Btn title='Обновить ПО' onClick={() => get('software')} />
			<Btn title='pm2 restart' onClick={() => get('pm2')} />
			<Btn title='npm install && build' onClick={() => get('npm')} />
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
