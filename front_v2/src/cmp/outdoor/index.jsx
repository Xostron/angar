import './style.css';

const rows = [
  { label: 'Температура', value: '+5 °' },
  { label: 'Точка росы', value: '30 °' },
  { label: 'Отн. вл.', value: '30 %' },
  { label: 'Абс. вл.', value: '10 г/м³' },
];

const Outdoor = () => {
  return (
    <div className="outdoor">
      <div className="outdoor__title">Уличные датчики</div>
      {rows.map((row) => (
        <div key={row.label} className="outdoor__row">
          <span className="outdoor__label">{row.label}</span>
          <span className="outdoor__val">{row.value}</span>
        </div>
      ))}
      <div className="outdoor__compact">
        <span>+5 °</span>
        <span>20%</span>
        <span className="outdoor__date">15.06.26</span>
      </div>
    </div>
  );
};

export default Outdoor;
