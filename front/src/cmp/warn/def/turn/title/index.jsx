function Title({ bType }) {
	const txt = bType != 'cold' ? 'ПРОВЕРЬТЕ ПРАВИЛЬНОСТЬ НАСТРОЕК' : 'ХОЛОДИЛЬНИК'
	return (
		<div className='line'>
			<img src='/img/turn.svg' className='turn' />
			<p className='title'>{txt}</p>
		</div>
	)
}
export default Title
