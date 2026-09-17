import dictUnit from '@src/shared/dict/unit';
import style from './style.module.css';

function Block({ data }) {
  const { state, value, code, unit, target } = data;
  return (
    <div className={style.container}>
      <div className={style.target}>
        <img
          width="24px"
          height="24px"
          src="/icon/indicator/target.svg"
          alt=""
        />
        <span>
          {target} {dictUnit?.[unit]}
        </span>
      </div>
      {dictSens?.[code]}
      <span>
        {value} {dictUnit?.[unit]??unit}
      </span>
    </div>
  );
}

export default Block;

const dictSens = {
  hin: 'Вл. продукта',
  p: 'Дав. канала',
  tcnl: 'Темп. канала',
};
