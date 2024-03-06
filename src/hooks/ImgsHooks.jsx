import { createContext, useContext, useEffect, useReducer } from "react";

import { images, svgs, banners } from "../utils/AssetsObjects";

const initialImgs = {
  imgs: images,
  svgs: svgs,
  banners: banners,
};

const FETCH_IMGS = "FETCH_IMGS";
const SET_IMGS = "SET_IMGS";
const DELETE_IMGS = "DELETE_IMGS";
const FETCH_SVGS = "FETCH_SVGS";
const SET_SVGS = "SET_SVGS";
const DELETE_SVGS = "DELETE_SVGS";
const FETCH_BANNERS = "FETCH_BANNERS";
const SET_BANNERS = "SET_BANNERS";
const DELETE_BANNERS = "DELETE_BANNERS";

const reducerImgs = (state, action) => {
  const { type: _type, payload } = action;
  switch (_type) {
    case SET_IMGS:
      return { ...state, imgs: { ...state.imgs, [payload.name]: payload.img } };

    case DELETE_IMGS:
      const newImgs = structuredClone(state.imgs);
      delete newImgs[payload.name];
      return {
        ...state,
        banners: newImgs,
      };

    case SET_BANNERS:
      return {
        ...state,
        banners: { ...state.banners, [payload.name]: payload.banner },
      };

    case DELETE_BANNERS:
      const newBanners = structuredClone(state.banners);
      delete newBanners[payload.name];
      return {
        ...state,
        banners: newBanners,
      };

    case SET_SVGS:
      return { ...state, svgs: { ...state.svgs, [payload.name]: payload.svg } };

    case DELETE_SVGS:
      const newSvgs = structuredClone(state.svgs);
      delete newSvgs[payload.name];
      return {
        ...state,
        banners: newSvgs,
      };

    case FETCH_IMGS:
      for (const [key, val] of Object.entries(images)) {
        payload.dispatch({
          type: SET_IMGS,
          payload: { name: key, img: val },
        });
      }
      return state;

    case FETCH_BANNERS:
      for (const [key, val] of Object.entries(banners)) {
        checkImage(val)
          .then(() => {
            payload.dispatch({
              type: SET_BANNERS,
              payload: { name: key, banner: val },
            });
          })
          .catch(() => {
            payload.dispatch({
              type: DELETE_BANNERS,
              payload: { name: key },
            });
          });
      }
      return state;

    case FETCH_SVGS:
      for (const [key, val] of Object.entries(svgs)) {
        payload.dispatch({
          type: SET_SVGS,
          payload: { name: key, svg: val },
        });
      }
      return state;

    default:
      throw new Error(`Bad action ${JSON.stringify(action, null, 2)}`);
  }
};

// Context
export const ImgsContext = createContext({
  ...initialImgs,
});

export const useImgs = () => {
  return useContext(ImgsContext);
};

export const useProvideImgs = () => {
  const [assets, dispatchImgs] = useReducer(reducerImgs, initialImgs);
  useEffect(() => {
    dispatchImgs({ type: FETCH_IMGS, payload: { dispatch: dispatchImgs } });
    dispatchImgs({ type: FETCH_SVGS, payload: { dispatch: dispatchImgs } });
    dispatchImgs({ type: FETCH_BANNERS, payload: { dispatch: dispatchImgs } });
  }, []);
  return assets;
};

export const useProvideImgsWithDispatch = () => {
  const assets = useProvideImgs();
  const [_, dispatchImgs] = useReducer(reducerImgs, initialImgs);
  useEffect(() => {
    dispatchImgs({ type: FETCH_IMGS, payload: { dispatch: dispatchImgs } });
    dispatchImgs({ type: FETCH_SVGS, payload: { dispatch: dispatchImgs } });
    dispatchImgs({ type: FETCH_BANNERS, payload: { dispatch: dispatchImgs } });
  }, []);

  return { assets, dispatchImgs };
};

const checkImage = (url) =>
  new Promise((resolve, reject) => {
    const load_banners = new Image();
    load_banners.src = url;
    load_banners.onload = () => resolve(url);
    load_banners.onerror = () => reject("Imagen no encontrada");
  });
