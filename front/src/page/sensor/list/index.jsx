import Pui from './pui'
import Row from './row'
import useWarn from '@store/warn'
import useAuthStore from '@store/auth'

//Тело таблицы
export default function List({ data, type }) {
	const { warn } = useWarn()
	const { isAuth } = useAuthStore()
	if (!data?.length) return
	return type === 'pui' ? (
		<Pui data={data} />
	) : (
		<section className='list-sen' onClick={onClick}>
			{data.map((el) => (
				<Row key={el._id} data={el} />
			))}
		</section>
	)

	function onClick() {
		if (!isAuth) warn('auth', 'warn', () => warn(null, 'person'))
	}
}
