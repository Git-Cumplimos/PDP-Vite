import { useEffect, useMemo, useState } from "react";
import Input from "../Input";

const HideInput = ({ ...input }) => {
  const [invalid, setInvalid] = useState("");

  const [oldValueData, setOldValueData] = useState("");

  const onInput = useMemo(() => {
    const inpFcn = input?.onInput;
    const chgFcn = input?.onChange;
    const newCallback = (e, value) => {
      inpFcn?.(e, value);
      chgFcn?.(e, value);
    };
    return newCallback;
  }, [input?.onChange, input?.onInput]);

  const newValue = useMemo(() => {
    return input?.value ? input?.value.replace(/\w/g, "*") : "";
  }, [input?.value]);

  useEffect(() => {
    delete input.type;
  }, [input.type]);

  const handleOldValue = (value) => {
    const len = value.length;
    const oldLen = oldValueData.length;
    const lastIndexTargetValue = value[value.length - 1];
    let stringData = oldValueData;
    if (len > oldLen) {
      stringData = `${stringData}${lastIndexTargetValue}`;
    } else {
      stringData = stringData.slice(0, stringData.length - 1);
    }
    setOldValueData(stringData);
    return stringData;
  };
  return (
    <Input
      {...input}
      value={newValue}
      type={"text"}
      onInput={(e) => {
        let caret_pos = e.target.selectionStart;
        const len = e.target.value.length;
        const targetValue = e.target.value;
        const stringOnlyData = handleOldValue(targetValue);
        e.target.value = e.target.value.replace(/\w/g, "*");
        e.target.focus();
        caret_pos += e.target.value.length - len;
        e.target.setSelectionRange(caret_pos, caret_pos);
        onInput?.(e, stringOnlyData);
      }}
      invalid={invalid}
    />
  );
};

export default HideInput;
