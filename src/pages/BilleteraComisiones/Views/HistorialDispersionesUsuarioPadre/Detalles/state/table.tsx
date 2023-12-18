export type SearchFilters = {
  pk_id_dispersion: number;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_id_dispersion: 0,
  page: 1,
  limit: 10,
};

const SET_PK_ID_DISPERSION = "SET_PK_ID_DISPERSION";
const SET_FK_ID_USER = "SET_FK_ID_USER";
const SET_ESTADO = "SET_ESTADO";
const SET_DATE_SEARCH = "SET_DATE_SEARCH";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "SET_PK_ID_DISPERSION";
      value: number | (() => number) | ((old: number) => number);
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

export const reducerCommerceFilters = (
  state: SearchFilters,
  action: ACTIONTYPE
) => {
  switch (action.type) {
    case SET_PK_ID_DISPERSION: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_id_dispersion)
          : action.value;
      if (state.pk_id_dispersion === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_id_dispersion = newVal;
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
      const newValAll =
        action.value instanceof Function ? action.value(state) : action.value;

      if (
        [
          state.limit === newValAll.limit,
          state.page === newValAll.page,
          state.pk_id_dispersion === newValAll.pk_id_dispersion,
        ].every(Boolean)
      ) {
        return state;
      }
      return newValAll;
    }

    default:
      throw new Error("Action not suported");
  }
};
