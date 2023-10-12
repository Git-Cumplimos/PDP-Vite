import { useState, useEffect, useCallback, Fragment } from "react";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import {
  VldFaltantesSobr,
  editarNovedad,
} from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import {
  makeDateFormatter,
} from "../../../../utils/functions";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import TextArea from "../../../../components/Base/TextArea";
import { notifyPending,notifyError } from "../../../../utils/notify";

const originalState = {
  pk_id_transaccion: '',
  pk_estado: null,
  pk_obs_analista: '',
  pk_name_analista: '',
  pk_id_reporte: '',
};

const originalStateSarch = {
  fecha_registro_inicial: "",
  fecha_registro_final: "",
  fk_id_comercio: "",
  uname: "",
};

const dateFormatter = makeDateFormatter(true);

const ValidacionSobranteFaltantes = () => {
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({});
  const [searchInfo, setSearchInfo] = useState(originalStateSarch);
  const [Validaciones, setValidaciones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sentData, setSentData] = useState(originalState);
  const name_user=useAuth().pdpUser.uname

  const CloseModal = useCallback(() => {
    setSelected(null);
    setSentData(originalState)
  }, []);

  const searchValidaciones = useCallback(() => {  
    VldFaltantesSobr({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
      ),
      ...pageData,
    })
      .then((res) => {
        setValidaciones(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [searchInfo, pageData]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      sentData.pk_obs_analista =  sentData.pk_obs_analista===null?'':sentData.pk_obs_analista
      sentData.pk_id_transaccion=sentData.pk_id_transaccion===null?'':sentData.pk_id_transaccion.toString()
      sentData.pk_name_analista=name_user
      notifyPending(
        editarNovedad({ pk_id_transaccion: "" },sentData),
        {
          render: () => {
            setLoading(true);
            return "Procesando peticion";
          },
        },
        {
          render: () => {
            setLoading(false);
            searchValidaciones();
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
      searchValidaciones,
      sentData,
    ]
  );

  useEffect(() => {
    searchValidaciones();
  }, [searchValidaciones]);

  const tipoMovi = (pk_valor_novedad,pk_tipo_movimiento) => {
    if(pk_tipo_movimiento === 'Faltante'){
      return pk_valor_novedad = '-'+pk_valor_novedad
    }else{
      return pk_valor_novedad
    }
  };

  const DisableState= (state) => {
    if(state === 'Aprobado   ' || state === 'Rechazado  '){
      return true
    }else{ return false }  
  };

  const AlertCancelar= () => {
    CloseModal()
    notifyError("Transacción cancelada por el usuario");
  };

  const handleChangeNum = (e) => {
    const value = e.target.value;
    if (e.target.name==='pk_id_transaccion') {
      if (/^[0-9]*$/.test(value) && value.length <= 15) {
        setSentData((old)=>{return{...old,pk_id_transaccion:value.trimLeft()}})
      }
    }
    if (e.target.name==='fk_id_comercio') {
      if (/^[0-9]*$/.test(value) && value.length <= 15) {
        setSearchInfo((old) => {return {...old,fk_id_comercio: value}})
      }
    }
  };

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Validación Sobrantes y Faltantes</h1>
      <TableEnterprise
        title="Sobrantes y Faltantes"
        headers={[
          "Id comercio",
          "Nombre Cajero",
          "Id Transacción",
          "Valor de la novedad",
          "Fecha de la novedad",
          "Estado de la solicitud",
          "Nombre Analista",
          "Observaciones Analista",
        ]}
        maxPage={maxPages}
        data={Validaciones.map(
          ({
            fk_id_comercio,
            uname,
            pk_id_transaccion,
            pk_valor_novedad,
            fecha_registro_novedad,
            pk_estado,
            pk_name_analista,
            pk_obs_analista,
            pk_tipo_movimiento,
          }) => ({
            fk_id_comercio,
            uname,
            pk_id_transaccion,
            pk_valor_novedad: tipoMovi(pk_valor_novedad,pk_tipo_movimiento),
            fecha_registro_novedad: dateFormatter.format(new Date(fecha_registro_novedad)),
            pk_estado,
            pk_name_analista,
            pk_obs_analista,
          })
        )}
        onSelectRow={(_e, index) => {
          setSelected(Validaciones[index]);
          setSentData((old)=>{return{
            ...old,
            pk_estado:Validaciones[index]?.pk_estado,
            pk_id_transaccion:Validaciones[index]?.pk_id_transaccion,
            pk_obs_analista:Validaciones[index]?.pk_obs_analista,
            pk_id_reporte:Validaciones[index]?.pk_id_reporte,
          }})
        }}
        onSetPageData={setPageData}
      >
        <Input id="fecha_registro_inicial" label="Fecha Inicial" name="fecha_registro_inicial" type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          } 
        />
        <Input id="fecha_registro_final" label="Fecha Final" name="fecha_registro_final" type="date" 
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          } 
        />
        <Input 
          id="fk_id_comercio" 
          label="Id Comercio" 
          name="fk_id_comercio" 
          type="tel"
          value={searchInfo.fk_id_comercio}
          onInput={(ev) =>handleChangeNum(ev)}
          autoComplete="off"
        />
        <Input 
          id="uname" 
          label="Nombre Cajero" 
          name="uname" 
          type="text" 
          autoComplete="off"
          maxLength={"20"}
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
      </TableEnterprise>
      <Modal show={selected} handleClose={loading ? () => {} : CloseModal}>
        <h1 className="text-2xl mb-6 text-center font-semibold">
          Resumen de la novedad de sobrantes y faltantes
        </h1>
        <Form onSubmit={handleSubmit} grid>
          <Input
            id="uname"
            label="Nombre Cajero"
            type="text"
            value={selected?.uname ?? ""}
            disabled
          />
          <Input
            id="fk_id_comercio"
            label="Id Comercio"
            type="text"
            value={selected?.fk_id_comercio ?? ""}
            disabled
          />
          <Input
            id="pk_id_transaccion"
            label="Id Transacción"
            type="text"
            name="pk_id_transaccion"
            value={sentData.pk_id_transaccion}
            onInput={(e) => {
              handleChangeNum(e)
              setIsButtonDisabled(false)
            }}
            disabled={sentData.pk_estado !== 'En Análisis'}
          />
          <Input
            id="pk_valor_novedad"
            label="Valor de la novedad"
            type="text"
            value={selected?.pk_tipo_movimiento === "Sobrante"?(selected?.pk_valor_novedad ?? ""):('-'+selected?.pk_valor_novedad ?? "")}
            disabled
          />
          <TextArea
            id="pk_observacion_novedad"
            label="Observación novedades"
            name="pk_observacion_novedad"
            className="w-full place-self-stretch"
            type="text"
            maxLength={"500"}
            value={selected?.pk_observacion_novedad ?? ""}
            disabled
          />
          <Select
            id="pk_estado"
            label="Estado de la novedad"
            name="pk_estado"
            options={[
              { value: "Pendiente  ", label: "Pendiente" },
              { value: "En Análisis", label: "En Análisis" },
              { value: "Aprobado   ", label: "Aprobado" },
              { value: "Rechazado  ", label: "Rechazado" },
            ]}
            defaultValue={selected?.pk_estado ?? ""}
            onChange={(ev) => {
              setSentData((old)=>{return{...old,pk_estado:ev.target.value}})
              setIsButtonDisabled(false)
            }}
            required
            disabled={DisableState(selected?.pk_estado)}
          />
          <TextArea
            id="pk_obs_analista"
            label="Observación del analista"
            name="pk_obs_analista"
            className="w-full place-self-stretch"
            type="text"
            autoComplete="off"
            value={sentData.pk_obs_analista}
            onInput={(e) => {
              setSentData((old)=>{return{...old,pk_obs_analista:e.target.value.trimLeft()}})
              setIsButtonDisabled(false)
            }}
            maxLength={"150"}
          />
          <ButtonBar>
            <Button type="button" onClick={AlertCancelar} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isButtonDisabled}>
              Aceptar
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default ValidacionSobranteFaltantes;
