import Row from './row'
// import useWarn from '@store/warn'
// import useAuthStore from '@store/auth'

//Тело таблицы
export default function List({data, st}) {
		// const { warn } = useWarn()
		// const { isAuth } = useAuthStore()
	if (!data || !data.list.length) return null
	return (
		<section style={st} className='set-list' /*onClick={onClick}*/>
			{data.list.map(((el, i) => <Row data={el} key={i} i={i}/>))}
		</section>
	)
	// function onClick() {
	// 	if (!isAuth) warn('auth', 'warn', () => warn(null, 'person'))
	// }
}