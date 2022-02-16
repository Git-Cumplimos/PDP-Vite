import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../components/Base/Button/Button";
import ButtonBar from "../components/Base/ButtonBar/ButtonBar";
import Form from "../components/Base/Form/Form";
import Modal from "../components/Base/Modal/Modal";
import Select from "../components/Base/Select/Select";
import Table from "../components/Base/Table/Table";
import Input from "../components/Base/Input/Input";
import fetchData from "../utils/fetchData";
import { useAuth } from "../hooks/AuthHooks";
import Tickets from "../components/Base/Tickets/Tickets";
import { useReactToPrint } from "react-to-print";

const Transacciones = () => {
  const { roleInfo, userPermissions } = useAuth();
  const [tiposOp, setTiposOp] = useState([]);
  const [trxs, setTrxs] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [idComercio, setIdComercio] = useState(2);
  const [tipoOp, setTipoOp] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const transacciones = useCallback(
    (page, Comercio, Tipo_operacion, date_ini, date_end) => {
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio === -1 || Comercio === "")) {
        queries.Comercio = Comercio;
      }
      if (Tipo_operacion) {
        queries.Tipo_operacion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
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
  }, [userPermissions, roleInfo?.id_comercio]);
  
  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Transacciones</h1>
      <Form grid>
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
              transacciones(1, idComercio, tipoOp, e.target.value, fechaFinal);
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
              parseInt(e.target.value) ?? 0,
              fechaInicial,
              fechaFinal
            );
          }}
        />
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(3) ? (
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
                    tipoOp,
                    fechaInicial,
                    fechaFinal
                  );
                }
              },
              timeOut: 500,
            }}
          />
        ) : (
          ""
        )}

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
      </Form>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={["Fecha", "operacion", "Monto"]}
            data={trxs.map(({ Created_at, Tipo_operacion, Monto }) => {
              const tempDate = new Date(Created_at);
              tempDate.setHours(tempDate.getHours() + 5);
              Created_at = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(tempDate);
              return {
                Created_at,
                Tipo_operacion,
                Monto,
              };
            })}
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
        {selected?.Ticket ? (
          <div className="flex flex-col justify-center items-center">
            <Tickets
              refPrint={printDiv}
              type="Reimpresión"
              ticket={selected?.Ticket}
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
          <h1 className="text-3xl mt-6 text-aling">No hay ticket registrado</h1>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Transacciones;
