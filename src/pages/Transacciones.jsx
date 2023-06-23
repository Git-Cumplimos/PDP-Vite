import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Base/Button";
import ButtonBar from "../components/Base/ButtonBar";
import Modal from "../components/Base/Modal";
import Select from "../components/Base/Select";
import Input from "../components/Base/Input";
import { useAuth } from "../hooks/AuthHooks";
import Tickets from "../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { formatMoney } from "../components/Base/MoneyInput";
import PaymentSummary from "../components/Compound/PaymentSummary";
import TicketsDavivienda from "../apps/Corresponsalia/CorresponsaliaDavivienda/components/TicketsDavivienda";
import TicketsPines from "../apps/PinesVus/components/TicketsPines";
import TicketsAval from "../apps/Corresponsalia/CorresponsaliaGrupoAval/components/TicketsAval";
import TicketColpatria from "../apps/Colpatria/components/TicketColpatria";
import TicketsAgrario from "../apps/Corresponsalia/CorresponsaliaBancoAgrario/components/TicketsBancoAgrario/TicketsAgrario";
import TicketsLot from "../apps/LoteriaBog/components/TicketsLot/TicketLot";
import DataTable from "../components/Base/DataTable";
import useFetchDispatchDebounce from "../hooks/useFetchDispatchDebounce";
import useMap from "../hooks/useMap";
import { onChangeNumber } from "../utils/functions";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const initialSearchFilters = new Map([
  ["uuid", ""],
  ["id_comercio", ""],
  ["id_usuario", ""],
  ["id_tipo_transaccion", ""],
  ["id_trx", ""],
  ["date_ini", ""],
  ["date_end", ""],
  ["page", 1],
  ["limit", 10],
]);

