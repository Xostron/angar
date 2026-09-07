import dictTypeBld from '@shared/dict/icon_building';

function TypeBld({ type = 'normal', online = false }) {
  const t = type + '_' + (online ? 'online' : 'offline');
  return (
    <img
      width="65px"
      height="70px"
      src={dictTypeBld?.[t]}
    />
  );
}

export default TypeBld;
