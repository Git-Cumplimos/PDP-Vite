export type DaneCity = {
  region: string;
  municipio: string;
  departamento: string;
  c_digo_dane_del_departamento: string;
  c_digo_dane_del_municipio: string;
}

export type SearchFilters = Omit<DaneCity, "region"> & {
  // page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  municipio: "",
  departamento: "",
  c_digo_dane_del_departamento: "",
  c_digo_dane_del_municipio: "",
  // page: 1,
  limit: 10,
};

const SET_MUNICIPIO = "SET_MUNICIPIO";
const SET_DEPARTAMENTO = "SET_DEPARTAMENTO";
const SET_C_DIGO_DANE_DEL_DEPARTAMENTO = "SET_C_DIGO_DANE_DEL_DEPARTAMENTO";
const SET_C_DIGO_DANE_DEL_MUNICIPIO = "SET_C_DIGO_DANE_DEL_MUNICIPIO";
// const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "SET_MUNICIPIO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_DEPARTAMENTO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_C_DIGO_DANE_DEL_DEPARTAMENTO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_C_DIGO_DANE_DEL_MUNICIPIO";
      value: string | (() => string) | ((old: string) => string);
    }
  // | {
  //     type: "SET_PAGE";
  //     value: number | (() => number) | ((old: number) => number);
  //   }
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

export const reducerCommerceFilters = (
  state: SearchFilters,
  action: ACTIONTYPE
) => {
  switch (action.type) {
    case SET_MUNICIPIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.municipio)
          : action.value;
      if (state.municipio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.municipio = newVal;
      return clone;
    }
    case SET_DEPARTAMENTO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.departamento)
          : action.value;
      if (state.departamento === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.departamento = newVal;
      return clone;
    }
    case SET_C_DIGO_DANE_DEL_DEPARTAMENTO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.c_digo_dane_del_departamento)
          : action.value;
      if (state.c_digo_dane_del_departamento === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.c_digo_dane_del_departamento = newVal;
      return clone;
    }
    case SET_C_DIGO_DANE_DEL_MUNICIPIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.c_digo_dane_del_municipio)
          : action.value;
      if (state.c_digo_dane_del_municipio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.c_digo_dane_del_municipio = newVal;
      return clone;
    }
    // case SET_PAGE:
    //   const newValPage =
    //     action.value instanceof Function
    //       ? action.value(state.page)
    //       : action.value;
    //   if (state.page === newValPage) {
    //     return state;
    //   }
    //   const clonePage = structuredClone(state);
    //   clonePage.page = newValPage;
    //   return clonePage;
    case SET_LIMIT:
      const newValLimit =
        action.value instanceof Function
          ? action.value(state.limit)
          : action.value;
      if (state.limit === newValLimit) {
        return state;
      }
      const cloneLimit = structuredClone(state);
      cloneLimit.limit = newValLimit;
      return cloneLimit;

    case SET_ALL:
      const newValAll =
        action.value instanceof Function ? action.value(state) : action.value;

      if (
        [
          state.limit === newValAll.limit,
          // state.page === newValAll.page,
          state.municipio === newValAll.municipio,
          state.departamento === newValAll.departamento,
          state.c_digo_dane_del_departamento === newValAll.c_digo_dane_del_departamento,
          state.c_digo_dane_del_municipio === newValAll.c_digo_dane_del_municipio,
        ].every(Boolean)
      ) {
        return state;
      }
      return newValAll;

    default:
      throw new Error("Action not suported");
  }
};
