import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Base/Button";
import ButtonBar from "../components/Base/ButtonBar";
import Form from "../components/Base/Form";
import Modal from "../components/Base/Modal";
import Select from "../components/Base/Select";
import Table from "../components/Base/Table";
import Input from "../components/Base/Input";
import fetchData from "../utils/fetchData";
import { useAuth } from "../hooks/AuthHooks";
import Tickets from "../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";

const Transacciones = () => {
  const { roleInfo, userPermissions } = useAuth();
  const [tiposOp, setTiposOp] = useState([]);
  const [trxs, setTrxs] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [idComercio, setIdComercio] = useState(-1);
  const [usuario, setUsuario] = useState(-1);
  const [tipoOp, setTipoOp] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const transacciones = useCallback(
    (page, Comercio, usuario, Tipo_operacion, date_ini, date_end) => {
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio === -1 || Comercio === "")) {
        queries.id_comercio = parseInt(Comercio);
      }
      if (!(usuario === -1 || usuario === "")) {
        queries.id_usuario = parseInt(usuario);
      }
      if (Tipo_operacion) {
        queries.id_tipo_transaccion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
        const fecha_ini = new Date(date_ini);
        fecha_ini.setHours(fecha_ini.getHours() + 5);
        date_ini = Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(fecha_ini);

        const fecha_fin = new Date(date_end);
        fecha_fin.setHours(fecha_fin.getHours() + 5);
        date_end = Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(fecha_fin);
        queries.date_ini = date_ini;
        queries.date_end = date_end;
      }
      console.log(queries);
      fetchData(url, "GET", queries)
        .then((res) => {
          console.log(res);
          if (res?.status) {
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          } else {
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    },
    []
  );

  const closeModal = useCallback(async () => {
    setShowModal(false);
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
    setTiposOp([...allTypes]);

    setIdComercio(roleInfo?.id_comercio || -1);
    setUsuario(roleInfo?.id_usuario || -1);
  }, [userPermissions, roleInfo]);

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Transacciones</h1>
      <Form onSubmit={(e) => e.preventDefault()} grid>
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            setPage(1);
            setMaxPages(1);
            setFechaInicial(e.target.value);
            if (fechaFinal !== "" && tipoOp !== "") {
              transacciones(
                1,
                idComercio,
                usuario,
                tipoOp,
                e.target.value,
                fechaFinal
              );
            }
          }}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            setPage(1);
            setFechaFinal(e.target.value);
            if (fechaInicial !== "" && tipoOp !== "") {
              transacciones(
                1,
                idComercio,
                usuario,
                tipoOp,
                fechaInicial,
                e.target.value
              );
            }
          }}
        />
        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={
            Object.fromEntries([
              ["", ""],
              ...tiposOp.map(({ Nombre, id_tipo_operacion }) => {
                return [Nombre, id_tipo_operacion];
              }),
            ]) || { "": "" }
          }
          value={tipoOp}
          required={true}
          onChange={(e) => {
            setPage(1);
            setTipoOp(parseInt(e.target.value) ?? "");
            transacciones(
              1,
              idComercio,
              usuario,
              parseInt(e.target.value) ?? 0,
              fechaInicial,
              fechaFinal
            );
          }}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(5) ? (
          <>
            <Input
              id="id_comercio"
              label="Id comercio"
              type="numeric"
              value={idComercio}
              onChange={(e) => {
                setIdComercio(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {
                  setPage(1);
                  if (tipoOp !== "") {
                    transacciones(
                      1,
                      e.target.value,
                      usuario,
                      tipoOp,
                      fechaInicial,
                      fechaFinal
                    );
                  }
                },
                timeOut: 500,
              }}
            />
            <Input
              id="id_usuario"
              label="Id usuario"
              type="numeric"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {
                  setPage(1);
                  if (tipoOp !== "") {
                    transacciones(
                      1,
                      idComercio,
                      e.target.value,
                      tipoOp,
                      fechaInicial,
                      fechaFinal
                    );
                  }
                },
                timeOut: 500,
              }}
            />
          </>
        ) : (
          ""
        )}

        {maxPages > 1 ? (
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button
              type="button"
              disabled={page < 2}
              onClick={() => {
                setPage(page - 1);
                transacciones(
                  page - 1,
                  idComercio,
                  tipoOp,
                  fechaInicial,
                  fechaFinal
                );
              }}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={page >= maxPages}
              onClick={() => {
                setPage(page + 1);
                transacciones(
                  page + 1,
                  idComercio,
                  tipoOp,
                  fechaInicial,
                  fechaFinal
                );
              }}
            >
              Siguiente
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}
      </Form>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={["Fecha", "Operación", "Monto"]}
            data={trxs.map(
              ({ created, "Tipo transaccion": Tipo_operacion, monto }) => {
                const tempDate = new Date(created);
                tempDate.setHours(tempDate.getHours() + 5);
                created = Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(tempDate);
                const money = formatMoney.format(monto);
                return {
                  created,
                  Tipo_operacion,
                  money,
                };
              }
            )}
            onSelectRow={(_e, index) => {
              setSelected(trxs[index]);
              setShowModal(true);
            }}
          />
        </>
      ) : (
        ""
      )}

      <Modal show={showModal} handleClose={closeModal}>
        {selected?.ticket ? (
          <div className="flex flex-col justify-center items-center">
            <Tickets
              refPrint={printDiv}
              type="Reimpresión"
              ticket={selected?.ticket}
            />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button
                onClick={() => {
                  closeModal();
                  setSelected(null);
                }}
              >
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mx-auto container">
            <h1 className="text-3xl mt-6 text-aling">
              No hay ticket registrado
            </h1>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Transacciones;
