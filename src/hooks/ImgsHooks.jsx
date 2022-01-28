import { createContext, useContext, useEffect, useReducer } from "react";

import { images, svgs } from "../utils/AssetsObjects";
import { getFromBucket } from "../utils/S3utility";

// Funciones
const S3_BUCKET = process.env.REACT_APP_BUCKET_CMS;

const loadResource = async (url) => {
  try {
    return await getFromBucket(S3_BUCKET, url);
  } catch (err) {
    console.error(err);
  }
};

const initialImgs = {
  imgs: images,
  svgs: svgs,
};

const FETCH_IMGS = "FETCH_IMGS";
const SET_IMGS = "SET_IMGS";
const FETCH_SVGS = "FETCH_SVGS";
const SET_SVGS = "SET_SVGS";

const reducerImgs = (state, action) => {
  const { type: _type, payload } = action;
  switch (_type) {
    case SET_IMGS:
      return { ...state, imgs: { ...state.imgs, [payload.name]: payload.img } };

    case SET_SVGS:
      return { ...state, svgs: { ...state.svgs, [payload.name]: payload.svg } };

    case FETCH_IMGS:
      for (const [key, val] of Object.entries(images)) {
        loadResource(val)
          .then((url) =>
            payload.dispatch({
              type: SET_IMGS,
              payload: { name: key, img: url },
            })
          )
          .catch(() => {});
      }
      return state;

    case FETCH_SVGS:
      for (const [key, val] of Object.entries(svgs)) {
        loadResource(val)
          .then((url) =>
            payload.dispatch({
              type: SET_SVGS,
              payload: { name: key, svg: url },
            })
          )
          .catch(() => {});
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
  }, []);
  return assets;
};