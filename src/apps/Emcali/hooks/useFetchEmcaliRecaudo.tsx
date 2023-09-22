import { useCallback, useState } from "react";
import {
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  fetchCustom,
} from "../utils/utils";
import { TypeServicesBackendEmcali } from "../utils/typing";

//--------- Constantes ------------------
const name_hook = "useFetchEmcali";

//--------- Typing ------------------
type TypeSubInf = {
  url: string;
  name: string;
  method: "POST" | "PUT" | "GET";
};

export type TypeInf = {
  barcode: TypeSubInf;
  consult: TypeSubInf;
  pay: TypeSubInf;
};

//---------  hook ------------------
export const useFetchEmcaliRecaudo = (infServices: TypeInf) => {
  const [loadingPeticion, setLoadingPeticion] = useState<boolean>(false);

  const PeticionBarcode = useCallback(
    async (body: { [key: string]: any }): Promise<any> => {
      setLoadingPeticion(true);
      let peticion;
      //SECUENCIA - realizar fetch custom
      try {
        peticion = await fetchCustom(
          infServices.barcode.url,
          infServices.barcode.method,
          infServices.barcode.name,
          {},
          body
        );
      } catch (error: any) {
        setLoadingPeticion(false);
        if (!(error instanceof ErrorCustomFetch)) {
          const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServices.barcode.name}) [0010002]`;
          const errorSequence = `${name_hook} - realizar fetch custom`;
          console.error({
            "Error PDP": errorPdp,
            "Error Sequence": errorSequence,
            "Error Console": `${error.message}`,
          });
          throw new ErrorCustomUseHookCode(
            errorPdp,
            `${error.message}`,
            errorSequence
          );
        } else {
          throw error;
        }
      }
      setLoadingPeticion(false);
      return peticion;
    },
    [infServices.barcode]
  );

  const PeticionConsult = useCallback(
    async (body: { [key: string]: any }): Promise<any> => {
      setLoadingPeticion(true);
      let peticion;
      //SECUENCIA - realizar fetch custom
      try {
        peticion = await fetchCustom(
          infServices.consult.url,
          infServices.consult.method,
          infServices.consult.name,
          {},
          body
        );
      } catch (error: any) {
        setLoadingPeticion(false);
        if (!(error instanceof ErrorCustomFetch)) {
          const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServices.consult.name}) [0010002]`;
          const errorSequence = `${name_hook} - realizar fetch custom`;
          console.error({
            "Error PDP": errorPdp,
            "Error Sequence": errorSequence,
            "Error Console": `${error.message}`,
          });
          throw new ErrorCustomUseHookCode(
            errorPdp,
            `${error.message}`,
            errorSequence
          );
        } else {
          throw error;
        }
      }
      setLoadingPeticion(false);
      return peticion;
    },
    [infServices.consult]
  );

  const PeticionPay = useCallback(
    async (body: {
      [key: string]: any;
    }): Promise<TypeServicesBackendEmcali> => {
      setLoadingPeticion(true);
      let peticion;
      //SECUENCIA - realizar fetch custom
      try {
        peticion = await fetchCustom(
          infServices.pay.url,
          infServices.pay.method,
          infServices.pay.name,
          {},
          body
        );
      } catch (error: any) {
        setLoadingPeticion(false);
        if (!(error instanceof ErrorCustomFetch)) {
          const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServices.pay.name}) [0010002]`;
          const errorSequence = `${name_hook} - realizar fetch custom`;
          console.error({
            "Error PDP": errorPdp,
            "Error Sequence": errorSequence,
            "Error Console": `${error.message}`,
          });
          throw new ErrorCustomUseHookCode(
            errorPdp,
            `${error.message}`,
            errorSequence
          );
        } else {
          throw error;
        }
      }
      setLoadingPeticion(false);
      return peticion;
    },
    [infServices.pay]
  );

  return [
    loadingPeticion,
    PeticionBarcode,
    PeticionConsult,
    PeticionPay,
  ] as const;
};
