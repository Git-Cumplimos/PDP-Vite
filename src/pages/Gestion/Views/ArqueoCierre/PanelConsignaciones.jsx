import { useState, useEffect, useCallback, Fragment } from "react";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import {
  buscarComprobantes,
  descargarComprobante,
  editarComprobante,
  buscarComprobantesCajero,
} from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  makeMoneyFormatter,
  makeDateFormatter,
  toAccountNumber,
  onChangeNumber,
} from "../../../../utils/functions";
import Form from "../../../../components/Base/Form";
import Magnifier from "react-magnifier";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import TextArea from "../../../../components/Base/TextArea";
import { notifyPending } from "../../../../utils/notify";
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

const PanelConsignaciones = () => {
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchInfo, setSearchInfo] = useState({
    created: "",
    fk_estado_revision: "1",
    id_usuario:"",
  });
  const [comprobantes, setComprobantes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [stateRev, setStateRev] = useState(null);
  const [observacionesAnalisis, setObservacionesAnalisis] = useState("");
  const [loading, setLoading] = useState(false);
  const { userPermissions,roleInfo,updateCommerceQuota  } = useAuth();
  const [rol, setRol] = useState(false);
  const [idComercio, setIdComercio] = useState('');
  const [idCajero, setIdCajero] = useState('');

  const CloseModal = useCallback(() => {
    setSelected(null);
    setSelectedFileUrl("");
    setStateRev(null);
    setObservacionesAnalisis("");
  }, []);

  const searchComprobantes = useCallback(() => {
    setRol(false)
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

  const searchComprobantesCajero = useCallback(() => {
    setRol(true)
    searchInfo.id_usuario = roleInfo.id_usuario
    delete searchInfo['fk_estado_revision'];
    buscarComprobantesCajero({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
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
  }, [searchInfo, pageData,roleInfo]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      notifyPending(
        editarComprobante(
          { pk_id_comprobante: "" },
          {
            pk_id_comprobante: selected?.pk_id_comprobante,
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
            searchComprobantes();
            CloseModal();
            updateCommerceQuota();
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
      searchComprobantes,
      observacionesAnalisis,
      selected?.pk_id_comprobante,
      stateRev,
      updateCommerceQuota,
    ]
  );

  useEffect(() => {
    const id_permission = []
    userPermissions.forEach(function(val) {
      id_permission.push(val.id_permission)
    })
    id_permission.includes(6110) && id_permission.includes(6111)? 
      searchComprobantes():
      searchComprobantesCajero();
  },[searchComprobantes,userPermissions,searchComprobantesCajero]);

  const handleChangeNumber = (e) => {
    if (e.target.name === 'id_comercio') {
      setIdComercio(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))
    }else{
      setIdCajero(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))
    }
  };

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Validación de comprobante</h1>
      <TableEnterprise
        title="Comprobantes"
        headers={[
          // "Id",
          "Id comercio",
          "Id Cajero",
          "Tipo de movimiento",
          "Empresa",
          "Número comprobante",
          "Valor total",
          // "Valor redes externas",
          // "Valor total",
          "Observaciones",
          "Fecha registro",
          "Estado",
        ]}
        maxPage={maxPages}
        data={comprobantes.map(
          ({
            // pk_id_comprobante,
            fk_tipo_comprobante,
            id_usuario,
            fk_nombre_entidad,
            fk_estado_revision,
            id_comercio,
            nro_comprobante,
            valor_movimiento,
            created,
            observaciones_analisis,
            total_externos
          }) => ({
            // pk_id_comprobante,
            id_comercio,
            id_usuario,
            fk_tipo_comprobante, 
            fk_nombre_entidad,
            nro_comprobante: toAccountNumber(nro_comprobante),
            valor_movimiento: formatMoney.format(valor_movimiento),
            // total_externos: formatMoney.format(total_externos),
            // total_externos_pdp: formatMoney.format(total_externos+parseInt(valor_movimiento)),
            observaciones_analisis,
            created: dateFormatter.format(new Date(created)),
            fk_estado_revision: estadoRevision.get(fk_estado_revision) ?? "",
          })
        )}
        onSelectRow={(_e, index) => {
          setSelected(comprobantes[index]);
          descargarComprobante({ filename: comprobantes[index].archivo })
            .then((res) =>  setSelectedFileUrl(res?.obj ?? ""))
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
            [ev.target.name]:
              ev.target.name === "id_comercio"
                ? onChangeNumber(ev)
                : ev.target.value,
          }))
        }
      >
      {rol === false?(<>
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
          defaultValue={"1"}
        />
        <Input
          id="id_comercio"
          name={"id_comercio"}
          label="Id comercio"
          type="tel"
          onChange={handleChangeNumber}
          value={idComercio}
        />
        <Input
          id="id_usuario"
          name={"id_usuario"}
          label="Id Cajero"
          type="tel"
          onChange={handleChangeNumber}
          value={idCajero}
        />
        </>):<>
          <Input id="fecha_registro_inicial" label="Fecha inicial" name="fecha_registro_inicial" type="date" />
          <Input id="fecha_registro_final" label="Fecha Final" name="fecha_registro_final" type="date" />
        </>}
      </TableEnterprise>
      {rol === false?(<Modal show={selected} handleClose={loading ? () => {} : CloseModal}>
        <h1 className="text-2xl mb-6 text-center font-semibold">
          Validar comprobante
        </h1>
        <Form onSubmit={handleSubmit} grid>
          <Input
            id="id_comercio"
            label="Id comercio"
            type="text"
            value={selected?.id_comercio ?? ""}
            disabled
          />
          <Input
            id="id_usuario"
            label="Id cajero"
            type="text"
            value={selected?.id_usuario ?? ""}
            disabled
          />
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
              label="Número de cuenta"
              type="text"
              value={selected?.nro_cuenta}
              disabled
            />
          )}
          <Input
            id="nro_comprobante"
            label="Número de comprobante"
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
          <Input
            id="valor_efectivo_pdp"
            label="Valor efectivo caja"
            type="text"
            value={formatMoney.format(selected?.valor_efectivo_pdp) ?? ""}
            disabled
          />
          <Input
            id="valor_efectivo_boveda"
            label="Valor efectivo bóveda"
            type="text"
            value={formatMoney.format(selected?.valor_efectivo_boveda) ?? ""}
            disabled
          />
          <Input
            id="valor_movimiento"
            label="Valor total"
            type="text"
            value={formatMoney.format(selected?.valor_movimiento) ?? ""}
            disabled
          />
          {/* {selected?.valores_externos && typeof selected.valores_externos === 'object' ? (
            Object.entries(selected?.valores_externos).map(([banco, valor]) => (
              <Input
                key={banco}
                id={`valor_movimiento_${banco}`}
                label={`${banco}`}
                type="text"
                value={formatMoney.format(valor)}
                disabled
              />
            )
          )):null} */}
          {/* <Input
            id="valor_total_pdp_externos"
            label="Valor total PDP + Externos"
            type="text"
            value={formatMoney.format(selected?.total_externos+parseInt(selected?.valor_movimiento)) ?? ""}
            disabled
          /> */}
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
            disabled={selected?.fk_estado_revision !== null}
          />
          <TextArea
            id="observaciones"
            name="observaciones"
            label="Observaciones"
            className="w-full place-self-stretch"
            autoComplete="off"
            maxLength={"60"}
            defaultValue={selected?.observaciones_analisis}
            onInput={(e) => {
              setObservacionesAnalisis(e.target.value);
            }}
            info={
              selected?.fk_estado_revision === null && `Máximo 60 caracteres`
            }
            disabled={selected?.fk_estado_revision !== null}
            required={selected?.fk_estado_revision === null}
          />
          {selectedFileUrl && (
            <div className="my-4 mx-auto md:mx-4 gap-4">
              <Magnifier src={selectedFileUrl}  zoomFactor={2}/>
            </div>
          )}
          <ButtonBar>
            {selected?.fk_estado_revision === null && (
              <Button type="submit" disabled={stateRev === null || loading}>
                Aceptar
              </Button>
            )}
            {selectedFileUrl && (
              <a
                href={selectedFileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                <Button type="button">Descargar imagen</Button>
              </a>
            )}
            <Button type="button" onClick={CloseModal} disabled={loading}>
              Salir
            </Button>
          </ButtonBar>
        </Form>
      </Modal>):null}
    </Fragment>
  );
};

export default PanelConsignaciones;
