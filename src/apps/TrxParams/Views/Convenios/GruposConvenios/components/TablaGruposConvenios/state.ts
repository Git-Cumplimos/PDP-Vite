type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;
type StrOptional = string | "" | undefined;

export type SearchFilters = {
  pk_tbl_grupo_convenios?: StrNumberOptional;
  nombre_grupo_convenios?: string;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_tbl_grupo_convenios: "",
  nombre_grupo_convenios: "",
  page: 1,
  limit: 10,
};

const SET_PK_FK_ID_CONVENIO = "SET_PK_FK_ID_CONVENIO";
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
          ? action.value(state.pk_tbl_grupo_convenios)
          : action.value;
      if (state.pk_tbl_grupo_convenios === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_tbl_grupo_convenios = newVal;
      return clone;
    }

    case SET_NOMBRE_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.nombre_grupo_convenios)
          : action.value;
      if (state.nombre_grupo_convenios === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.nombre_grupo_convenios = newVal;
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
          state.pk_tbl_grupo_convenios === newVal.pk_tbl_grupo_convenios,
          state.nombre_grupo_convenios === newVal.nombre_grupo_convenios,
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
