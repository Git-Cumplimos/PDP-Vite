import fetchData from "../../../utils/fetchData";

const urlRegistroTrx =  `${process.env.REACT_APP_URL_PinesVus}`;

export const registroTrx = async (bodyTrx) => {
    if (!bodyTrx) {
        throw new Error("sin datos de transacción", { cause: "custom" });
    }
    
    try {
        const res = await fetchData(
        `${urlRegistroTrx}/pines_examenes`,
        "POST",
        {},
        bodyTrx
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

