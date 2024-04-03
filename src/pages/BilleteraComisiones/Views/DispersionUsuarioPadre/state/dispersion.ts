export type NumberString = `${number}` | number | "";

type Actions =
  | {
      type: "ADD_COMMERCE";
      payload: {
        pk_commerce: NumberString;
        commerce_name: string;
      };
    }
  | {
      type: "REMOVE_COMMERCE";
      payload: number;
    }
  | {
      type: "UPDATE_COMMERCE_ID";
      payload: {
        pk_commerce: NumberString;
        commerce_name: string;
        index: number;
      };
    }
  | {
      type: "UPDATE_COMMERCE_MONEY";
      payload: {
        index: number;
        value: number;
      };
    };

type ComerciosDispersion = Array<{
  pk_commerce: NumberString;
  commerce_name: string;
  value: number;
}>;

export const initialCommercesDispersion: ComerciosDispersion = [];

export const reducerComision = (
  state: ComerciosDispersion = initialCommercesDispersion,
  action: Actions
): ComerciosDispersion => {
  switch (action.type) {
    case "ADD_COMMERCE": {
      return [...state, { ...action.payload, value: 0 }];
    }
    case "REMOVE_COMMERCE": {
      const newState = [...state];
      newState.splice(action.payload, 1);
      return newState;
    }
    case "UPDATE_COMMERCE_ID": {
      const newState = [...state];
      newState[action.payload.index] = {
        ...newState[action.payload.index],
        ...action.payload,
      };
      return newState;
    }
    case "UPDATE_COMMERCE_MONEY": {
      const newState = [...state];
      newState[action.payload.index] = {
        ...newState[action.payload.index],
        value: action.payload.value,
      };
      return newState;
    }
    default:
      throw new Error("Action not suported");
  }
};
