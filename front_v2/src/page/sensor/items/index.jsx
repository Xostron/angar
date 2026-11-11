import useEquipStore from '@src/entities/store/equipment';
import style from './style.module.css';
import { sensList } from './fn';

/**
 * Рисует карточки разделенные по типажу: Темп улицы, Влажность улицы, Темп канала и т.д.
 * @param {object} props
 * @param {string} props.idB ИД склада
 * @param {string} props.idS ИД страницы
 * @returns
 */
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

/**
 * Карточка с датчиками
 * @param {object} props
 * @param {object} props.data Данные о подгруппе датчиков, например "Температура продукта"
 * @returns
 */
function Subgroup({ data }) {
  const { code, title, list } = data;
  return (
    <article className={style.subgroup}>
      <span>{title}</span>
      <div className={style.subitems}>
        {list
          .sort((a, b) => a?.order - b?.order)
          .slice(0, 2)
          .map((el, i) => (
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

/**
 * Отображение датчика в карточке
 * @param {object} props
 * @param {object} props.el Датчик
 * @param {string} props.code Код карточки, code=tprd (Температура продукта)
 * @returns
 */
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
