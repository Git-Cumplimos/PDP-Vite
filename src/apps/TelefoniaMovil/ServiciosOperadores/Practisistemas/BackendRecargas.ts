import { useState } from "react";
import {
  TypeInputPromisesRecargas,
  TypeOutputDataRecargas,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import {
  defaultParamsError,
  fetchCustom,
} from "../../DynamicTelefoniaMovil/utils/utils";
import {
  FuctionEvaluateResponsePractisistemas,
  AcrominosPractisistemas,
} from "./utilsPractisistemas";

const urlRecargasCelular = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/recarga`;

export const useBackendRecargasPractisistemas = (
  name_operador: string,
  module: string
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
    //SECUENCIA ---------------trx-------------------------------
    try {
      const tipo_comercio = dataInputPromises.roleInfo.tipo_comercio;
      const infTicket = {
        title: "Recibo de pago",
        timeInfo: {
          "Fecha de pago": "fecha",
          Hora: "",
        },
        commerceInfo: [
          ["Id Comercio", dataInputPromises.roleInfo.id_comercio],
          ["No. terminal", dataInputPromises.roleInfo.id_dispositivo],
          ["Comercio", dataInputPromises.roleInfo["nombre comercio"]],
          ["", ""],
          ["Dirección", dataInputPromises.roleInfo.direccion],
          ["", ""],
        ],
        commerceName: "RECARGA",
        trxInfo: [
          ["Operador", name_operador],
          ["", ""],
        ],
        disclamer:
          "Para cualquier reclamo es indispensable presentar este recibo o comunicarse al teléfono en Bogotá 756 0417.",
      };

      let body = {
        comercio: {
          id_comercio: dataInputPromises.roleInfo.id_comercio,
          id_terminal: dataInputPromises.roleInfo.id_dispositivo,
          id_usuario: dataInputPromises.roleInfo.id_usuario,
          id_uuid_trx: dataInputPromises.id_uuid,
        },
        oficina_propia:
          tipo_comercio.search("KIOSCO") >= 0 ||
          tipo_comercio.search("OFICINAS PROPIAS") >= 0
            ? true
            : false,
        nombre_comercio: dataInputPromises.roleInfo["nombre comercio"],
        valor_total_trx: dataInputPromises.moduleInfo.valor_total_trx,
        ticket: infTicket,

        datosRecargas: {
          celular: dataInputPromises.moduleInfo.celular,
          operador: AcrominosPractisistemas[name_operador]?.recarga,
          valor: dataInputPromises.moduleInfo.valor_total_trx,
          jsonAdicional: {
            nombre_usuario: dataInputPromises.pdpUser?.uname,
            operador: name_operador,
          },
        },
      };

      fetchResult = await fetchCustom(
        urlRecargasCelular,
        "POST",
        `${name_operador} - registrar`,
        {},
        body,
        defaultParamsError,
        FuctionEvaluateResponsePractisistemas
      );
    } catch (error: any) {
      setStatePeticion(false);
      throw error;
    }
    setStatePeticion(false);
    return response;
  };

  return [statePeticion, PeticionRecargar];
};
