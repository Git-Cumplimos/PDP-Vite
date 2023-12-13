export type SearchFilters = {
  fk_id_user: number;
  pk_id_dispersion: string;
  estado: string;
  date_search: [string, string];
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  fk_id_user: 0,
  pk_id_dispersion: "",
  estado: "",
  date_search: ["", ""],
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
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_FK_ID_USER";
      value: number | (() => number) | ((old: number) => number);
    }
  | {
      type: "SET_ESTADO";
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: "SET_DATE_SEARCH";
      value:
        | [string, string]
        | (() => [string, string])
        | ((old: [string, string]) => [string, string]);
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
    case SET_FK_ID_USER: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.fk_id_user)
          : action.value;
      if (state.fk_id_user === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.fk_id_user = newVal;
      return clone;
    }
    case SET_ESTADO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.estado)
          : action.value;
      if (state.estado === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.estado = newVal;
      return clone;
    }
    case SET_DATE_SEARCH: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.date_search)
          : action.value;
      if (
        state.date_search[0] === newVal[0] &&
        state.date_search[1] === newVal[1]
      ) {
        return state;
      }
      const clone = structuredClone(state);
      clone.date_search = newVal;
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
          state.estado === newValAll.estado,
          state.fk_id_user === newValAll.fk_id_user,
          state.date_search[0] === newValAll.date_search[0] &&
            state.date_search[1] === newValAll.date_search[1],
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
