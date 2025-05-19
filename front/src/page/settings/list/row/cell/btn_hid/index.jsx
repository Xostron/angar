import { useEffect, useState } from "react";
import useOutputStore from "@store/output";

export default function BtnHid({ cls, style, value, hid }) {
  const { setHid } = useOutputStore();
  const cl = ["btn-chc", cls].join(" ");
  const [down, up] = ["\u02c5", "\u02c4"];
  const [val, setVal] = useState(hid ? down : up);
  const [chk, setChk] = useState(hid);
  const handle = () => {
    setVal((prev) => (prev === down ? up : down));
    setChk((prev) => !prev);
    setHid([value], !chk);
  };

  useEffect(() => {
    setVal(val);
  }, [val]);

  return (
    <button onClick={handle} className={cl} style={style}>
      <span>{val}</span>
    </button>
  );
}
