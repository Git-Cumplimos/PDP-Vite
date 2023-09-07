import { useState } from "react";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../TypeDinamic";
import { fetchCustom } from "../utils/utils";

const urlRecargasDefault = `http://127.0.0.1:5000/backend-telefonia-movil_broker/manege`;

export const useBackendRecargasDefault = (
  name_operador: string,
  autorizador: string,
  module_: string
) => {
  const [statePeticion, setStatePeticion] = useState(false);
  const PeticionRecargar = async (
    dataInputPromises: TypeInputPromisesRecargas
  ): Promise<TypeOutputDataRecargas> => {
    setStatePeticion(true);
    let response = {
      status: false,
      ticket: {},
    };
    let fetchResult;

    try {
      const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
      const url = `${urlRecargasDefault}/${autorizador}/${module_}/default`;
      const params = {
        operador: name_operador,
      };
      const body = {
        id_uuid_trx: dataInputPromises.id_uuid,
        comercio: {
          id_comercio: dataInputPromises.roleInfo.id_comercio,
          id_terminal: dataInputPromises.roleInfo.id_dispositivo,
          id_usuario: dataInputPromises.roleInfo.id_usuario,
          nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
          nombre_usuario: dataInputPromises.pdpUser?.uname,
          oficina_propia:
            tipo_comercio.search("KIOSCO") >= 0 ||
            tipo_comercio.search("OFICINAS PROPIAS") >= 0
              ? true
              : false,
          location: {
            address: dataInputPromises.roleInfo.direccion,
            city: dataInputPromises.roleInfo.ciudad,
            code_dane: dataInputPromises.roleInfo.codigo_dane,
          },
        },
        module_info: {
          celular: dataInputPromises.moduleInfo.celular,
          valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
        },
        parameters_operador: dataInputPromises.parameters_operador,
        parameters_submodule: dataInputPromises.parameters_submodule,
      };
      fetchResult = await PeticionInd(
        url,
        `Telefonia movil - ${autorizador} - ${module}`,
        params,
        body
      );
    } catch (error: any) {
      setStatePeticion(false);
      throw error;
    }
    setStatePeticion(false);
    return response;
  };

  const PeticionInd = async (
    url_: string,
    name: string,
    params_: { [key: string]: any },
    body_: { [key: string]: any }
  ): Promise<any> => {
    return await fetchCustom(url_, "PUT", name, params_, body_);
  };

  return [statePeticion, PeticionRecargar];
};
