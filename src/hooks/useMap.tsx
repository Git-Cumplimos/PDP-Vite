import { Dispatch, Reducer, useReducer, useRef } from "react";

export type MapOrEntries<K, V> =
  | Map<K, V>
  | Iterable<readonly [K, V]>
  | readonly (readonly [K, V])[]
  | null;

export type ACTIONTYPE<K, V> =
  | { type: "SET"; key: K; value: V | ((old?: V) => V) }
  | {
      type: "SET_ALL";
      entries:
        | MapOrEntries<K, V>
        | ((old: MapOrEntries<K, V>) => MapOrEntries<K, V>);
    }
  | { type: "REMOVE"; key: K }
  | { type: "CLEAR" };

export type Actions<K, V> = {
  set: (key: K, value: V | ((old?: V) => V)) => void;
  setAll: (
    entries:
      | MapOrEntries<K, V>
      | ((old: MapOrEntries<K, V>) => MapOrEntries<K, V>)
  ) => void;
  remove: (key: K) => void;
  clear: Map<K, V>["clear"];
};

type Return<K, V> = readonly [
  Omit<Map<K, V>, "set" | "clear" | "delete">,
  Actions<K, V>,
  Dispatch<ACTIONTYPE<K, V>>
];

function mapReducer<K, V>(state: Map<K, V>, action: ACTIONTYPE<K, V>) {
  const newMap = new Map(state);
  switch (action.type) {
    case "SET":
      const newVal =
        action.value instanceof Function
          ? action.value(new Map(state).get(action.key))
          : action.value;
      if (state.get(action.key) === newVal) {
        return state;
      }
      return new Map(state).set(action.key, newVal);
    case "SET_ALL":
      const newEntries =
        action.entries instanceof Function
          ? action.entries(state)
          : action.entries;
      if (state === newEntries) {
        return state;
      }
      return new Map(newEntries);
    case "REMOVE":
      newMap.delete(action.key);
      return newMap;
    case "CLEAR":
      newMap.clear();
      return newMap;

    default:
      throw new Error("Action not suported");
  }
}

function useMap<K, V>(initialValue?: MapOrEntries<K, V>): Return<K, V> {
  const [map, dispatch] = useReducer<
    Reducer<Map<K, V>, ACTIONTYPE<K, V>>,
    Map<K, V>
  >(mapReducer, new Map(initialValue), (arg) => new Map(arg));

  const actions = useRef({
    set: (key: K, value: V | ((old?: V) => V)) =>
      dispatch({ type: "SET", key, value }),
    setAll: (
      entries:
        | MapOrEntries<K, V>
        | ((old: MapOrEntries<K, V>) => MapOrEntries<K, V>)
    ) => dispatch({ type: "SET_ALL", entries }),
    remove: (key: K) => dispatch({ type: "REMOVE", key }),
    clear: () => dispatch({ type: "CLEAR" }),
  });

  return [map, actions.current, dispatch] as const;
}

export default useMap;
