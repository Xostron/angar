import { useState, useEffect } from 'react';
import useEquipStore from '@src/entities/store/equipment';
import style from './style.module.css';
import { sensList } from './fn';
import dictSensor from '@src/shared/dict/icon_sensor';
import useOutputStore from '@src/entities/store/output';
import useInputStore from '@src/entities/store/input';
import dictUnit from '@src/shared/dict/unit';
import InputNum from '@src/shared/ui/input';
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
        <Subgroup key={i} data={el} idB={idB} />
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
function Subgroup({ data, idB }) {
  const { code, title, list } = data;
  return (
    <article className={style.subgroup}>
      <div className={style.title}>
        <img src={dictSensor?.[code]} alt={code} />
        <span>{title}</span>
      </div>

      <div className={style.subitems}>
        {list
          .sort((a, b) => a?.order - b?.order)
          .slice(0, 2)
          .map((el, i) =>
            code == 'pui' ? (
              <SensorPui el={el} idB={idB} />
            ) : (
              <Sensor key={i} el={el} code={code} idB={idB} />
            ),
          )}
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
 * @param {string} props.idB ИД склада
 * @returns
 */
function Sensor({ el, code, idB }) {
  // сохранить настройки на сервере ангара
  const setSens = useOutputStore((s) => s.setSens);
  const sens = useOutputStore((s) => s.sens);

  // настройка датчика
  const getSens = useInputStore((s) => s.getSens);
  const input = useInputStore((s) => s.input);

  const idSensor = ['tweather', 'hweather'].includes(el?.type)
    ? el?.type
    : el?._id;

  const retainSensor = input?.retain?.[idB]?.[idSensor];

  // Датчик вкл/выкл
  const _on = retainSensor?.on ?? true;
  const [on, setOn] = useState(_on);
  // Коррекция датчика
  const _corr = retainSensor?.corr ?? 0;
  const [corr, setCorr] = useState(_corr);
  let raw, value;

  // Истинное значение датчика raw
  // Значение датчика с коррекцией value
  if (['tweather', 'hweather'].includes(el?.type)) {
    raw = retainSensor?.raw;
    value = retainSensor?.value;
  } else {
    raw = getSens(idSensor)?.raw;
    value = getSens(idSensor)?.value;
  }

  // Еденицы измерения
  const unit = dictUnit?.[el.type];
  console.log(33, el.type);

  // Обработка коррекции и вкл/выкл датчика
  useEffect(() => {
    setCorr(_corr);
    setOn(_on);
  }, [idSensor]);

  // const { cl, cls, clCorr } = fnStyle(sens?.[build]?.[idSensor]?.corr, raw, on)

  return (
    <div className={style.sensor}>
      <div>
        {!dict.includes(code) ? (
          <span>{el.name}</span>
        ) : (
          <span>Датчик {el.order}</span>
        )}
      </div>

      <div>
        <span>Корректировка</span>
        <InputNum
          type="number"
          min={-1000}
          max={1000}
          step={0.1}
          value={corr}
          setValue={actCorr}
          placeholder={0}
          unit={unit}
          size="sensor"
        />
      </div>
    </div>
  );
  // Вкл/выкл датчик
  function actOn(val) {
    setOn(val);
    setSens({ build, _id: el, on: val });
  }
  // Поле "Коррекция"
  function actCorr(val) {
    setCorr(val);
    setSens({ build, _id: el, corr: val });
  }
}

function SensorPui({ el, idB }) {
  return <></>;
}
