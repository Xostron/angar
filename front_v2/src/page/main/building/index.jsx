import style from './style.module.css';

const Bcard = ({ data }) => {
  return (
    <article className={style.container}>

      {/* {data.name} */}
      <div className={style.building_card_hdr}>
        <div></div>
        <div>
          <span>{data.name}</span>
          <span>{data.code}</span>
        </div>
        <div>
          <span>{data.mode}</span>
        </div>
      </div>
      <div></div>
      <div>
        <div></div>
        <span>Вентиляция</span>
        <span>ВКЛ</span>
      </div>
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div>
        <span>t задания канала 12°С, t задания продукта 11°С</span>
      </div>
    </article>
  );
};

export default Bcard;

// {
//     "order": 1,
//     "name": "Комби",
//     "type": "combi",
//     "code": "2026-2",
//     "countAlr": 0,
//     "mode": "Авто",
//     "product": {
//         "_id": "66d0886536e7e1b1ff9e0788",
//         "name": "Лук",
//         "code": "onion"
//     },
//     "automode": {
//         "code": "drying",
//         "name": "Сушка"
//     },
//     "fan": "Вкл",
//     "tprd": {
//         "state": "on",
//         "max": 22,
//         "min": 21
//     },
//     "hin": {
//         "state": "on",
//         "value": 75
//     },
//     "achieve": [
//         {
//             "order": 2,
//             "code": "drying3",
//             "msg": " t задания канала = 20 °С, t задания продукта = 21 °С",
//             "title": "",
//             "buildingId": "69f9dd09c35ea05200898cd8",
//             "uid": "fce897fd-e719-49a3-a748-eec3f45969b7",
//             "date": "04.09.2026, 16:37:45"
//         }
//     ],
//     "sidesect": {
//         "start": true,
//         "tprd": 21,
//         "hin": 75,
//         "habsin": 13.7,
//         "co2": 21,
//         "extra": []
//     }
// }
