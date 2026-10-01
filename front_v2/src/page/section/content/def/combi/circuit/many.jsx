import TextSensRow from '@src/shared/ui/text/sensor_row';
import style from './many.module.css';
import TextIcEquipV2 from '@src/shared/ui/text/equipment_icon_v2';

// Виджет контуров > 2
function Many({ data }) {
  const { title, len, comState, fans } = data;
  const ff = Array(6).fill(fans?.[0]);
  return (
    <article className={style.container}>
      <span>Контуры</span>

      <div className={style.card}>
        {/* Заголовок */}
        <div className={style.title}>
          <span>{title}</span>
          <span>{len}</span>
        </div>

        <div className={style.state_fans}>
          {/* Состояние испарителей */}
          <TextSensRow name="Режим ТО" value={comState} />
          {/* Список ВНО испарителей */}
          <div className={style.fans}>
            {!!fans.length &&
              ff.map((el) => (
                <TextIcEquipV2
                  code="cooler"
                  value={el?.value}
                  state={el?.state}
                />
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default Many;