const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transacciones-paginated`;

const Transacciones = () => {
  const { roleInfo, userPermissions, pdpUser } = useAuth();
  const [tiposOp, setTiposOp] = useState([]);
  const [trxs, setTrxs] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [summaryTrx, setSummaryTrx] = useState(null);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setIsNextPage(res?.obj?.next_exist);
      setTrxs(res?.obj?.trxs);
    }, []),
    onError: useCallback((error) => console.error(error), []),
  });

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters);

    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    if (!tempMap.has("date_ini") || !tempMap.has("date_end")) {
      tempMap.delete("date_ini");
      tempMap.delete("date_end");
    } else {
      const fecha_ini = new Date(tempMap.get("date_ini"));
      fecha_ini.setHours(fecha_ini.getHours() + 5);
      tempMap.set(
        "date_ini",
        Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(fecha_ini)
      );

      const fecha_fin = new Date(tempMap.get("date_end"));
      fecha_fin.setHours(fecha_fin.getHours() + 5);
      tempMap.set(
        "date_end",
        Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(fecha_fin)
      );
    }

    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [fetchTrxs, searchFilters]);

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setSelected(null);
    setSummaryTrx(null);
  }, []);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    const allTypes = [];
    const tempArr = userPermissions
      .filter(({ types_trx }) => types_trx.length > 0)
      .map(({ types_trx }) => types_trx);

    tempArr.forEach((types_trx) =>
      types_trx.forEach((val) => allTypes.push(val))
    );
    setTiposOp([
      ...allTypes
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.id_tipo_operacion === value.id_tipo_operacion
            )
        )
        .sort((a, b) => a.Nombre.localeCompare(b.Nombre)),
    ]);
  }, [userPermissions]);

  useEffect(() => {
    searchTrxs();
  }, [searchTrxs]);

  useEffect(() => {
    setSearchFilters((old) => {
      if (!roleInfo?.id_comercio || !roleInfo?.id_usuario) {
        return old;
      }
      return initialSearchFilters
        .set("id_comercio", roleInfo?.id_comercio ?? "")
        .set("id_usuario", roleInfo?.id_usuario ?? "");
    });
  }, [roleInfo, setSearchFilters]);

  useEffect(() => {
    setSearchFilters((old) => {
      if (!pdpUser?.uuid) {
        return old;
      }
      return initialSearchFilters.set("uuid", pdpUser?.uuid ?? "");
    });
  }, [pdpUser, setSearchFilters]);

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Transacciones</h1>
      <DataTable
        title="Transacciones"
        headers={[
          "Id transaccion",
          "Operación",
          "Monto",
          "Fecha",
          "Estado de la trasacción",
        ]}
        data={trxs.map(
          ({
            id_trx,
            "Tipo transaccion": Tipo_operacion,
            monto,
            created,
            status_trx_text,
          }) => {
            const tempDate = new Date(created);
            tempDate.setHours(tempDate.getHours() + 5);
            created = dateFormatter.format(tempDate);
            const money = formatMoney.format(monto);
            return {
              id_trx,
              Tipo_operacion,
              money,
              created,
              status_trx_text
            };
          }
        )}
        onClickRow={(_, index) => {
          setSelected(trxs[index]);
          const fecha = new Date(trxs[index]?.created);
          fecha.setHours(fecha.getHours() + 5);
          setSummaryTrx({
            "Tipo transacción": trxs[index]?.["Tipo transaccion"],
            Fecha: dateFormatter.format(fecha),
            "Mensaje de respuesta trx": trxs[index]?.message_trx,
            Monto: formatMoney.format(trxs[index]?.monto),
            "Estado de la transacción": trxs[index]?.status_trx_text,
          });
          setShowModal(true);
        }}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={searchFilters.get("limit")}
              onChangeLimit={(limit) => {
                setSingleFilter("limit", limit);
              }}
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSingleFilter("page", (oldPage) =>
                  isNextPage ? oldPage + 1 : oldPage
                )
              }
              onClickPrev={(_) =>
                setSingleFilter("page", (oldPage) =>
                  oldPage > 1 ? oldPage - 1 : oldPage
                )
              }
            />
          </Fragment>
        }
        onChange={(ev) => {
          setSearchFilters((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name,
                ["id_trx", "id_comercio", "id_usuario"].includes(ev.target.name)
                  ? onChangeNumber(ev)
                  : "id_tipo_transaccion" === ev.target.name
                  ? parseInt(ev.target.value) ?? ""
                  : ev.target.value
              )
              .set("page", 1);
            return copy;
          });
        }}
      >
        <Input
          id="dateInit"
          name="date_ini"
          label="Fecha inicial"
          type="date"
          onChange={() => {}}
        />
        <Input
          id="dateEnd"
          name="date_end"
          label="Fecha final"
          type="date"
          onChange={() => {}}
        />
        <Select
          className="place-self-stretch"
          id="searchBySorteo"
          name="id_tipo_transaccion"
          label="Tipo de busqueda"
          options={[
            { value: "", label: "" },
            ...tiposOp.map(({ Nombre, id_tipo_operacion }) => {
              return { label: Nombre, value: id_tipo_operacion };
            }),
          ]}
          value={searchFilters.get("id_tipo_transaccion")}
          onChange={() => {}}
        />
        <Input
          id="id_trx"
          name="id_trx"
          label="Id de transaccion"
          type="tel"
          value={searchFilters.get("id_trx")}
          onChange={() => {}}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(5) && (
          <Fragment>
            <Input
              id="id_comercio"
              name="id_comercio"
              label="Id comercio"
              type="tel"
              value={searchFilters.get("id_comercio")}
              onChange={() => {}}
            />
            <Input
              id="id_usuario"
              name="id_usuario"
              label="Id usuario"
              type="tel"
              value={searchFilters.get("id_usuario")}
              onChange={() => {}}
            />
          </Fragment>
        )}
      </DataTable>
      <Modal show={showModal} handleClose={closeModal}>
        {selected?.ticket && JSON.stringify(selected?.ticket) !== "{}" ? (
          <div className="flex flex-col justify-center items-center">
            {selected?.ticket.autorizador === 14 ||  selected?.id_autorizador === 14 ? (
              <TicketColpatria
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.ticket?.autorizador === 17 ||  selected?.id_autorizador === 17 ? (
              <TicketsAval
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.ticket?.autorizador === 16 ||  selected?.id_autorizador === 16 ? (
              <TicketsAgrario
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 13 ? (
              <TicketsDavivienda
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_tipo_transaccion === 43 ||
              selected?.id_tipo_transaccion === 44 ||
              selected?.id_tipo_transaccion === 45 ? (
              <div ref={printDiv}>
                {selected?.ticket?.ticket2 ? (
                  <>
                    <TicketsPines
                      refPrint={null}
                      ticket={selected?.ticket?.ticket1}
                      type="Reimpresión"
                      stateTrx={selected?.status_trx}
                      logo="LogoVus"
                    />
                    <TicketsPines
                      refPrint={null}
                      ticket={selected?.ticket?.ticket2}
                      type="Reimpresión"
                      stateTrx={selected?.status_trx}
                      logo="LogoVus"
                    />
                  </>
                ) : (
                  <TicketsPines
                    refPrint={null}
                    ticket={selected?.ticket}
                    type="Reimpresión"
                    stateTrx={selected?.status_trx}
                    logo="LogoVus"
                  />
                )}
              </div>
            ) : selected?.id_autorizador === 3 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería de Bogotá"}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 8 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería del Tolima"}
                stateTrx={selected?.status_trx}
              />
            ) : selected?.id_autorizador === 19 ? (
              <TicketsLot
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                loteria={"Lotería de Cundinamarca"}
                stateTrx={selected?.status_trx}
              />
            ) : (
              <Tickets
                refPrint={printDiv}
                type="Reimpresión"
                ticket={selected?.ticket}
                stateTrx={selected?.status_trx}
              />
            )}
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={() => closeModal()}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mx-auto container">
            <PaymentSummary
              title="Resumen transacción"
              subtitle=""
              summaryTrx={summaryTrx}
            >
              <h1 className="text-3xl mt-6 text-aling">
                No hay ticket registrado
              </h1>
              <ButtonBar>
                <Button onClick={() => closeModal()}>Cerrar</Button>
              </ButtonBar>
            </PaymentSummary>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Transacciones;
