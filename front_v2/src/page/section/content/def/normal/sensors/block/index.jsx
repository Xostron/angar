import dictUnit from '@src/shared/dict/unit';
import style from './style.module.css';
import TargetTag from '@src/shared/ui/tag/target';

function Block({ data }) {
  const { state, value, code, unit, target } = data;

  return (
    <div className={style.container}>
      <TargetTag value={target} unit={unit} />
      <div className={style.value}>
        <span>{dictSens?.[code]}</span>
        <span className={style.number}>
          {value} {dictUnit?.[unit] ?? unit}
        </span>
      </div>
    </div>
  );
}

export default Block;

const dictSens = {
  hin: 'Вл. продукта',
  p: 'Дав. канала',
  tcnl: 'Темп. канала',
};
