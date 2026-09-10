import useInputStore from '@src/entities/store/input';
import style from './style.module.css';
import IncidentBox from '@src/entities/incident_box';
import useEquipStore from '@src/entities/store/equipment';
import IncidentJump from '@src/shared/ui/incident/jump';
import IncidentInline from '@src/shared/ui/incident/inline';

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
  console.log(11, achieve);
  return (
    <aside className={style.container}>
      <IncidentBox
        type="notification"
        err={{ ...notification, code: am + '_' + notification?.code }}
      />
      <IncidentBox type="alarm" err={alarm} />
      <IncidentJump count={count} min={1} />
      <IncidentInline msg={achieve?.msg} />
    </aside>
  );
}

export default Alarm;
