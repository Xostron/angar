import { useState, useEffect } from 'react';
import style from './style.module.css';
import useOutputStore from '@src/entities/store/output';
import useInputStore from '@src/entities/store/input';
import dictUnit from '@src/shared/dict/unit';
import InputNum from '@src/shared/ui/input';
import { Title1, Title2 } from './title';
// Для отображения имени датчиков
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
    raw = input?.[idB]?.[idSensor]?.raw;
    value = input?.[idB]?.[idSensor]?.value;
  } else {
    raw = getSens(idSensor)?.raw;
    value = getSens(idSensor)?.value;
  }

  // Еденицы измерения
  const unit = dictUnit?.[el.type];

  // Обработка коррекции и вкл/выкл датчика
  useEffect(() => {
    setCorr(_corr);
    setOn(_on);
  }, [idSensor]);

  // const { cl, cls, clCorr } = fnStyle(sens?.[build]?.[idSensor]?.corr, raw, on)

  const Title = !dict.includes(code) ? (
    <Title2 value={value} on={on} actOn={actOn} unit={unit} el={el} />
  ) : (
    <Title1 value={value} on={on} actOn={actOn} unit={unit} el={el} />
  );

  return (
    <div className={style.sensor}>
      {Title}
      <div className={style.corr}>
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
  function actOn() {
    setOn((p) => !p);
    setSens({ build: idB, _id: el, on });
  }
  // Поле "Коррекция"
  function actCorr(val) {
    setCorr(val);
    setSens({ build: idB, _id: el, corr: val });
  }
}

export { Sensor };
