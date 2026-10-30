import Cell from "./cell";

//Строка настроек
export default function Row({ data, i }) {
  return (
    <>
      {data.map((el, j) => (
        <Cell key={el?.code ?? j} i={i} j={j} data={el} />
      ))}
    </>
  );
}
