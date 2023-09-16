import React, { useCallback, useState } from "react";
import { fetchCustom } from "../../DynamicTelefoniaMovil/utils/utils";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../../DynamicTelefoniaMovil/TypeDinamic";

const url_recargar = "htpp";
export const useBackendRecargasClaro = (name_operador: string) => {
  const [statePeticionRecargar, setStatePeticionRecargar] =
    useState<boolean>(false);

  const PeticionRecargar = async (
    dataInputPromises: TypeInputPromisesRecargas
  ): Promise<TypeOutputDataRecargas> => {
    return {
      status: false,
      id_trx: null,
      ticket: null,
    };
  };
  // const PeticionRecargar = useCallback(
  //   async (dataInputPromises: TypeInputPromisesRecargas) => {
  //     const fetch_recargar = fetchCustom(
  //       `${url_recargar}/servicio-recargas/transaccion-recargar`,
  //       "POST",
  //       `${name_operador} - recargar`
  //     );
  //     let fetch_result;

  //     // //SECUENCIA -------Paso 1 - url_post_archivo_paquetes -------------------------------

  //     try {
  //       const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
  //       const body = {
  //         comercio: {
  //           id_comercio: dataInputPromises.roleInfo.id_comercio,
  //           id_usuario: dataInputPromises.roleInfo.id_usuario,
  //           id_terminal: dataInputPromises.roleInfo.id_dispositivo,
  //         },
  //         nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
  //         nombre_usuario: dataInputPromises.pdpUser.uname,
  //         oficina_propia:
  //           tipo_comercio.search("KIOSCO") >= 0 ||
  //           tipo_comercio.search("OFICINAS PROPIAS") >= 0
  //             ? true
  //             : false,
  //         id_uuid_trx: "12434545",
  //         valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
  //         celular: dataInputPromises.moduleInfo.celular,
  //       };
  //       // fetch_result = await fetch_recargar({}, body);
  //       // return {
  //       //   status: fetch_result?.status,
  //       //   ticket: fetch_result?.obj?.result?.ticket,
  //       // };
  //     } catch (error) {
  //       console.log();
  //       // throw error;
  //     }
  //   },
  //   []
  // );

  return [statePeticionRecargar, PeticionRecargar];
};
