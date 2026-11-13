import { useMemo } from 'react';
import style from './style.module.css';
import useInputStore from '@src/entities/store/input';
import TargetTag from '@src/shared/ui/tag/target';

function SensorPui({ el, idB }) {
  const input = useInputStore((s) => s.input);
  //Получить линии показаний
  const r = useMemo(() => fnList(el, input), [input]);

  return (
    <div className={style.sensor}>
      {r.map((el) => (
        <div className={style.pui}>
          <span>{el.name}</span>
          <TargetTag imgOff value={el.value} unit={el.unit} />
        </div>
      ))}
    </div>
  );
}

export { SensorPui };

/**
 * Получить список показаний
 * @param {object[]} data список устройств электроизмерения
 * @param {object} input данные с показаниями
 * @returns {object[]} строки с показаниями
 */
function fnList(el, input) {
  const r = [];

  if (!el) return;
  const d = input[el?.idDevice];

  // Линии показаний
  for (const key in d) {
    if (!['Ua', 'Ub', 'Uc', 'Ia', 'Ib', 'Ic'].includes(key)) continue;
    let name, unit;
    switch (key[0]) {
      case 'U':
        name = `Напряжение ${key}`;
        unit = 'В';
        break;
      case 'I':
        name = `Ток фазы ${key}`;
        unit = 'А';
        break;
      case 'P':
        name = `Мощность фазы ${key}`;
        unit = 'Вт';
        break;
      default:
        break;
    }
    r.push({ name, unit, value: d[key], type: 'value' });
  }

  return r;
}
