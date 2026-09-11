import useInputStore from '@src/entities/store/input';
import IncidentInline from '@src/shared/ui/incident/inline';
import IncidentJump from '@src/shared/ui/incident/jump';
import IncidentBox from '@src/entities/incident_box';
import style from './style.module.css';

//   Левая боковая панель - аварии склада
function Alarm({ idB }) {
  //   const bld = useEquipStore((s) => s.getBld(idB));
  const am = useInputStore((s) => s?.input?.retain?.[idB]?.automode);
  const alarm = useInputStore((s) => s?.alarm?.monit?.critical?.[idB]?.[0]);
  const notification = useInputStore(
    (s) => s?.alarm?.monit?.warning?.[idB]?.[0],
  );
  const achieve = useInputStore((s) => s?.alarm?.achieve?.[idB]?.[0]);
  const count = useInputStore((s) => s?.alarm?.count?.[idB]);
  return (
    <aside className={style.container}>
      <section className={style.incident}>
        <IncidentBox
          type="notification"
          err={{ ...notification, code: am + '_' + notification?.code }}
        />
        <IncidentBox type="alarm" err={alarm} />
        <IncidentJump count={count} min={1} />
      </section>
      <section className={style.achieve}>
        <IncidentInline msg={achieve?.msg} />
      </section>
    </aside>
  );
}

export default Alarm;
