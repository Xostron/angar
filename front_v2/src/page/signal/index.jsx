import useInputStore from '@src/entities/store/input';
import DescContainer from './desc_container';
import SignalContainer from './signal_container';
import IncidentItem from '@src/entities/incident_item';
import style from './style.module.css';

const SignalPage = () => {
  const signal = useInputStore(
    (s) => s?.alarm?.signal?.['69f9dd09c35ea05200898cd8'],
  );
//   const rr = useInputStore((s) => s?.alarm?.monit);
//   console.log(111, signal);
//   console.log(222, rr);
  return (
    <main className={style.container}>
      <SignalContainer stl={{ width: '1176px' }}>
        {!!signal?.length &&
          signal.map((el) => <IncidentItem key={el._id} data={el} />)}
      </SignalContainer>
      <DescContainer stl={{ width: '774px' }}></DescContainer>
    </main>
  );
};

export default SignalPage;
