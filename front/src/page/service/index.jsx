import './style.css'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import { get, post } from '@tool/api/service'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

function Service() {
	const navigate = useNavigate()
	const [ip, setIp] = useState()
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()
	const [equip, setEquip] = useState()
	useEffect(() => {
		get('net_info').then((o) => {
			setInfo(o.net)
			setTtyS(o.ttyS)
		}).catch((e) => {
			alert(e.error)
		})
	}, [])
	
	function set_ip(ip) {
		console.log('set_ip', ip)
		if(!ip || ip == '0.0.0.0') {
			alert('ip is empty')
			return
		}
		post('set_ip', { ip })
			.then((r) => {
					alert('set_ip: '+r.success+': '+r.message)
			})
			.catch((e) => {
				alert('set_ip: '+e.error.message)
			})
	}
	return (
		<main className='page-service'>
			<div className='page-service-row'>
				<Input value={ip} setValue={setIp} placeholder='0.0.0.0' disabled={1} />
				<Btn title='Установить IP вручную' onClick={() => set_ip(ip)} />
			</div>
			<div className='page-service-row'>
				<Btn
					title='Обновить IP, Mac-адрес'
					onClick={async () => {
						get('net_info').then((o) => {
							setInfo(o.net)
							setTtyS(o.ttyS)
						}).catch((e) => {
							alert('net_info: '+e.error)
						})
					}}
				/>
				
			</div>
			
			{info && !info.error && (
				info.map((el, i)=>{
					return (
						<div key={i} className='page-service-row'>
							<span>interface: {el.interface}</span>
							<span>mac: {el.mac}</span>
							<span>ip: {el.ip}</span>
							<Btn title={'Установить '+el.ip} onClick={()=>set_ip(el.ip)} />
						</div>
					)
				})
			)}

			{ttyS && !ttyS.error && (
				ttyS.map((el, i)=>{
					return (
						<div key={i} className='page-service-row'>
							<span>ttyS: {el.raw}</span>
						</div>
					)
				})
			)}

			

			<div className='page-service-row'>
				<Btn
					title='Обновить конфигурацию оборудования'
					onClick={async () => {
						get('equipment').then((o) => {
							setEquip(o)
						}).catch((e) => {
							alert('equipment: '+e.error)
						})
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

			<div className='page-service-row'>
				<Btn title='Обновить ПО' onClick={() => get('upt_soft')} />
				<Btn title='pm2 restart' onClick={() => get('pm2/restart')} />
				<Btn title='npm install && build' onClick={() => get('build')} />
			</div>
			<div className='page-service-row'>
				<Btn title='AutoLogin On' onClick={() => get('auto_login/true')} />
				<Btn title='AutoLogin Off' onClick={() => get('auto_login/false')} />
				<Btn title='Reboot Устройства' onClick={() => get('reboot')} />
			</div>
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
