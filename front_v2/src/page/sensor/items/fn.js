const bldSens = [
  ['outTemp', 'Температура улицы'],
  ['outMois', 'Влажность улицы'],
  ['inTemp', 'Температура потолка'],
  ['inMois', 'Влажность продукта'],
  ['pin', ''],
  ['pout', ''],
];
const sectSens = [
  ['tcnl', 'Температура канала'],
  ['tprd', 'Температура продукта'],
  ['p', 'Давление в канале'],
  ['co2', 'Концентрация CO2'],
  ['aifc', 'Ток ПЧ'],
];
const puiSens = ['Ua', 'Ub', 'Uc', 'Ia', 'Ib', 'Ic', 'Pa', 'Pb', 'Pc'];

/**
 * Список рамы датчиков
 * @param {object} build рама склада
 * @param {string} idS ИД страницы: all, pui, ИД секций
 * @returns {object}
 */
export function sensList(build, idS) {
  const data = [];
  const sections = build?.section;
  
  if (!idS || !build || !sections?.length) return data;
  const section = sections.find((el) => el._id == idS);

  switch (idS) {
    // Общие датчики
    case 'all':
      // Прогноз погоды

      if (build?.tweather)
        data.push({
          code: 'tweather',
          title: 'Погода: темп. улицы',
          list: [build?.tweather] ?? null,
        });

      bldSens.forEach(([code, title]) => {
        if (!build?.[code]?.length) return;
        data.push({
          code,
          title,
          list: build?.[code] ?? null,
        });
      });
      return data;

    //   Датчики электросчетчика
    case 'pui':
      sections.forEach((el) => {
        const list = el.device
          ?.filter((d) => d?.device?.code === 'pui')
          .map((d) => ({ idDevice: d._id }));
        if (!list?.length) return;
        data.push({ code: 'pui', title: el.name, list });
      });
      return data;

    //   Датчики секции
    default:
      section?.cooler?.forEach((clr) => {
        if (!clr?.sensor?.length) return;
        data.push({ code: 'cooler', title: clr.name, list: clr?.sensor });
      });

      sectSens?.forEach(([code, title]) => {
        if (!section?.[code]?.length) return;
        data.push({ code, title, list: section?.[code] });
      });
      return data;
  }
}
