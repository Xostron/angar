import Radio from '@cmp/fields/radio'
import { notification } from '@cmp/notification'
import useEquipStore from '@store/equipment'	



export default function RadioIp({ props }) {
	const { req_ip, setReqIp, info, setInfo, ttyS, setTtyS } = props
	const apiInfo = useEquipStore((s) => s.apiInfo)
	return (
		<div className='page-service-row'>
			<span style={{ fontSize: '20px' }}><b>IP сервера:</b> {apiInfo?.ip}</span>
			<span style={{ fontSize: '20px', fontWeight: 'bold' }}>IP для запросов:</span>
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
									notification.success('IP для запросов установлен на ' + el.ip)
									setReqIp(el.ip)
								}}
							/>
						)
					})}
		</div>
	)
}
