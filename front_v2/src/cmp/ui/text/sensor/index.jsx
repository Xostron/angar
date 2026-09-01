import style from './style.module.css';

//Просто текст
function TextSens({ name, value, state, title, unit = 'grad' }) {
  let cls = '';
  
  if (state == 'off') cls = 'off';
  if (state == 'alarm') {
    cls = 'alarm';
    icon = <img src="./icon/indicator/offline.svg" />;
  }
  const sign = unit == 'grad' ? '+' : '';
  return (
    <div className={style.text} title={title}>
      <span className={style.name}>{name}</span>
      <span className={style.value}>
        {sign}
        {value} {dictUnit?.[unit] ?? ''}
      </span>
    </div>
  );
}

const dictUnit = {
  grad: '°',
  percent: '%',
};

export default TextSens;
