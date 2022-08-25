import { useState, useEffect, useCallback, Fragment } from "react";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import ValidarComprobante from "./ValidarComprobante";
import {
  buscarComprobantes,
  descargarComprobante,
} from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

import {
  makeMoneyFormatter,
  makeDateFormatter,
  toAccountNumber,
} from "../../../../utils/functions";
import Form from "../../../../components/Base/Form";
import Magnifier from "react-magnifier";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);
// Intl.DateTimeFormat("es-CO", {
//   year: "numeric",
//   month: "numeric",
//   day: "numeric",
//   hour: "numeric",
//   minute: "numeric",
// });

const estadoRevision = new Map([
  [null, "PENDIENTE"],
  [true, "APROBADO"],
  [false, "RECHAZADO"],
]);

const PanelConsignaciones = () => {
  const [dataRes, setDataRes] = useState({});

  const [maxPages, setMaxPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchInfo, setSearchInfo] = useState({
    created: "",
    fk_estado_revision: "",
  });
  const [comprobantes, setComprobantes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [stateRev, setStateRev] = useState(null);

  const CloseModal = useCallback(() => {
    setShowModal(false);
    setSelected(null);
  }, []);

  useEffect(() => {
    buscarComprobantes({
      ...Object.fromEntries(
        Object.entries(searchInfo)
          .filter(([, val]) => val)
          .map(([key, val]) => [
            key,
            key === "fk_estado_revision"
              ? val === "2"
                ? true
                : val === "3"
                ? false
                : null
              : val,
          ])
      ),
      ...pageData,
    })
      .then((res) => {
        setMaxPages(res?.obj?.maxPages ?? 0);
        setComprobantes(res?.obj?.results ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          return err?.message;
        }
        console.error(err?.message);
        return "Peticion fallida";
      });
  }, [searchInfo, pageData]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Validación de comprobante</h1>
      <TableEnterprise
        title="Comprobantes"
        headers={[
          "Id",
          "Id comercio",
          "Tipo de movimiento",
          "Empresa",
          "Número comprobante",
          "Valor registrado",
          "Fecha registro",
          "Estado",
        ]}
        maxPage={maxPages}
        data={comprobantes.map(
          ({
            pk_id_comprobante,
            fk_tipo_comprobante,
            fk_nombre_entidad,
            fk_estado_revision,
            id_comercio,
            nro_comprobante,
            valor_movimiento,
            created,
          }) => ({
            pk_id_comprobante,
            id_comercio,
            fk_tipo_comprobante,
            fk_nombre_entidad,
            nro_comprobante: toAccountNumber(nro_comprobante),
            valor_movimiento: formatMoney.format(valor_movimiento),
            created: dateFormatter.format(new Date(created)),
            fk_estado_revision: estadoRevision.get(fk_estado_revision) ?? "",
          })
        )}
        onSelectRow={(_e, index) => {
          setSelected(comprobantes[index]);
          setShowModal(true);
          descargarComprobante(comprobantes[index].archivo)
            .then((res) => setSelectedFileUrl(res?.obj ?? ""))
            .catch((err) => {
              if (err?.cause === "custom") {
                return err?.message;
              }
              console.error(err?.message);
              return "Peticion fallida";
            });
        }}
        onSetPageData={setPageData}
        onChange={(ev) =>
          setSearchInfo((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        <Input id="created" label="Fecha registro" name="created" type="date" />
        <Select
          id="searchByStatus"
          label="Estado"
          name="fk_estado_revision"
          options={[
            { value: "", label: "" },
            { value: "1", label: "PENDIENTE" },
            { value: "2", label: "APROBADO" },
            { value: "3", label: "RECHAZADO" },
          ]}
        />
      </TableEnterprise>
      <Modal show={selected} handleClose={CloseModal}>
        {/* <ValidarComprobante data={dataRes} setShowModal={setShowModal} /> */}
        <h1 className="text-2xl mb-6 text-center font-semibold">
          Validar comprobante
        </h1>
        <Form grid>
          <Input
            id="fk_nombre_entidad"
            label="Empresa"
            type="text"
            value={selected?.fk_nombre_entidad ?? ""}
            disabled
          />
          {Boolean(selected?.nro_cuenta) && (
            <Input
              id="nro_cuenta"
              label="Numero de cuenta"
              type="text"
              value={selected?.nro_cuenta}
              disabled
            />
          )}
          <Input
            id="nro_comprobante"
            label="Numero de comprobante"
            type="text"
            value={selected?.nro_comprobante ?? ""}
            disabled
          />
          <Input
            id="created"
            label="Fecha y hora de registro"
            type="text"
            value={
              selected?.created
                ? dateFormatter.format(new Date(selected?.created))
                : ""
            }
            disabled
          />
          <Input
            id="fk_tipo_comprobante"
            label="Tipo de movimiento"
            type="text"
            value={selected?.fk_tipo_comprobante ?? ""}
            disabled
          />
          <Select
            id="searchByStatus"
            label="Estado"
            name="fk_estado_revision"
            options={[
              { value: "", label: "" },
              { value: "1", label: "PENDIENTE" },
              { value: "2", label: "APROBADO" },
              { value: "3", label: "RECHAZADO" },
            ]}
            value={
              selected?.fk_estado_revision !== null
                ? selected?.fk_estado_revision
                : stateRev
            }
            onChange={(ev) =>
              setStateRev(
                ev.target.value === "2"
                  ? true
                  : ev.target.value === "3"
                  ? false
                  : null
              )
            }
            disabled={selected?.fk_estado_revision !== null}
          />
          {selectedFileUrl && (
            <div className="my-4 mx-auto md:mx-4 gap-4">
              <Magnifier src={selectedFileUrl} zoomFactor={2} />
            </div>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default PanelConsignaciones;
