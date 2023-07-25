import fetchData from "../../../utils/fetchData";
const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
// const urlComercios = `http://127.0.0.1:5000`;


const buildGetFunction = (url) => {
    return async (args = {}) => {
        try {
            const res = await fetchData(url, "GET", args);
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
const buildPostFunction = (url) => {
    return async (body) => {
        if (!body) {
            throw new Error("Sin datos en el body", { cause: "custom" });
        }
        try {
            const res = await fetchData(url, "POST", {}, body);
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
const buildPutFunction = (url) => {
    return async (args, body) => {
        if (!args || !body) {
            throw new Error("Sin datos de busqueda y/o modificacion", {
                cause: "custom",
            });
        }
        try {
            console.log(body,"-------",args)
            const res = await fetchData(url, "PUT", args, body);
            if (!res?.status) {

                if (res?.obj?.error[0]?.complete_info?.nit) {
                    throw new Error(res?.obj?.error[0]?.complete_info?.nit, { cause: "custom" })
                }

                if (res?.msg) {
                    throw new Error(res?.msg, { cause: "custom" });
                }
                throw new Error(res, { cause: "custom" });
            }
            return res;
        } catch (err) {
            throw err;
        }
    };
};

export const getListCommerce = () => {
    return `${urlComercios}/comercios/comercios-permisos-broker`
};
export const updateCommerce = buildPutFunction(
    `${urlComercios}/comercios/comercios-permisos-broker`
)

export const getListPermissions = () => {
    return `${urlComercios}/comercios/permisos-broker`
};