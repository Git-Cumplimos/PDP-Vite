import { useState, useEffect, useCallback, Fragment } from "react";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import {
  historicoEfectivoEntreCajeros,
  editarTransferencia,
} from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  makeMoneyFormatter,
  makeDateFormatter,
} from "../../../../utils/functions";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import TextArea from "../../../../components/Base/TextArea";
import { notifyPending, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);

const estadoRevision = new Map([
  [null, "PENDIENTE"],
  [true, "APROBADO"],
  [false, "RECHAZADO"],
]);

const estadoRevisionSelect = new Map([
  [null, "1"],
  [true, "2"],
  [false, "3"],
]);

const AnalisisTransferenciaEfectivo = () => {
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const { roleInfo} = useAuth();
  const [searchInfo, setSearchInfo] = useState({
    created: "",
    fk_estado_revision: "1",
    id_usuario_recibe: roleInfo?.id_usuario,
    id_usuario: roleInfo?.id_usuario,
  });
  const [transferencias, setTransferencias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stateRev, setStateRev] = useState(null);
  const [observacionesAnalisis, setObservacionesAnalisis] = useState("");
  const [loading, setLoading] = useState(false);

  const CloseModal = useCallback(() => {
    setSelected(null);
    setStateRev(null);
    setObservacionesAnalisis("");
  }, []);

  const searchTrnasferencias = useCallback(() => {
    historicoEfectivoEntreCajeros({
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
        setTransferencias(res?.obj?.results ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          return err?.message;
        }
        console.error(err?.message);
        return "Peticion fallida";
      });
  }, [searchInfo, pageData]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      notifyPending(
        editarTransferencia(
          { pk_id_movimiento: "" },
          {
            pk_id_movimiento: selected?.pk_id_movimiento,
            observaciones_analisis: observacionesAnalisis,
            fk_estado_revision: stateRev,
          }
        ),
        {
          render: () => {
            setLoading(true);
            return "Procesando peticion";
          },
        },
        {
          render: () => {
            setLoading(false);
            searchTrnasferencias();
            CloseModal();
            return "Comprobante actualizado exitosamente";
          },
        },
        {
          render: ({ data: err }) => {
            setLoading(false);
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Peticion fallida";
          },
        }
      );
    },
    [
      CloseModal,
      searchTrnasferencias,
      observacionesAnalisis,
      selected?.pk_id_movimiento,
      stateRev,
    ]
  );

  useEffect(() => {
    searchTrnasferencias()
  },[searchTrnasferencias]);

  const CloseAlert = useCallback(() => {
    CloseModal()
    notifyError("El usuario cancelo el movimiento")
  }, [CloseModal]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Histórico Transferencia de Efectivo Entre Cajero</h1>
      <TableEnterprise
        title="Histórico Transferencia de Efectivo Entre Cajero"
        headers={[
          "Id comercio",
          "Nombre Comercio",
          "Id usuario receptor",
          "Nombre usuario receptor",
          "Id usuario emisor",
          "Nombre usuario emisor",
          "Observaciones",
          "Valor transferencia",
          "Fecha registro",
          "Fecha aprobación",
          "Estado transferencia",
        ]}
        maxPage={maxPages}
        data={transferencias.map(
          ({
            id_usuario,
            fk_estado_revision,
            id_comercio,
            valor_movimiento,
            created,
            observaciones,
            nombre_comercio,
            nombre_usuario,
            id_usuario_recibe,
            nombre_usuario_recibe,
            pk_id_movimiento,
            updated,
          }) => ({
            id_comercio,
            nombre_comercio,
            id_usuario_recibe,
            nombre_usuario_recibe,
            id_usuario,
            nombre_usuario,
            observaciones,
            valor_movimiento,
            created: dateFormatter.format(new Date(created)),
            updated: updated!=null?dateFormatter.format(new Date(updated)):null,
            fk_estado_revision: estadoRevision.get(fk_estado_revision) ?? "",
          })
        )}
        onSelectRow={(_e, index) => {
          setSelected(transferencias[index]);
        }}
        onSetPageData={setPageData}
        onChange={(ev) =>
          setSearchInfo((old) => ({
            ...old,
            [ev.target.name]:ev.target.value,
          }))
        }
      >
        <Input id="created" label="Fecha registro" name="created" type="date" />
        <Select
          id="searchByStatus"
          label="Estado movimiento"
          name="fk_estado_revision"
          options={[
            { value: "", label: "" },
            { value: "1", label: "PENDIENTE" },
            { value: "2", label: "APROBADO" },
            { value: "3", label: "RECHAZADO" },
          ]}
          defaultValue={"1"}
        />
      </TableEnterprise>

      <Modal show={selected} handleClose={loading ? () => {} : selected?.fk_estado_revision === null?CloseAlert:CloseModal}>
        <h1 className="text-2xl mb-6 text-center font-semibold">
          Validación transferencia
        </h1>
        <Form onSubmit={handleSubmit} grid>
          <Input
            id="id_movimiento"
            label="Id movimiento"
            type="text"
            value={selected?.pk_id_movimiento ?? ""}
            disabled
          />
          <Input
            id="id_comercio"
            label="Id comercio"
            type="text"
            value={selected?.id_comercio ?? ""}
            disabled
          />
          <Input
            id="nombre_comercio"
            label="Nombre comercio"
            type="text"
            value={selected?.nombre_comercio ?? ""}
            disabled
          />
          <Input
            id="id_usuario"
            label="Id cajero que transfiere"
            type="text"
            value={selected?.id_usuario ?? ""}
            disabled
          />
          <Input
            id="nombre_usuario"
            label="Nombre cajero que transfiere"
            type="text"
            value={selected?.nombre_usuario ?? ""}
            disabled
          />
          <Input
            id="id_usuario_recibe"
            label="Id cajero que recibe"
            type="text"
            value={selected?.id_usuario_recibe ?? ""}
            disabled
          />
          <Input
            id="nombre_usuario_recibe"
            label="Nombre cajero que recibe"
            type="text"
            value={selected?.nombre_usuario_recibe ?? ""}
            disabled
          />
          <Input
            id="valor_movimiento"
            label="Valor transferencia"
            type="text"
            value={formatMoney.format(selected?.valor_movimiento) ?? ""}
            disabled
          />
          <Input
            id="created"
            label="Fecha del registro"
            type="text"
            value={
              selected?.created
                ? dateFormatter.format(new Date(selected?.created))
                : ""
            }
            disabled
          />
          <Select
            id="searchByStatus"
            label="Estado"
            name="fk_estado_revision"
            options={[
              { value: "1", label: "PENDIENTE" },
              { value: "2", label: "APROBADO" },
              { value: "3", label: "RECHAZADO" },
            ]}
            value={
              estadoRevisionSelect.get(
                selected?.fk_estado_revision !== null
                  ? selected?.fk_estado_revision
                  : stateRev
              ) ?? ""
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
            disabled={selected?.fk_estado_revision !== null || roleInfo.id_usuario === selected?.id_usuario}
          />
          <TextArea
            id="observaciones"
            name="observaciones"
            label="Observaciones"
            className="w-full place-self-stretch"
            autoComplete="off"
            maxLength={"100"}
            defaultValue={selected?.observaciones_analisis}
            onInput={(e) => {
              setObservacionesAnalisis(e.target.value);
            }}
            info={
              selected?.fk_estado_revision === null && `Máximo 100 caracteres`
            }
            disabled={selected?.fk_estado_revision !== null || roleInfo.id_usuario === selected?.id_usuario}
            required={selected?.fk_estado_revision === null}
          />
          <ButtonBar>

            {selected?.fk_estado_revision === null && (
              <Button type="submit" disabled={stateRev === null || loading}>
                Aceptar
              </Button>
            )}
            <Button type="button" onClick={selected?.fk_estado_revision === null?CloseAlert:CloseModal} disabled={loading}>
              Salir
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AnalisisTransferenciaEfectivo;
