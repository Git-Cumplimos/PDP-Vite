import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import Input from "../../../../components/Base/Input";
import { searchHistorico, buscarPlataformaExt } from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  makeDateFormatter,
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useReactToPrint } from "react-to-print";
import TicketCierre from "./TicketCierre";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);
let Num = 0;

const PanelHistorico = () => {
  const [receipt, setReceipt] = useState([]);
  const [pageData, setPageData] = useState({});
  const [maxPages, setMaxPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [disablereport, setDisablereport] = useState(false);
  const [resumenCierre, setResumenCierre] = useState(null);
  const [searchInfo, setSearchInfo] = useState({
    id_usuario: "",
    id_comercio: "",
    date_ini: "",
    date_end: "",
    totaldata: "",
  });
  const [dataPlfExt, setDataPlfExt] = useState(null);

  const CloseModal = useCallback(() => {
    setResumenCierre(null);
    Num = 0;
  }, []);

  const buscarPlataforma = useCallback(() => {
    buscarPlataformaExt({ totaldata: "1" })
      .then((res) => {
        const EntidadesExt = res.obj.results;
        let nomEntidades = "";
        const concatenados = EntidadesExt.map((elemento) =>
          nomEntidades.concat(elemento.pk_nombre_plataforma)
        );
        setDataPlfExt(concatenados);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, []);

  const buscarCierres = useCallback(() => {
    searchInfo.totaldata = 0;
    searchHistorico({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
      ),
      ...pageData,
    })
      .then((res) => {
        setReceipt(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  }, [searchInfo, pageData]);

  useEffect(() => {
    buscarCierres();
    buscarPlataforma();
  }, [buscarCierres, buscarPlataforma]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const cierreCaja = useCallback((data) => {
    data?.entidades_externas?.data?.map(
      (elemento) => (Num = Num + elemento?.valor)
    );
    let totalExtrdiaAnterior = 0
    if (data?.externos_día_anterior !== null) {
      data?.externos_día_anterior?.data?.map((elemento) => totalExtrdiaAnterior=totalExtrdiaAnterior+elemento?.valor)
    }
    const fecha = new Date(data.created);
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    const horaMilitar = `${hora < 10 ? "0" : ""}${hora}:${
      minutos < 10 ? "0" : ""
    }${minutos}:${segundos < 10 ? "0" : ""}${segundos}`;
    setLoading(false);
    const tempTicket = {
      title: "Cierre de caja",
      timeInfo: {
        "Fecha de cierre": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(data.created)),
        Hora: horaMilitar,
      },
      commerceInfo: [
        ["Id Comercio", data.id_comercio],
        ["No. Terminal", data.id_terminal],
        ["Id Cierre", data.pk_id_cierre],
        ["", ""],
        ["Comercio", data.nombre_comercio],
        ["", ""],
        ["Cajero", data.nombre_usuario],
        ["", ""],
      ],
      cajaInfo: [
        // [
        //   "Saldo Cierre día Anterior",
        //   formatMoney.format(
        //     Num <= 0
        //       ? data?.total_efectivo_cierre_día_anterior + Num
        //       : data?.total_efectivo_cierre_día_anterior - Num
        //   ),
        // ],
        [
          "Saldo PDP día anterior",
          formatMoney.format(data?.total_efectivo_cierre_día_anterior),
        ],
        ["", ""],
        ["Saldo Externos Día Anterior",formatMoney.format(totalExtrdiaAnterior)],
        ["", ""],
        ["Total cierre día anterior",formatMoney.format(data?.total_efectivo_cierre_día_anterior + totalExtrdiaAnterior)],
        ["", ""],
        [
          "Saldo PDP fin del día",
          formatMoney.format(
            data?.total_efectivo_en_caja + 
            data?.total_recibido_transportadora -
            data?.total_consignaciones_transportadora +
            data?.total_transferencias +
            data?.total_notas
          ),
        ],
        ["", ""],
        ["Saldo Externos Fin del Día",formatMoney.format(totalExtrdiaAnterior+Num)],
        ["", ""],
        ["Total Efectivo Del Cierre",formatMoney.format(
          data?.total_efectivo_en_caja + 
          data?.total_recibido_transportadora -
          data?.total_consignaciones_transportadora +
          data?.total_transferencias +
          data?.total_notas +
          totalExtrdiaAnterior +
          Num -
          data?.total_consignaciones_transportadora_externos
        ),],
        ["", ""],
        // [
        //   "Total Saldo Fin Del Día",
        //   formatMoney.format(data?.total_efectivo_en_caja),
        // ],
        // ["", ""],
      ],
      trxInfo: [
        ["Total Arqueo de Caja", formatMoney.format(data?.total_arqueo)],
        ["", ""],
        ["Sobrante", formatMoney.format(data?.total_sobrante)],
        ["", ""],
        ["Faltante", formatMoney.format(data?.total_faltante)],
        ["", ""],
        ["Transferencia Entre Cajeros", formatMoney.format(data?.total_transferencias)],
        ["", ""],
        [
          "Pendiente Consignaciones Bancarias y Transportadora",
          formatMoney.format(
            data?.total_consignaciones_transportadora_pendiente
          ),
        ],
        ["", ""],
        [
          "Pendiente Recibido Transportadora",
          formatMoney.format(data?.total_recibido_transportadora_pendiente),
        ],
        ["", ""],
        [
          "Consignaciones Bancarias y Transportadora",
          formatMoney.format(data?.total_consignaciones_transportadora),
        ],
        ["", ""],
        [
          "Recibido Transportadora",
          formatMoney.format(data?.total_recibido_transportadora),
        ],
        ["", ""],
        ["Notas Débito o Crédito", formatMoney.format(data?.total_notas)],
        ["", ""],
        ["Total Plataformas Externa", formatMoney.format(Num)],
        ["", ""],
      ],
    };
    // data?.entidades_externas?.data?.map((elemento) =>
    //   tempTicket.trxInfo.push([
    //     elemento?.pk_nombre_plataforma,
    //     formatMoney.format(elemento?.valor)],["", ""])
    // )
    setResumenCierre(tempTicket);
  }, []);

  const handle = useCallback(
    (entidades) => {
      const fechaInicial = new Date(searchInfo.date_ini);
      const fechaFinal = new Date(searchInfo.date_end);
      let dias = Math.round(
        (fechaFinal.getTime() - fechaInicial.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (
        searchInfo.date_end !== "" &&
        searchInfo.date_ini !== "" &&
        dias < 15
      ) {
        setDisablereport(true);
        searchInfo.totaldata = 1;
        searchHistorico({
          ...Object.fromEntries(
            Object.entries(searchInfo).filter(([, val]) => val)
          ),
          ...pageData,
        })
          .then((res) => {
            console.log(res)
            const newData = [];
            res?.obj?.results?.map((itemData) => {
              var totalvalorEntidades = 0;
              var totalvalorEntidadesDiaAnterior = 0
              totalvalorEntidades = (
                itemData?.entidades_externas?.data ?? []
              ).reduce((total, val) => total + val.valor, 0);
              totalvalorEntidadesDiaAnterior= (itemData?.externos_día_anterior?.data?? []).reduce((total,val) => total+val.valor,0)
              const valJson = {
                Idcierre: itemData?.pk_id_cierre,
                Idcomercio: itemData?.id_comercio,
                NameComercio: itemData?.nombre_comercio,
                Idusuario: itemData?.id_usuario,
                NameUsuario: itemData?.nombre_usuario,
                SaldoPDPCierreDíaAnterior: formatCurrency(Math.round(itemData?.total_efectivo_cierre_día_anterior)),
                SaldoExternosDiaAnterior: formatCurrency(Math.round(totalvalorEntidadesDiaAnterior)),
                TotalCierreDiaAnterior: formatCurrency(Math.round(totalvalorEntidadesDiaAnterior + itemData?.total_efectivo_cierre_día_anterior)),
                SaldoPDPFinDia: formatCurrency(Math.round(itemData?.total_efectivo_en_caja +
                  itemData?.total_recibido_transportadora -
                  itemData?.total_consignaciones_transportadora +
                  itemData?.total_transferencias +
                  itemData?.total_notas)),
                SaldoExternosFinDia: formatCurrency(Math.round(totalvalorEntidadesDiaAnterior + totalvalorEntidades)),
                TotalEfectivoCierre: formatCurrency(Math.round(itemData?.total_efectivo_en_caja +
                  itemData?.total_recibido_transportadora -
                  itemData?.total_consignaciones_transportadora +
                  itemData?.total_transferencias +
                  itemData?.total_notas +
                  totalvalorEntidadesDiaAnterior + 
                  totalvalorEntidades +
                  itemData?.total_consignaciones_transportadora_externos
                )),
                // SaldoCierreDíaAnterior: Math.round(
                //   totalvalorEntidades <= 0
                //     ? itemData?.total_efectivo_cierre_día_anterior +
                //         totalvalorEntidades
                //     : itemData?.total_efectivo_cierre_día_anterior -
                //         totalvalorEntidades
                // ),
                // SaldoPDPExternosDia: Math.round(
                //   itemData?.total_movimientos + totalvalorEntidades
                // ),
                // TotalSaldoFinDia: Math.round(itemData?.total_efectivo_en_caja),
                TotalArqueoCaja: formatCurrency(Math.round(itemData?.total_arqueo)),
                Sobrante: formatCurrency(Math.round(itemData?.total_sobrante)),
                Faltante: formatCurrency(Math.round(itemData?.total_faltante)),
                TransferenciaEntreCajeros: formatCurrency(Math.round(itemData?.total_transferencias)),
                PendienteConsignacionTransportadoraPDP: formatCurrency(Math.round(
                  itemData?.total_consignaciones_transportadora_pendiente
                )),
                PendienteRecibidoTransportadora: formatCurrency(Math.round(
                  itemData?.total_recibido_transportadora_pendiente
                )),
                ConsignacionTransportadoraPDP: formatCurrency(Math.round(
                  itemData?.total_consignaciones_transportadora
                )),
                RecibidoTransportadora: formatCurrency(Math.round(
                  itemData?.total_recibido_transportadora
                )),
                notas: formatCurrency(Math.round(itemData?.total_notas)),
                Cantidad100000: itemData?.arqueo["100000"],
                Total100000: formatCurrency(Math.round(itemData?.arqueo["100000"] * 100000)),
                Cantidad50000: itemData?.arqueo["50000"],
                Total50000: formatCurrency(Math.round(itemData?.arqueo["50000"] * 50000)),
                Cantidad20000: itemData?.arqueo["20000"],
                Total20000: formatCurrency(Math.round(itemData?.arqueo["20000"] * 20000)),
                Cantidad10000: itemData?.arqueo["10000"],
                Total10000: formatCurrency(Math.round(itemData?.arqueo["10000"] * 10000)),
                Cantidad5000: itemData?.arqueo["5000"],
                Total5000: formatCurrency(Math.round(itemData?.arqueo["5000"] * 5000)),
                Cantidad2000: itemData?.arqueo["2000"],
                Total2000: formatCurrency(Math.round(itemData?.arqueo["2000"] * 2000)),
                Cantidad1000: itemData?.arqueo["1000"],
                Total1000: formatCurrency(Math.round(itemData?.arqueo["1000"] * 1000)),
                Cantidad500: itemData?.arqueo["500"],
                Total500: formatCurrency(Math.round(itemData?.arqueo["500"] * 500)),
                Cantidad200: itemData?.arqueo["200"],
                Total200: formatCurrency(Math.round(itemData?.arqueo["200"] * 200)),
                Cantidad100: itemData?.arqueo["100"],
                Total100: formatCurrency(Math.round(itemData?.arqueo["100"] * 100)),
                Cantidad50: itemData?.arqueo["50"],
                Total50: formatCurrency(Math.round(itemData?.arqueo["50"] * 50)),
              };
              entidades.map((val) => (valJson[val] = "0"));
              if (itemData.hasOwnProperty("entidades_externas")) {
                itemData?.entidades_externas?.data.map(
                  (val) => (valJson[val.pk_nombre_plataforma] = val.valor)
                );
              }
              valJson["Estado Cierre"] = "Realizado";
              valJson["Fecha_hora_cierre"] = dateFormatter
                .format(new Date(itemData.created))
                .replace(",", "");
              let nuevaCadena =
                valJson["Fecha_hora_cierre"].slice(0, 22) +
                valJson["Fecha_hora_cierre"].slice(23);
              valJson["Fecha_hora_cierre"] = nuevaCadena;
              newData.push(valJson);
            });
            const concatenadosParcil = entidades;
            const concatenadosFinal = concatenadosParcil.join(",");
            const headers = `Id cierre,Id comercio,Nombre Comercio,Id usuario,Nombre Usuario,Saldo PDP Dia Anterior,Saldo Externos Dia Anterior,Total Cierre Dia Anterior,Saldo PDP Fin Del Dia,Saldo Externos Fin Del Dia,Total Efectivo Del Cierre,Total Arqueo de Caja,Sobrante,Faltante,Pendiente Transferencia Entre Cajeros,Transferencia Entre Cajeros,Pendiente Consignaciones y Transportadora,Pendiente Recibido Transportadora,Consignaciones Bancarias y Transportadora,Recibido Transportadora,Notas Debito o Credito,Cantidad Denominacion de $100.000,Total Denominacion de $100.000,Cantidad Denominacion de $50.000,Total Denominacion de $50.000,Cantidad Denominacion de $20.000,Total Denominacion de $20.000,Cantidad Denominacion de $10.000,Total Denominacion de $10.000,Cantidad Denominacion de $5.000,Total Denominacion de $5.000,Cantidad Denominacion de $2.000,Total Denominacion de $2.000,Cantidad Denominacion de $1.000,Total Denominacion de $1.000,Cantidad Denominacion de $500,Total Denominacion de $500,Cantidad Denominacion de $200,Total Denominacion de $200,Cantidad Denominacion de $100,Total Denominacion de $100,Cantidad Denominacion de $50,Total Denominacion de $50,${concatenadosFinal},Estado Cierre,Fecha y Hora Cierre`;
            const main = newData.map((item) => {
              return Object.values(item).toString();
            });
            const csv = [headers, ...main].join("\n");
            const blob = new Blob([csv], { type: "application/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const now = Intl.DateTimeFormat("es-CO", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date());
            a.download = "Reporte Cierre de Caja " + now + ".csv";
            a.href = url;
            a.style.play = "none";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            setDisablereport(false);
          })
          .catch((err) => {
            setDisablereport(false);
            if (err?.cause === "custom") {
              notifyError(err?.message);
              return;
            }
            console.error(err?.message);
            notifyError("Peticion fallida");
          });
      } else {
        notifyError("Seleccione un rango de fecha no mayor a 15 días");
      }
    },
    [searchInfo, pageData]
  );

  function formatCurrency(value) {
    return '$ ' + Number(value).toLocaleString('es-ES');
  }

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            handle(dataPlfExt, receipt);
          }}
          disabled={disablereport}
        >
          Generar Reporte
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Históricos - Cierre de Caja"
        headers={[
          "ID cierre",
          "ID comercio",
          "Nombre Comercio",
          "ID usuario",
          "Nombre Usuario",
          "Saldo PDP Día Anterior",
          "Saldo Externos Día Anterior",
          "Total Cierre Día Anterior",
          "Saldo PDP Fin Del Día",
          "Saldo Externos Fin Del Día",
          "Total Efectivo Del Cierre",
          "Total Arqueo de Caja",
          "Sobrante",
          "Faltante",
          "Transferencia Entre Cajeros",
          "Pendiente Consignaciones Bancarias y Transportadora",
          "Pendiente Recibido Transportadora",
          "Consignaciones Bancarias y Transportadora",
          "Recibido Transportadora",
          "Notas Débito o Crédito",
          "Total Plataformas Externas",
          "Fecha y Hora Cierre",
        ]}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            pk_id_cierre,
            id_comercio,
            nombre_comercio,
            id_usuario,
            nombre_usuario,
            efectivo_cierre_día_anterior,
            total_efectivo_cierre_día_anterior,
            externos_día_anterior,
            total_efectivo_en_caja,
            total_fectivo_cierre,
            total_arqueo,
            total_sobrante,
            total_faltante,
            total_transferencias,
            total_consignaciones_transportadora_pendiente,
            total_recibido_transportadora_pendiente,
            total_consignaciones_transportadora,
            total_recibido_transportadora,
            total_notas,
            entidades_externas,
            created,
            // externos_día_anterior,
            // Saldo_Cierre_Dia_Anterior,
            total_consignaciones_transportadora_externos,
            // total_movimientos,
            externos_fin_dia,
          }) => ({
            pk_id_cierre,
            id_comercio,
            nombre_comercio,
            id_usuario,
            nombre_usuario,
            efectivo_cierre_día_anterior: formatMoney.format(
              total_efectivo_cierre_día_anterior
            ),
            externos_día_anterior: formatMoney.format(
              (externos_día_anterior?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              )
            ),
            total_efectivo_cierre_día_anterior: formatMoney.format(
              (entidades_externas?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              ) <= 0
                ? total_efectivo_cierre_día_anterior +
                    (entidades_externas?.data ?? []).reduce(
                      (total, val) => total + val.valor,
                      0
                    )
                : total_efectivo_cierre_día_anterior -
                    (entidades_externas?.data ?? []).reduce(
                      (total, val) => total + val.valor,
                      0
                    )
            ),
            total_efectivo_en_caja: formatMoney.format(
                total_efectivo_en_caja +
                total_recibido_transportadora -
                total_consignaciones_transportadora +
                total_transferencias +
                total_notas
            ),
            externos_fin_dia:formatMoney.format( 
              (externos_día_anterior?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              ) +
              (entidades_externas?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              )
            ),
            total_fectivo_cierre:formatMoney.format(
              total_efectivo_en_caja +
              total_recibido_transportadora -
              total_consignaciones_transportadora +
              total_transferencias +
              total_notas +
              (externos_día_anterior?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              ) +
              (entidades_externas?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              ) -
              total_consignaciones_transportadora_externos
            ),
            total_arqueo: formatMoney.format(total_arqueo),
            total_sobrante: formatMoney.format(total_sobrante),
            total_faltante: formatMoney.format(total_faltante),
            total_transferencias: formatMoney.format(total_transferencias),
            total_consignaciones_transportadora_pendiente: formatMoney.format(
              total_consignaciones_transportadora_pendiente
            ),
            total_recibido_transportadora_pendiente: formatMoney.format(
              total_recibido_transportadora_pendiente
            ),
            total_consignaciones_transportadora: formatMoney.format(
              total_consignaciones_transportadora
            ),
            total_recibido_transportadora: formatMoney.format(
              total_recibido_transportadora
            ),
            total_notas: formatMoney.format(total_notas),
            entidades_externas: formatMoney.format(
              (entidades_externas?.data ?? []).reduce(
                (total, val) => total + val.valor,
                0
              )
            ),
            created: dateFormatter.format(new Date(created)),
            // externos_día_anterior:formatMoney.format((externos_día_anterior?.data ?? []).reduce((total,val) =>  total+val.valor,0)),
            // Saldo_Cierre_Dia_Anterior: formatMoney.format(total_efectivo_cierre_día_anterior+((externos_día_anterior?.data ?? []).reduce((total,val) => total+val.valor,0)||0)),
            // total_efectivo_en_caja: formatMoney.format(total_efectivo_en_caja),
            // entidades_externas: formatMoney.format((entidades_externas?.data ?? []).reduce((total,val) => total+val.valor,0)),
            // total_arqueo: formatMoney.format(total_arqueo),
            // total_consignaciones_transportadora_externos: formatMoney.format(total_consignaciones_transportadora_externos),
          })
        )}
        onSetPageData={setPageData}
        onSelectRow={(_e, index) => {
          cierreCaja(receipt[index]);
        }}
      >
        <Input
          id="dateInit"
          name={"date_ini"}
          label="Fecha inicial"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="dateEnd"
          name={"date_end"}
          label="Fecha final"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="id_comercio"
          name={"id_comercio"}
          label="Id comercio"
          type="tel"
          value={searchInfo.id_comercio}
          maxLength={15}
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
        <Input
          id="id_usuario"
          name={"id_usuario"}
          label="Id usuario"
          type="tel"
          value={searchInfo.id_usuario}
          maxLength={15}
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
      </TableEnterprise>
      <Modal show={resumenCierre} handleClose={loading ? () => {} : CloseModal}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          <TicketCierre refPrint={printDiv} ticket={resumenCierre} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={CloseModal}>Cerrar</Button>
          </ButtonBar>
        </div>
      </Modal>
    </Fragment>
  );
};

export default PanelHistorico;
