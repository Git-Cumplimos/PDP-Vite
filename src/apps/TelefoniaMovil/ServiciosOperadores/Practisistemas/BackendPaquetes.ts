import { useState } from "react"
import { TypeInputPromisesPaquetes, TypeOutputDataPaquetes } from "../../DynamicTelefoniaMovil/TypeDinamic";
import { fetchCustom } from "../../DynamicTelefoniaMovil/utils/utils";

const  url_get_paquetes="gggg"
export const useBackendPaquetesPractisistemas = (
    name_operador:string,
    module:string
)=> {
    const [statePeticion,setStatePeticion]= useState(false);
    
    const PeticionGetPaquetes = async (
        dataInputPromises: TypeInputPromisesPaquetes
    ): Promise<TypeOutputDataPaquetes> =>{
        let fetchGetPaquetesResult;
        let response ={
            maxElems:1,
            maxPages:1,
            results:[],
        };

        try {
            const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
      
            fetchGetPaquetesResult = await fetchCustom(
              url_get_paquetes,
              "GET",
              `${name_operador} - consultar paquetes`,
              {}
            );
            return {
              maxElems: fetchGetPaquetesResult?.obj?.result?.maxElems,
              maxPages: fetchGetPaquetesResult?.obj?.result?.maxPages,
              results: fetchGetPaquetesResult?.obj?.result?.results,
            };
          } catch (error: any) {
            // throw error;
          }

          return response;

    };
    return [statePeticion, PeticionGetPaquetes];
}