type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;
type StrOptional = string | "" | undefined;
type BooleanOptional = boolean | undefined;

export type SearchFilters = {
  pk_id_convenio: StrNumberOptional;
  nombre_convenio: StrOptional;
  ean: StrOptional;
  pk_fk_id_autorizador: StrNumberOptional;
  id_convenio_autorizador: StrNumberOptional;
  estado: BooleanOptional;
  page: number;
  limit: number;
};

export const initialSearchObj: SearchFilters = {
  pk_id_convenio: "",
  nombre_convenio: "",
  ean: "",
  pk_fk_id_autorizador: "",
  id_convenio_autorizador: "",
  estado: undefined,
  page: 1,
  limit: 10,
};

const PK_ID_CONVENIO = "PK_ID_CONVENIO";
const NOMBRE_CONVENIO = "NOMBRE_CONVENIO";
const EAN = "EAN";
const PK_FK_ID_AUTORIZADOR = "PK_FK_ID_AUTORIZADOR";
const ID_CONVENIO_AUTORIZADOR = "ID_CONVENIO_AUTORIZADOR";
const ESTADO = "ESTADO";
const SET_PAGE = "SET_PAGE";
const SET_LIMIT = "SET_LIMIT";
const SET_ALL = "SET_ALL";

export type ACTIONTYPE =
  | {
      type: "PK_ID_CONVENIO";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "NOMBRE_CONVENIO";
      value:
        | StrOptional
        | (() => StrOptional)
        | ((old: StrOptional) => StrOptional);
    }
  | {
      type: "EAN";
      value:
        | StrOptional
        | (() => StrOptional)
        | ((old: StrOptional) => StrOptional);
    }
  | {
      type: "PK_FK_ID_AUTORIZADOR";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "ID_CONVENIO_AUTORIZADOR";
      value:
        | StrNumberOptional
        | (() => StrNumberOptional)
        | ((old: StrNumberOptional) => StrNumberOptional);
    }
  | {
      type: "ESTADO";
      value:
        | BooleanOptional
        | (() => BooleanOptional)
        | ((old: BooleanOptional) => BooleanOptional);
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
    case PK_ID_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.pk_id_convenio)
          : action.value;
      if (state.pk_id_convenio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.pk_id_convenio = newVal;
      return clone;
    }

    case NOMBRE_CONVENIO: {
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

    case EAN: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.ean)
          : action.value;
      if (state.ean === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.ean = newVal;
      return clone;
    }

    case PK_FK_ID_AUTORIZADOR: {
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

    case ID_CONVENIO_AUTORIZADOR: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.id_convenio_autorizador)
          : action.value;
      if (state.id_convenio_autorizador === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.id_convenio_autorizador = newVal;
      return clone;
    }

    case ESTADO: {
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
          state.pk_id_convenio === newVal.pk_id_convenio,
          state.nombre_convenio === newVal.nombre_convenio,
          state.ean === newVal.ean,
          state.pk_fk_id_autorizador === newVal.pk_fk_id_autorizador,
          state.id_convenio_autorizador === newVal.id_convenio_autorizador,
          state.estado === newVal.estado,
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
