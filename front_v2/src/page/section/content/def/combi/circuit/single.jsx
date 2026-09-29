import style from './style.module.css';
import EquipSt from '@src/shared/ui/icon/equipment';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import TextIcEquipV2 from '@src/shared/ui/text/equipment_icon_v2';

function Single({ data = {} }) {
  const { list = [], comfan } = data;
  return (
    <article className={style.container}>
      <span>{list.length > 1 ? 'Контуры' : 'Контур'}</span>
      <div className={`${style.cards} ${comfan?.length ? style.rounded : ''}`}>
        {!!list.length &&
          list.map((el) => <Card el={el} comfanLength={comfan?.length} />)}
      </div>

      <div className={style.comfan}>
        <TextIcEquipV2
          code="cooler"
          name="Вент. испарителя"
          value={comfan?.[0]?.value}
          state={comfan?.[0]?.state}
        />
      </div>
    </article>
  );
}

export default Single;

function Card({ el, comfanLength }) {
  const { name, aggregate, condenser, state, fan, tmpCooler, pin, pout } = el;
  return (
    <div className={`${style.card} `}>
      <span>{name}</span>
      <div className={style.pressure}>
        <TextSensRow
          name="Дав. всасывания"
          value={pin?.min}
          state={pin?.state}
          unit="Бар"
        />
        <TextSensRow
          name="Дав. нагнетания"
          value={pout?.min}
          state={pout?.state}
          unit="Бар"
        />
      </div>
      <div className={style.equipment}>
        <EquipSt code="aggregate" data={aggregate} />
        <EquipSt code="condenser" data={condenser} />
      </div>
      <div className={style.state}>
        <TextSensRow
          name={state}
          value={tmpCooler?.min}
          state={tmpCooler?.state}
          unit="grad"
          styleName={{ color: 'var(--c-blue-darker)' }}
        />
      </div>
      {!comfanLength && (
        <TextIcEquipV2
          code="cooler"
          name="Вент."
          value={fan?.value}
          state={fan?.state}
        />
      )}
    </div>
  );
}
