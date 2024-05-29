type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;

export type SearchFilters = {
  pk_codigo_convenio: StrNumberOptional;
  pk_id_autorizador: StrNumberOptional;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_codigo_convenio: "",
  pk_id_autorizador: "",
  page: 1,
  limit: 10,
};

const PK_CODIGO_CONVENIO = "PK_CODIGO_CONVENIO";
const PK_ID_AUTORIZADOR = "PK_ID_AUTORIZADOR";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "PK_CODIGO_CONVENIO";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "PK_ID_AUTORIZADOR";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "SET_PAGE";
      value: number | (() => number) | ((old: number) => number);
    }
  | {
      type: "SET_LIMIT";
      value: number | (() => number) | ((old: number) => number);
    }
  | {
      type: "SET_ALL";
      value:
        | SearchFilters
        | (() => SearchFilters)
        | ((old: SearchFilters) => SearchFilters);
    };

export const reducerFilters = (state: SearchFilters, action: ACTIONTYPE) => {
  switch (action.type) {
    case PK_CODIGO_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_codigo_convenio)
          : action.value;
      if (state.pk_codigo_convenio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_codigo_convenio = newVal;
      return clone;
    }

    case PK_ID_AUTORIZADOR: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_id_autorizador)
          : action.value;
      if (state.pk_id_autorizador === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_id_autorizador = newVal;
      return clone;
    }

    case SET_PAGE: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.page)
          : action.value;
      if (state.page === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.page = newVal;
      return clone;
    }

    case SET_LIMIT: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.limit)
          : action.value;
      if (state.limit === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.limit = newVal;
      return clone;
    }

    case SET_ALL: {
      const newVal =
        action.value instanceof Function ? action.value(state) : action.value;

      if (
        [
          state.limit === newVal.limit,
          state.page === newVal.page,
          state.pk_codigo_convenio === newVal.pk_codigo_convenio,
          state.pk_id_autorizador === newVal.pk_id_autorizador,
        ].every(Boolean)
      ) {
        return state;
      }
      return newVal;
    }

    default:
      throw new Error("Action not suported");
  }
};
