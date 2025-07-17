import './style.css'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import def from '@tool/service_angar'
import { useNavigate } from 'react-router'
function Service() {
	const navigate = useNavigate()
	return (
		<main className='page-service'>
			<Btn title='Показать IP, Mac-адрес' onClick={() => {}} />
			<Btn title='Установить IP' onClick={() => {}} />
			<Input value={1} setValue={() => {}} placeholder='IP-адрес' />
			<Btn title='Перезагрузить POS' onClick={() => {}} />
			<Btn title='Обновить оборудование' onClick={def.equipment} />
			<Btn title='Обновить ПО' onClick={() => {}} />
			<Btn title='pm2 restart' onClick={() => {}} />
			<Btn title='npm install && build' onClick={() => {}} />
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
