type EmptyNumbers = number | "";

export type ConveniosAutorizador = {
  pk_fk_id_autorizador: EmptyNumbers;
  id_convenio_autorizador: EmptyNumbers;
  estado_convenio: boolean;
};

export type SearchFilters = {
  pk_id_convenio?: number;
  nombre_convenio: string;
  descripcion_convenio: string;
  nit: string;
  estado: boolean;
  tags: Array<string>;
  ean: Array<string>;
  convenios_autorizador: Array<ConveniosAutorizador>;
};

export const initialSearchObj: SearchFilters = {
  pk_id_convenio: undefined,
  nombre_convenio: "",
  descripcion_convenio: "",
  nit: "",
  estado: true,
  tags: [],
  ean: [],
  convenios_autorizador: [],
};

const PK_ID_CONVENIO = "PK_ID_CONVENIO";
const NOMBRE_CONVENIO = "NOMBRE_CONVENIO";
const DESCRIPCION_CONVENIO = "DESCRIPCION_CONVENIO";
const NIT = "NIT";
const ESTADO = "ESTADO";

const TAGS_ADD = "TAGS_ADD";
const TAGS_REMOVE = "TAGS_REMOVE";
const TAGS_EDIT = "TAGS_EDIT";
const TAGS_EDIT_ALL = "TAGS_EDIT_ALL";

const EAN_ADD = "EAN_ADD";
const EAN_REMOVE = "EAN_REMOVE";
const EAN_EDIT = "EAN_EDIT";
const EAN_EDIT_ALL = "EAN_EDIT_ALL";

const CONVENIOS_AUTORIZADOR_ADD = "CONVENIOS_AUTORIZADOR_ADD";
const CONVENIOS_AUTORIZADOR_REMOVE = "CONVENIOS_AUTORIZADOR_REMOVE";
const CONVENIOS_AUTORIZADOR_EDIT = "CONVENIOS_AUTORIZADOR_EDIT";
const CONVENIOS_AUTORIZADOR_EDIT_ITEM = "CONVENIOS_AUTORIZADOR_EDIT_ITEM";
const CONVENIOS_AUTORIZADOR_EDIT_ALL = "CONVENIOS_AUTORIZADOR_EDIT_ALL";

const SET_ALL = "SET_ALL";

type ItemConveniosAutoActions = {
  type: typeof CONVENIOS_AUTORIZADOR_EDIT_ITEM;
  index: number;
  item:
    | {
        key: "pk_fk_id_autorizador";
        value:
          | EmptyNumbers
          | (() => EmptyNumbers)
          | ((old: EmptyNumbers) => EmptyNumbers);
      }
    | {
        key: "id_convenio_autorizador";
        value:
          | EmptyNumbers
          | (() => EmptyNumbers)
          | ((old: EmptyNumbers) => EmptyNumbers);
      }
    | {
        key: "estado_convenio";
        value: boolean | (() => boolean) | ((old: boolean) => boolean);
      };
};

export type ACTIONTYPE =
  | {
      type: typeof PK_ID_CONVENIO;
      value: number | (() => number) | ((old?: number) => number);
    }
  | {
      type: typeof NOMBRE_CONVENIO;
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: typeof DESCRIPCION_CONVENIO;
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: typeof NIT;
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: typeof TAGS_ADD;
    }
  | {
      type: typeof TAGS_REMOVE;
      index: number;
    }
  | {
      type: typeof TAGS_EDIT;
      index: number;
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: typeof TAGS_EDIT_ALL;
      value:
        | Array<string>
        | (() => Array<string>)
        | ((old: Array<string>) => Array<string>);
    }
  | {
      type: typeof EAN_ADD;
    }
  | {
      type: typeof EAN_REMOVE;
      index: number;
    }
  | {
      type: typeof EAN_EDIT;
      index: number;
      value: string | (() => string) | ((old: string) => string);
    }
  | {
      type: typeof EAN_EDIT_ALL;
      value:
        | Array<string>
        | (() => Array<string>)
        | ((old: Array<string>) => Array<string>);
    }
  | {
      type: typeof ESTADO;
      value: boolean | (() => boolean) | ((old: boolean) => boolean);
    }
  | {
      type: typeof CONVENIOS_AUTORIZADOR_ADD;
    }
  | {
      type: typeof CONVENIOS_AUTORIZADOR_REMOVE;
      index: number;
    }
  | ItemConveniosAutoActions
  | {
      type: typeof CONVENIOS_AUTORIZADOR_EDIT;
      index: number;
      value:
        | ConveniosAutorizador
        | (() => ConveniosAutorizador)
        | ((old: ConveniosAutorizador) => ConveniosAutorizador);
    }
  | {
      type: typeof CONVENIOS_AUTORIZADOR_EDIT_ALL;
      value:
        | Array<ConveniosAutorizador>
        | (() => Array<ConveniosAutorizador>)
        | ((old: Array<ConveniosAutorizador>) => Array<ConveniosAutorizador>);
    }
  | {
      type: typeof SET_ALL;
      value:
        | SearchFilters
        | (() => SearchFilters)
        | ((old: SearchFilters) => SearchFilters);
    };

