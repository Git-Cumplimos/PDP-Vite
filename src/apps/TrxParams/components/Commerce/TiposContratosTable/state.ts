export type SearchFilters = {
  id_tipo_contrato: string;
  nombre_contrato: string;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  id_tipo_contrato: "",
  nombre_contrato: "",
  page: 1,
  limit: 10,
};

const SET_ID_TIPO_CONTRATO = "SET_ID_TIPO_CONTRATO";
const SET_NOMBRE_CONTRATO = "SET_NOMBRE_CONTRATO";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "SET_ID_TIPO_CONTRATO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_NOMBRE_CONTRATO";
      value: string | (() => string) | ((old: string) => string);
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

export const reducerContractsFilters = (state: SearchFilters, action: ACTIONTYPE) => {
  switch (action.type) {
    case SET_ID_TIPO_CONTRATO:
      const newValPkComercio =
        action.value instanceof Function
          ? action.value(state.id_tipo_contrato)
          : action.value;
      if (state.id_tipo_contrato === newValPkComercio) {
        return state;
      }
      const clonePkComercio = structuredClone(state);
      clonePkComercio.id_tipo_contrato = newValPkComercio;
      return clonePkComercio;
    case SET_NOMBRE_CONTRATO:
      const newValNombreComercio =
        action.value instanceof Function
          ? action.value(state.nombre_contrato)
          : action.value;
      if (state.nombre_contrato === newValNombreComercio) {
        return state;
      }
      const cloneNombreComercio = structuredClone(state);
      cloneNombreComercio.nombre_contrato = newValNombreComercio;
      return cloneNombreComercio;
    case SET_PAGE:
      const newValPage =
        action.value instanceof Function
          ? action.value(state.page)
          : action.value;
      if (state.page === newValPage) {
        return state;
      }
      const clonePage = structuredClone(state);
      clonePage.page = newValPage;
      return clonePage;
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
          state.page === newValAll.page,
          state.id_tipo_contrato === newValAll.id_tipo_contrato,
          state.nombre_contrato === newValAll.nombre_contrato,
        ].every(Boolean)
      ) {
        return state;
      }
      return newValAll;

    default:
      throw new Error("Action not suported");
  }
};
