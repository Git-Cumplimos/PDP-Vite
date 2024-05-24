import fetchData from "../../../utils/fetchData";

const urlRegistroCliente =  `${process.env.REACT_APP_URL_PinesVus}`;

export const guardarCliente = async (bodyCliente) => {
    if (!bodyCliente) {
        throw new Error("sin datos de cliente", { cause: "custom" });
    }
    
    try {
        const res = await fetchData(
        `${urlRegistroCliente}/registroClientes`,
        "POST",
        {},
        bodyCliente
        );
        if (!res?.status) {
        if (res?.msg) {
            throw new Error(
            res?.obj?.error_user_msg ?? res?.msg ?? "",
            { cause: "custom" }
            );
        }
    
        throw new Error(res, { cause: "custom" });
        }
        return res;
    } catch (err) {
        throw err;
    }
    };

