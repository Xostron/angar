import useInputStore from '@src/entities/store/input';
import FanCard from '@src/entities/fan_card';
import style from './style.module.css';
import { useEffect } from 'react';

function FanCardGroup({ idB, idS }) {
  let fan = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.fan);
  let fans = fan?.filter((el) => !Object.hasOwn(el, 'value')) ?? [];
  let fansFC = fan?.filter((el) => Object.hasOwn(el, 'value')) ?? [];
  //   fans = Array(0).fill(fans[0]);
  //   fansFC = Array(6).fill(fansFC[0]);
  //   fan ??= [];
  //   fan.length = 6;
  let size;
  if (fan?.length > 6) size = `tworow`;

  const styleMainGrid = { gap: `${fans?.length == 0 ? '0px' : '12px'}` };
  const styleFans = {
    gridTemplateColumns: `repeat(${fans?.length > 5 ? 5 : (fans?.length ?? 1)},1fr)`,
  };
  const styleFansFC = {
    gridTemplateColumns: `repeat(${fansFC?.length > 5 ? 5 : (fansFC?.length ?? 1)},1fr)`,
  };

  return (
    <section className={style.container}>
      <span>Вентиляция</span>
      <div className={style.main_grid} style={styleMainGrid}>
        <div className={style.content} style={styleFans}>
          {!!fans?.length &&
            fans.map((el, i) => (
              <FanCard key={i} data={el} action={() => {}} size={size} />
            ))}
        </div>
        <div className={style.content} style={styleFansFC}>
          {!!fansFC?.length &&
            fansFC.map((el, i) => (
              <FanCard key={i} data={el} action={() => {}} size={size} fc />
            ))}
        </div>
      </div>
    </section>
  );
}

export default FanCardGroup;
