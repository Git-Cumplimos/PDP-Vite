import { createContext, useContext, useEffect, useReducer } from "react";

import { images, svgs, banners } from "../utils/AssetsObjects";

const initialImgs = {
  imgs: images,
  svgs: svgs,
  banners: banners,
};

const FETCH_IMGS = "FETCH_IMGS";
const SET_IMGS = "SET_IMGS";
const FETCH_SVGS = "FETCH_SVGS";
const SET_SVGS = "SET_SVGS";
const FETCH_BANNERS = "FETCH_BANNERS";
const SET_BANNERS = "SET_BANNERS";

const reducerImgs = (state, action) => {
  const { type: _type, payload } = action;
  switch (_type) {
    case SET_IMGS:
      return { ...state, imgs: { ...state.imgs, [payload.name]: payload.img } };
    
    case SET_BANNERS:
      return { ...state, imgs: { ...state.imgs, [payload.name]: payload.img } };

    case SET_SVGS:
      return { ...state, svgs: { ...state.svgs, [payload.name]: payload.svg } };

    case FETCH_IMGS:
      for (const [key, val] of Object.entries(images)) {
        payload.dispatch({
          type: SET_IMGS,
          payload: { name: key, img: val },
        });
      }
      return state;
    
    case FETCH_BANNERS:
      for (const [key, val] of Object.entries(images)) {
        payload.dispatch({
          type: SET_BANNERS,
          payload: { name: key, img: val },
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
    dispatchImgs({ type: FETCH_BANNERS, payload: { dispatch: dispatchImgs } });
    dispatchImgs({ type: FETCH_SVGS, payload: { dispatch: dispatchImgs } });
  }, []);
  return assets;
};
