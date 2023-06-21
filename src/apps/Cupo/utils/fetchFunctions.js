import fetchData from "../../../utils/fetchData";

const urlCupo = `${process.env.REACT_APP_URL_SERVICIOS_CUPO_COMERCIO}`;
// const urlCupo = `http://127.0.0.1:5080`;

const buildGetFunction = (url) => {
    return async (args = {}) => {
      try {
        const new_args = Object.fromEntries(Object.entries(args).filter(([key,value])=>value !=='' && value !== null))
        const res = await fetchData(url, "GET", new_args);
        if (!res?.status) {
            if (res?.msg) {
            throw new Error(res?.msg, { cause: "custom" });
            }
            throw new Error(res, { cause: "custom" });
        }
        return res;
      } catch (err) {
        throw err
      }
    };
  };

export const getConsultaComercios = buildGetFunction(
    `${urlCupo}/servicio-cupo/cupo-paginated`
  );
export const getConsultaCupoComercio = buildGetFunction(
    `${urlCupo}/servicio-cupo/cupo-disponible`
  );