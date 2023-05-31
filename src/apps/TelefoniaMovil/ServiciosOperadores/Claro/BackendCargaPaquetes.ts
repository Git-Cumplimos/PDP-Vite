import React, { useCallback, useState } from "react";
import { fetchCustom } from "../../DynamicTelefoniaMovil/utils/utils";

const url_cargar_paquetes = "ggg";
export const useBackendCargaPaquetes = (name_operador: string) => {
  const [statePeticionSubirArchivo, setStatePeticionSubirArchivo] =
    useState<boolean>(false);

  const PeticionSubirArchivo = useCallback(
    async (params_ = {}) => {
      const fetch_post_archivo_paquetes = fetchCustom(
        `${url_cargar_paquetes}/url-post-archivo-paquetes`,
        "GET",
        `${name_operador} - url_post_archivo_paquetes'`
      );
      let fetch_result;

      //SECUENCIA -------Paso 1 - url_post_archivo_paquetes -------------------------------
      // try {
      //   fetch_result = await fetch_post_archivo_paquetes(params_, {});
      // } catch (error) {
      //   throw error;
      // }
    },
    [name_operador]
  );

  return [setStatePeticionSubirArchivo, PeticionSubirArchivo];
};