const changeConvenioAuto = (
  state: SearchFilters,
  action: ItemConveniosAutoActions
) => {
  switch (action.item.key) {
    case "pk_fk_id_autorizador": {
      const currVal =
        state.convenios_autorizador[action.index].pk_fk_id_autorizador;
      const newVal =
        action.item.value instanceof Function
          ? action.item.value(currVal)
          : action.item.value;

      if (currVal === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.convenios_autorizador[action.index].pk_fk_id_autorizador = newVal;
      return clone;
    }
    case "id_convenio_autorizador": {
      const currVal =
        state.convenios_autorizador[action.index].id_convenio_autorizador;
      const newVal =
        action.item.value instanceof Function
          ? action.item.value(currVal)
          : action.item.value;
      if (currVal === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.convenios_autorizador[action.index].id_convenio_autorizador =
        newVal;
      return clone;
    }
    case "estado_convenio": {
      const currVal = state.convenios_autorizador[action.index].estado_convenio;
      const newVal =
        action.item.value instanceof Function
          ? action.item.value(currVal)
          : action.item.value;
      if (currVal === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.convenios_autorizador[action.index].estado_convenio = newVal;
      return clone;
    }
    default:
      throw new Error("Action not suported");
  }
};

const compareConveniosAuto = (
  prev: ConveniosAutorizador,
  curr: ConveniosAutorizador
) =>
  [
    prev.pk_fk_id_autorizador === curr.pk_fk_id_autorizador,
    prev.id_convenio_autorizador === curr.id_convenio_autorizador,
    prev.estado_convenio === curr.estado_convenio,
  ].every(Boolean);

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

    case DESCRIPCION_CONVENIO: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.descripcion_convenio)
          : action.value;
      if (state.descripcion_convenio === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.descripcion_convenio = newVal;
      return clone;
    }

    case NIT: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.nit)
          : action.value;
      if (state.nit === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.nit = newVal;
      return clone;
    }

    case TAGS_ADD: {
      const clone = structuredClone(state);
      clone.tags.push("");
      return clone;
    }
    case TAGS_REMOVE: {
      const clone = structuredClone(state);
      clone.tags.splice(action.index, 1);
      return clone;
    }
    case TAGS_EDIT: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.tags[action.index])
          : action.value;
      if (state.tags[action.index] === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.tags.splice(action.index, 1, newVal);
      return clone;
    }
    case TAGS_EDIT_ALL: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.tags)
          : action.value;
      if (
        state.tags.reduce(
          (prev, curr, index) => prev && curr === newVal[index],
          !!state.tags.length
        )
      ) {
        return state;
      }
      const clone = structuredClone(state);
      clone.tags = structuredClone(newVal);
      return clone;
    }

    case EAN_ADD: {
      const clone = structuredClone(state);
      clone.ean.push("");
      return clone;
    }
    case EAN_REMOVE: {
      const clone = structuredClone(state);
      clone.ean.splice(action.index, 1);
      return clone;
    }
    case EAN_EDIT: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.ean[action.index])
          : action.value;
      if (state.ean[action.index] === newVal) {
        return state;
      }
      const clone = structuredClone(state);
      clone.ean.splice(action.index, 1, newVal);
      return clone;
    }
    case EAN_EDIT_ALL: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.ean)
          : action.value;
      if (
        state.ean.reduce(
          (prev, curr, index) => prev && curr === newVal[index],
          !!state.ean.length
        )
      ) {
        return state;
      }
      const clone = structuredClone(state);
      clone.ean = structuredClone(newVal);
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

    case CONVENIOS_AUTORIZADOR_ADD: {
      const clone = structuredClone(state);
      clone.convenios_autorizador.push({
        pk_fk_id_autorizador: "",
        id_convenio_autorizador: "",
        estado_convenio: true,
      });
      return clone;
    }
    case CONVENIOS_AUTORIZADOR_REMOVE: {
      const clone = structuredClone(state);
      clone.convenios_autorizador.splice(action.index, 1);
      return clone;
    }
    case CONVENIOS_AUTORIZADOR_EDIT_ITEM: {
      return changeConvenioAuto(state, action);
    }
    case CONVENIOS_AUTORIZADOR_EDIT: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.convenios_autorizador[action.index])
          : action.value;
      if (
        compareConveniosAuto(state.convenios_autorizador[action.index], newVal)
      ) {
        return state;
      }
      const clone = structuredClone(state);
      clone.convenios_autorizador.splice(action.index, 1, newVal);
      return clone;
    }
    case CONVENIOS_AUTORIZADOR_EDIT_ALL: {
      const newVal =
        action.value instanceof Function
          ? action.value(state.convenios_autorizador)
          : action.value;
      if (
        state.convenios_autorizador.reduce(
          (prev, curr, index) =>
            prev && compareConveniosAuto(curr, newVal[index]),
          !!state.convenios_autorizador.length
        )
      ) {
        return state;
      }
      const clone = structuredClone(state);
      clone.convenios_autorizador = structuredClone(newVal);
      return clone;
    }

    case SET_ALL: {
      const newVal =
        action.value instanceof Function ? action.value(state) : action.value;

      if (
        [
          state.pk_id_convenio === newVal.pk_id_convenio,
          state.nombre_convenio === newVal.nombre_convenio,
          state.descripcion_convenio === newVal.descripcion_convenio,
          state.estado === newVal.estado,
          state.tags.reduce(
            (prev, curr, index) => prev && curr === newVal.tags[index],
            !!state.tags.length
          ),
          state.ean.reduce(
            (prev, curr, index) => prev && curr === newVal.ean[index],
            !!state.ean.length
          ),
          state.convenios_autorizador.reduce(
            (prev, curr, index) =>
              prev &&
              compareConveniosAuto(curr, newVal.convenios_autorizador[index]),
            !!state.convenios_autorizador.length
          ),
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
