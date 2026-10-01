import useInputStore from '@src/entities/store/input';
import def from './def';

export default function DefCircuit({ idB, idS }) {
  const circuit = useInputStore(
    (s) => s?.input?.innerSec?.[idB]?.[idS]?.circuit,
  );
  const Component = circuit?.len ? def.many : def.single;
  if (!Component) return null;
  return <Component data={circuit} />;
}
