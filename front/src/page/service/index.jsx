import './style.css'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import NetworkEthernetModal from './modals/network-ethernet'
import NetworkWifiModal from './modals/network-wifi'
import Accordion from '@cmp/accordion'
import { get, post } from '@tool/api/service'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import Radio from '@cmp/fields/radio'

function Service() {
	const navigate = useNavigate()
	const [ip, setIp] = useState()
	const [req_ip, setReqIp] = useState('')
	const [info, setInfo] = useState()
	const [ttyS, setTtyS] = useState()
	const [equip, setEquip] = useState()
	
	// Ссылки на модальные окна
	const ethernetModalRef = useRef()
	const wifiModalRef = useRef()
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

	// Функции для модальных окон
	function modal_eth() {
		ethernetModalRef.current?.showModal()
	}

	function modal_wifi() {
		wifiModalRef.current?.showModal()
	}

	function handleEthernetSave(config) {
		console.log('Ethernet config:', config)
		// Здесь будет отправка конфигурации на сервер
		post('set_ethernet', config)
			.then((r) => {
				alert('Настройки Ethernet сохранены: ' + r.message)
				// Обновляем информацию о сети
				get('net_info').then((o) => {
					setInfo(o.net)
				})
			})
			.catch((e) => {
				alert('Ошибка настройки Ethernet: ' + e.error)
			})
	}

	function handleWifiSave(config) {
		console.log('WiFi config:', config)
		// Здесь будет отправка конфигурации на сервер
		post('set_wifi', config)
			.then((r) => {
				alert('Подключение к WiFi: ' + r.message)
				// Обновляем информацию о сети
				get('net_info').then((o) => {
					setInfo(o.net)
				})
			})
			.catch((e) => {
				alert('Ошибка подключения к WiFi: ' + e.error)
			})
	}
	return (
		<main className='page-service'>
			<Accordion title="Устройства последовательных портов" defaultOpen={false}>
				{ttyS && !ttyS.error ? (
					ttyS.map((el, i)=>{
						return (
							<div key={i} className='page-service-row'>
								<span>[ {i} ]: {el.raw}</span>
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
				<Btn title='Настройки сети Ethernet' onClick={() => modal_eth()} />
				<Btn title='Подключение к WiFi' onClick={() => modal_wifi()} />
			</div>
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Настройка IP-адреса для проекта:</span>
			
			<div className='page-service-row'>
				
				<Input value={ip} setValue={setIp} placeholder='0.0.0.0' disabled={1} />
				<Btn title='Установить IP вручную' onClick={() => set_ip(ip)} />
				<div className='page-service-row'>
					<Btn
						title='Обновить'
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
			</div>
			
			<Accordion title="Список сетевых интерфейсов" defaultOpen={false}>
				{info && !info.error ? (
					info.map((el, i)=>{
						return (
							<div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',padding: '5px'}}>
								<span>interface: {el.interface}</span>
								<span>mac: {el.mac}</span>
								<span>ip: {el.ip}</span>
								<Btn title={'Установить '+el.ip} onClick={()=>set_ip(el.ip)} />
							</div>
						)
					})
				) : (
					<div className='page-service-row'>
						<span>Нет доступных сетевых интерфейсов</span>
					</div>
				)}
			</Accordion>

			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Управление проектом и оборудованием:</span>
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
			<div className='page-service-row'>
				<span>IP для запросов:</span>
				<Radio value='localhost' title='localhost' name='ip' selected={'localhost'} change={()=>setReqIp('localhost')}/>
				{info && info.length > 0 && (
				info.map((el, i)=>{
					return (
						<Radio key={i} value={el.ip} title={el.ip} name='ip' selected={el.ip} change={()=>setReqIp(el.ip)}/>
					)
				})
			)}
			<Btn
				title='Назад'
				onClick={() => {
					navigate('../')
				}}
			/>
			</div>
			

			{/* Модальные окна */}
			<NetworkEthernetModal 
				modalRef={ethernetModalRef} 
				onSave={handleEthernetSave} 
			/>
			<NetworkWifiModal 
				modalRef={wifiModalRef} 
				onSave={handleWifiSave} 
			/>
		</main>
	)
}

export default Service
