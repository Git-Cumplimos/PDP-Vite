import React, { useReducer } from "react";
import SimpleMoneyInput from "../../Base/MoneyInput/SimpleMoneyInput";

type MoneyRangeType = [number, number];

export type ActionsReducer = {
  type: "SET_FIRST" | "SET_LAST";
  value: number;
};

type Props = {
  label: string;
  value?: MoneyRangeType;
  onChange: (_: MoneyRangeType) => void;
};

const reducerFunc = (
  state: MoneyRangeType,
  action: ActionsReducer
): MoneyRangeType => {
  switch (action.type) {
    case "SET_FIRST":
      if (state[0] === action.value) return state;
      return [action.value, state[1]];

    case "SET_LAST":
      if (state[1] === action.value) return state;
      return [state[0], action.value];

    default:
      throw new Error("Action not suported");
  }
};

const MoneyRange = (props: Props) => {
  const [moneyRange, dispatch] = useReducer(reducerFunc, props.value || [0, 0]);

  return (
    <div className="grid grid-cols-2 place-items-center gap-4 mx-4">
      <label htmlFor="min_range_money" className="text-xl align-middle">
        {props.label}
      </label>
      <div className="flex flex-row gap-2">
        <SimpleMoneyInput
          id="min_range_money"
          className="px-4 py-2 w-36 rounded-md bg-secondary-light"
          maxLength={13}
          onChange={(_, valor) => {
            props.onChange([valor, moneyRange[1]]);
            dispatch({ type: "SET_FIRST", value: valor });
          }}
        />
        <SimpleMoneyInput
          id="max_range_money"
          className="px-4 py-2 w-36 rounded-md bg-secondary-light"
          maxLength={13}
          onChange={(_, valor) => {
            props.onChange([moneyRange[0], valor]);
            dispatch({ type: "SET_LAST", value: valor });
          }}
        />
      </div>
    </div>
  );
};

export default MoneyRange;
