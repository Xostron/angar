// Статус со2
export default function Wetting({ data }) {
	if (!data) return null;
	return (
		<div className="brd">
			<img src="/img/cold/humidifier.svg" />
			<span>{data === 'run' ? 'Вкл' : 'Выкл'}</span>
		</div>
	);
}
