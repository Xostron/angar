import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Person from '@cmp/person'
import Turn from '@cmp/turn'
import List from './list'
import Btn from '@cmp/fields/btn'
import useAuthStore from '@store/auth'
import { sReset } from '@socket/emit'

import './style.css'

//Информация по сигналам
export default function Signal({}) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const { build } = useParams()
	return (
		<main className='signal'>
			<Turn cls='s-turn' />
			<p className='title' style={{ gridArea: '1/2/2/3' }}>
				Сигналы
			</p>
			<Person cls='s-person' style={{ justifySelf: 'flex-end' }} />
			<List />
			{isAuth && (
				<Btn
					title='Сброс аварии'
					cls='s-reset'
					icon='/img/signal/reset.svg'
					onClick={(_) => {
						sReset({ buildingId: build })
						console.log('reset+')
					}}
				/>
			)}
		</main>
	)
}
