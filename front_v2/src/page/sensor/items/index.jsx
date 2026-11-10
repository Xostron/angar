import useEquipStore from '@src/entities/store/equipment';
import style from './style.module.css';
import { sensList } from './fn';

export default function Groups({ idB, idS }) {
  const build = useEquipStore((s) => s.getBld(idB));
  const data = sensList(build, idS);
  console.log(11, data);
  return (
    <>
      {data.map((el, i) => (
        <Subgroup key={i} data={el} />
      ))}
    </>
  );
}

function Subgroup({ data }) {
  const { code, title, list } = data;
  return (
    <article className={style.subgroup}>
      <span>{title}</span>
      <div className={style.sensors}>
        {list.map((el, i) => (
          <Sensor key={i} el={el} code={code} />
        ))}
      </div>
    </article>
  );
}

const dict = [
  'tweather',
  'outTemp',
  'outMois',
  'inTemp',
  'inMois',
  'tcnl',
  'tprd',
  'p',
  'co2',
];

function Sensor({ el, code }) {
  if (code == 'pui') return <></>;
  return (
    <div className={style.sensor}>
      {!dict.includes(code) ? (
        <span>{el.name}</span>
      ) : (
        <span>Датчик {el.order}</span>
      )}
    </div>
  );
}
