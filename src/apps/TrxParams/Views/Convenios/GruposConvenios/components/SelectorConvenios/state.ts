type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;
type StrOptional = string | "" | undefined;

export type SearchFilters = {
  pk_fk_id_convenio?: StrNumberOptional;
  pk_fk_id_autorizador?: StrNumberOptional;
  nombre_convenio?: string;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_fk_id_convenio: "",
  pk_fk_id_autorizador: "",
  nombre_convenio: "",
  page: 1,
  limit: 10,
};

const SET_PK_FK_ID_CONVENIO = "SET_PK_FK_ID_CONVENIO";
const SET_PK_FK_ID_AUTORIZADOR = "SET_PK_FK_ID_AUTORIZADOR";
const SET_NOMBRE_CONVENIO = "SET_NOMBRE_CONVENIO";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "SET_PK_FK_ID_CONVENIO";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "SET_PK_FK_ID_AUTORIZADOR";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "SET_NOMBRE_CONVENIO";
      value:
        | StrOptional
        | (() => StrOptional)
        | ((old: StrOptional) => StrOptional);
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

export const reducerFilters = (
  state: SearchFilters,
  action: ACTIONTYPE
) => {
  switch (action.type) {
    case SET_PK_FK_ID_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_fk_id_convenio)
          : action.value;
      if (state.pk_fk_id_convenio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_fk_id_convenio = newVal;
      return clone;
    }

    case SET_PK_FK_ID_AUTORIZADOR: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_fk_id_autorizador)
          : action.value;
      if (state.pk_fk_id_autorizador === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_fk_id_autorizador = newVal;
      return clone;
    }

    case SET_NOMBRE_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.nombre_convenio)
          : action.value;
      if (state.nombre_convenio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.nombre_convenio = newVal;
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
          state.pk_fk_id_convenio === newVal.pk_fk_id_convenio,
          state.pk_fk_id_autorizador === newVal.pk_fk_id_autorizador,
          state.nombre_convenio === newVal.nombre_convenio,
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
