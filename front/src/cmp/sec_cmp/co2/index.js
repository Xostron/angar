// Статус со2
export default function CO2({ data }) {
	if (!data) return null;
	return (
		<div className="brd">
			<img src="/img/cold/co/co2.svg" />
			<span>{data === 'run' ? 'Вкл' : 'Выкл'}</span>
		</div>
	);
}
