// Заголовок модального окна
export default function Title({ name }) {
	return (
		<div>
			<span className='ef-title'>
				<img src={'/img/gear.svg'} />
				<span>{name}</span>
			</span>
			<p>Ваше действие</p>
		</div>
	)
}
