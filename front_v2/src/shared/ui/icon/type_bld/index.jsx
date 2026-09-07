import dictTypeBld from '@shared/dict/icon_building';

function TypeBld({ type = 'normal', start = false }) {
  const t = type + '_' + (start ? 'on' : 'off');
  return <img width="56px" height="56px" src={dictTypeBld?.[t]} />;
}

export default TypeBld;
