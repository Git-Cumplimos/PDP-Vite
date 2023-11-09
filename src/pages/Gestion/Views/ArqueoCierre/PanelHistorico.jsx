import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import Input from "../../../../components/Base/Input";
import { searchHistorico,buscarPlataformaExt } from "../../utils/fetchCaja";
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
    totaldata:"",
  });
  const [dataPlfExt, setDataPlfExt] = useState(null);
  
  const CloseModal = useCallback(() => {
    setResumenCierre(null)
    Num = 0
  }, []);

  const buscarPlataforma = useCallback(() => {
    buscarPlataformaExt({totaldata: '1'})
      .then((res) => {
        const EntidadesExt=res.obj.results
        let nomEntidades = ''
        const concatenados = EntidadesExt.map((elemento) => nomEntidades.concat(elemento.pk_nombre_plataforma))
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
  },[]);

  const buscarConsignaciones = useCallback(() => {
    searchInfo.totaldata = 0
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
    buscarConsignaciones();
    buscarPlataforma();
  }, [buscarConsignaciones,buscarPlataforma]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const cierreCaja = useCallback((data) => {
    data?.entidades_externas?.data.map((elemento) => Num=Num+elemento?.valor)
    setLoading(false)
    const tempTicket = {
      title: "Cierre de caja",
      timeInfo: {
        "Fecha de pago":new Date(data.created).toLocaleDateString(),
        Hora: new Date(data.created).toLocaleTimeString('en-CO'),
      },
      commerceInfo: [
        ["Id Comercio", data.id_comercio],
        ["No. Terminal", data.id_terminal],
        ["Id Cierre", data.pk_id_cierre],
        ["Comercio", data.nombre_comercio],
        ["Cajero",data.nombre_usuario],
        ["", ""],
      ],
      cajaInfo: [
        ["Movimientos del día",formatMoney.format(data.total_movimientos)],
        ["", ""],
        ["Efectivo cierre día anterior",formatMoney.format(data.total_efectivo_cierre_día_anterior-Num)],
        ["", ""],
        ["Efectivo en caja PDP",formatMoney.format(Num>=0?data.total_efectivo_en_caja-Num:data.total_efectivo_en_caja+(-Num))],
        ["", ""],
        ["Efectivo en caja PDP + Externos",formatMoney.format(data.total_efectivo_en_caja)],
        ["", ""],
      ],
      trxInfo: [
        ["Sobrante", formatMoney.format(data.total_sobrante)],
        ["", ""],
        ["Faltante", formatMoney.format(data.total_faltante)],
        ["", ""],
        ["Estimación faltante",formatMoney.format(data.total_estimacion_faltante)],
        ["", ""],
        ["Consignaciones bancarias",formatMoney.format(data.total_consignaciones)],
        ["", ""],
        ["Entregado a transportadora", formatMoney.format(data.total_entregado_transportadora)],
        ["", ""],
        ["Recibido de transportadora", formatMoney.format(data.total_recibido_transportadora)],
        ["", ""],
        ["Notas débito o crédito",formatMoney.format(data.total_notas)],
        ["", ""],
      ],
    };
    data?.entidades_externas?.data?.map((elemento) => 
      tempTicket.trxInfo.push([
        elemento?.pk_nombre_plataforma,
        formatMoney.format(elemento?.valor)],["", ""])
    )
    setResumenCierre(tempTicket);
  }, []);

  const handle = useCallback((entidades) => {
    const fechaInicial = new Date (searchInfo.date_ini)
    const fechaFinal = new Date (searchInfo.date_end)
    let dias = Math.round((fechaFinal.getTime() - fechaInicial.getTime())/ (1000*60*60*24))
    if (searchInfo.date_end !== "" && 
        searchInfo.date_ini !== "" &&
        dias < 15
    ) {
      setDisablereport(true)
      searchInfo.totaldata=1
      searchHistorico({
        ...Object.fromEntries(
          Object.entries(searchInfo).filter(([, val]) => val,)
        ),
        ...pageData,
      })
        .then((res) => {
          const newData = []
          res?.obj?.results?.map((itemData)=>{
            var totalvalorEntidades = 0
            itemData?.entidades_externas?.data.map((val) => {
              totalvalorEntidades+=val.valor
            })
            const valJson = {
              'Idcierre': itemData?.pk_id_cierre,
              'Idcomercio': itemData?.id_comercio,
              'Idusuario': itemData?.id_usuario,
              'TotalmovimientosDía': Math.round(itemData?.total_movimientos),
              'EfectivoCierre': Math.round(itemData?.total_efectivo_cierre_día_anterior-totalvalorEntidades),
              'EfectivoCajaPDP': Math.round(totalvalorEntidades >= 0 ?itemData?.total_efectivo_en_caja-totalvalorEntidades:itemData?.total_efectivo_en_caja+totalvalorEntidades),
              'EfectivoCajaPDPExt': Math.round(itemData?.total_efectivo_en_caja),
              'Sobrante': Math.round(itemData?.total_sobrante),
              'Faltante': Math.round(itemData?.total_faltante),
              'estimacion': itemData?.total_estimacion_faltante,
              'Consignaciones': itemData?.total_consignaciones,
              'outransportadora': itemData?.total_entregado_transportadora,
              'intransportadora': itemData?.total_recibido_transportadora,
              'notas': itemData?.total_notas,
            }
            entidades.map((val)=>{
              valJson[val]='0'
            })
            if (itemData.hasOwnProperty('entidades_externas')) {
              itemData?.entidades_externas?.data.map((val)=>{
                valJson[val.pk_nombre_plataforma]=val.valor
              })
            }
            valJson['Estado Cierre']='Realizado'
            valJson['Fecha_hora_cierre'] = dateFormatter.format(new Date(itemData.created)).replace(",", "");
            newData.push(valJson)
          })
          const concatenadosParcil = entidades
          const concatenadosFinal = concatenadosParcil.join(',');
          const headers = 'Id cierre,Id comercio,Id usuario,Total movimientos dia,Efectivo cierre dia anterior,Efectivo en caja PDP,Efectivo en caja PDP + Externos,Sobrante,Faltante,Estimacion faltante,Consignaciones bancarias,Entregado transportadora,Recibido transportadora,Notas debito o credito,'+concatenadosFinal+',Estado Cierre,Fecha y hora cierre'
          const main = newData.map((item)=>{
            return Object.values(item).toString();
          })
          const csv = [headers, ...main].join('\n')
          const blob = new Blob([csv], {type: 'application/csv'})
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          const now = Intl.DateTimeFormat("es-CO", { year: "2-digit",  month: "2-digit", day: "2-digit"}).format(new Date())
          a.download = 'Reporte Cierre de Caja '+now+'.csv'
          a.href=url
          a.style.play = 'none'
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
          setDisablereport(false)
        })
        .catch((err) => {
          setDisablereport(false)
          if (err?.cause === "custom") {
            notifyError(err?.message);
            return;
          }
          console.error(err?.message);
          notifyError("Peticion fallida");
        });
    }else{
      notifyError("Seleccione un rango de fecha no mayor a 15 días");
    }
  },[searchInfo,pageData]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => {handle(dataPlfExt,receipt)}} disabled={disablereport}>Generar Reporte</Button>
      </ButtonBar>
      <TableEnterprise
        title="Históricos - Cierre de Caja"
        headers={[
          "Id cierre",
          "Id comercio",
          "Id usuario",
          "Total movimientos día",
          "Total efectivo cierre día anterior",
          "Total efectivo en caja",
          "Total sobrante",
          "Total faltante",
          "Total estimación faltante",
          "Total entregado transportadora",
          "Total recibido transportadora",
          "Total consignaciones bancarias",
          "Total transferencias cajeros",
          "Total notas débito o crédito",
          "Estado Cierre",
          "Fecha y hora cierre",
        ]}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            created,
            fecha_cierre,
            id_comercio,
            id_terminal,
            id_usuario,
            pk_id_cierre,
            total_arqueo,
            total_consignaciones,
            total_efectivo_cierre_día_anterior,
            total_efectivo_en_caja,
            total_entregado_transportadora,
            total_estimacion_faltante,
            total_faltante,
            total_movimientos,
            total_notas,
            total_recibido_transportadora,
            total_sobrante,
            state,
            total_transferencias,
          }) => ({
            pk_id_cierre,
            id_comercio,
            id_usuario,
            total_movimientos: formatMoney.format(total_movimientos),
            total_efectivo_cierre_día_anterior: formatMoney.format(
              total_efectivo_cierre_día_anterior-(total_efectivo_en_caja-total_movimientos)
            ),
            total_efectivo_en_caja: formatMoney.format(total_efectivo_en_caja),
            total_sobrante: formatMoney.format(total_sobrante),
            total_faltante: formatMoney.format(total_faltante),
            total_estimacion_faltante: formatMoney.format(
              total_estimacion_faltante
            ),
            total_entregado_transportadora: formatMoney.format(
              total_entregado_transportadora
            ),
            total_recibido_transportadora: formatMoney.format(
              total_recibido_transportadora
            ),
            total_consignaciones: formatMoney.format(total_consignaciones),
            total_transferencias: formatMoney.format(total_transferencias),
            total_notas: formatMoney.format(total_notas),
            state:"Realizado",
            created: dateFormatter.format(new Date(created)),
          })
        )}
        onSetPageData={setPageData}
        onSelectRow={(_e, index) => {
          cierreCaja(receipt[index])
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
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
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
