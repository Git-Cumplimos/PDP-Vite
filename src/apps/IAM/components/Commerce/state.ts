export type SearchFilters = {
  pk_comercio: string;
  nombre_comercio: string;
  estado?: boolean;
  fk_id_user?: string | number;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_comercio: "",
  nombre_comercio: "",
  page: 1,
  limit: 10,
};

const SET_PK_COMERCIO = "SET_PK_COMERCIO";
const SET_NOMBRE_COMERCIO = "SET_NOMBRE_COMERCIO";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "SET_PK_COMERCIO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_NOMBRE_COMERCIO";
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

export const reducerCommerceFilters = (state: SearchFilters, action: ACTIONTYPE) => {
  switch (action.type) {
    case SET_PK_COMERCIO:
      const newValPkComercio =
        action.value instanceof Function
          ? action.value(state.pk_comercio)
          : action.value;
      if (state.pk_comercio === newValPkComercio) {
        return state;
      }
      const clonePkComercio = structuredClone(state);
      clonePkComercio.pk_comercio = newValPkComercio;
      return clonePkComercio;
    case SET_NOMBRE_COMERCIO:
      const newValNombreComercio =
        action.value instanceof Function
          ? action.value(state.nombre_comercio)
          : action.value;
      if (state.nombre_comercio === newValNombreComercio) {
        return state;
      }
      const cloneNombreComercio = structuredClone(state);
      cloneNombreComercio.nombre_comercio = newValNombreComercio;
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
          state.pk_comercio === newValAll.pk_comercio,
          state.nombre_comercio === newValAll.nombre_comercio,
        ].every(Boolean)
      ) {
        return state;
      }
      return newValAll;

    default:
      throw new Error("Action not suported");
  }
};
