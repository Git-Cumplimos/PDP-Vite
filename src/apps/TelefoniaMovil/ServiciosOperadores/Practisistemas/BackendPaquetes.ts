import { useState } from "react";
import {
  TypeInputDataGetPaquetes,
  TypeInputTrxPaquetes,
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
} from "../../DynamicTelefoniaMovil/TypeDinamic";
import {
  defaultParamsError,
  fetchCustom,
} from "../../DynamicTelefoniaMovil/utils/utils";
import { FuctionEvaluateResponsePractisistemas } from "./utilsPractisistemas";
import { toPhoneNumber } from "../../../../utils/functions";
import { formatMoney } from "../../../../components/Base/MoneyInput";

const AcrominoPractisistemasPaquetes: {
  [key: string]: { [key: string]: string };
} = {
  Tigo: { pi: "Paquetigos Combos", pv: "Paquetigos Voz Sms", pb: "Bolsa Tigo" },
  WOM: { pw: "Paquetes WOM" },
  Exito: { pe: "Paquetes Exito" },
  Virgin: { vp: "Virgin Paquetes" },
  Avantel: { ap: "Paquetes Avantel" },
  Etb: { ep: "Paquetes ETB" },
  Buenofon: { pb: "Buenofon Paquetes" },
};

const url_get_paquetes = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/paquetes`;
const url_trx_paquetes = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/recarga`;

export const useBackendPaquetesPractisistemas = (
  name_operador: string,
  module: string
) => {
  const [loadingPeticion, setLoadingPeticion] = useState({
    getPaquetes: false,
    trx: false,
  });

  const PeticionGetPaquetes = async (
    dataInput: TypeInputDataGetPaquetes
  ): Promise<TypeOutputDataGetPaquetes> => {
    setLoadingPeticion((old) => ({ ...old, getPaquetes: true }));
    let response: any = {
      maxElems: 1,
      maxPages: 1,
      results: [],
    };

    try {
      const productosOperador = AcrominoPractisistemasPaquetes[name_operador];
      const nameProductosOperador = Object.keys(productosOperador);
      let results: any[] = [];
      for (let i = 0; i < nameProductosOperador.length; i++) {
        const body = {
          idcomercio: dataInput.roleInfo.id_comercio,
          limit: dataInput.moduleInfo.limit,
          page: dataInput.moduleInfo.page,
          producto: nameProductosOperador[i],
        };
        const fetchCustomResult = await fetchCustom(
          url_get_paquetes,
          "POST",
          `${name_operador} - consultar paquetes`,
          {},
          body
        );

        let date = fetchCustomResult?.obj?.response?.data;
        const estructua = date?.map((info: any) => {
          const info_ = info[Object.keys(info)[0]];
          return {
            codigo: info_?.internalCod,
            tipo: productosOperador[nameProductosOperador[i]],
            descripcion: info_?.productDesc,
            valor: info_?.cost,
            additional: { ...info_ },
          };
        });
        results.push(...estructua);
      }
      response = {
        maxElems: 2,
        maxPages: 2,
        results: results,
      };
    } catch (error: any) {
      setLoadingPeticion((old) => ({ ...old, getPaquetes: false }));
      throw error;
    }
    setLoadingPeticion((old) => ({ ...old, getPaquetes: false }));
    return response;
  };

  const PeticionTrx = async (
    dataInput: TypeInputTrxPaquetes
  ): Promise<TypeOutputTrxPaquetes> => {
    console.log(dataInput);
    let response = {
      status: false,
      ticket: {},
    };
    let fetchResult;
    //SECUENCIA ---------------trx-------------------------------
    try {
      setLoadingPeticion((old) => ({ ...old, trx: true }));
      const tipo_comercio = dataInput.roleInfo.tipo_comercio;
      const infTicket = {
        title: "Recibo de pago",
        timeInfo: {
          "Fecha de pago": "01/06/2023",
          Hora: "15:57:58",
        },
        commerceInfo: [
          ["Id Comercio", dataInput.roleInfo.id_comercio],
          ["No. terminal", dataInput.roleInfo.id_dispositivo],
          ["Comercio", dataInput.roleInfo["nombre comercio"]],
          ["", ""],
          ["Municipio", dataInput.roleInfo.ciudad],
          ["", ""],
          ["Dirección", dataInput.roleInfo.direccion],
          ["", ""],
        ],
        commerceName: `Comprar Paquete ${name_operador}`,
        trxInfo: [
          [
            "Número celular",
            toPhoneNumber(dataInput.moduleInfo.celular.toString()),
          ],
          ["", ""],
          ["Valor paquete", formatMoney.format(dataInput.moduleInfo.valor)],
          ["", ""],
          ["Descripción", dataInput.moduleInfo.descripcion],
          ["", ""],
        ],
        disclamer:
          "Para cualquier reclamo es indispensable presentar este recibo o comunicarse al teléfono en Bogotá 756 0417.",
      };

      let body = {
        comercio: {
          id_comercio: dataInput.roleInfo.id_comercio,
          id_terminal: dataInput.roleInfo.id_dispositivo,
          id_usuario: dataInput.roleInfo.id_usuario,
          id_uuid_trx: dataInput.id_uuid,
        },
        oficina_propia:
          tipo_comercio.search("KIOSCO") >= 0 ||
          tipo_comercio.search("OFICINAS PROPIAS") >= 0
            ? true
            : false,
        nombre_comercio: dataInput.roleInfo["nombre comercio"],
        valor_total_trx: 1000,
        ticket: infTicket,
        datosRecargas: {
          celular: dataInput.moduleInfo.celular,
          valor: dataInput.moduleInfo.codigo,
          jsonAdicional: {
            nombre_usuario: dataInput.pdpUser.uname,
            operador: dataInput.moduleInfo.tipo,
          },
          operador: dataInput.moduleInfo.additional.categoryId,
        },
      };

      fetchResult = await fetchCustom(
        url_trx_paquetes,
        "POST",
        `${name_operador} - registrar`,
        {},
        body,
        defaultParamsError,
        FuctionEvaluateResponsePractisistemas
      );
      console.log(fetchResult);
    } catch (error: any) {
      setLoadingPeticion((old) => ({ ...old, trx: false }));
      throw error;
    }
    setLoadingPeticion((old) => ({ ...old, trx: false }));
    return response;
  };
  return [loadingPeticion, PeticionGetPaquetes, PeticionTrx];
};