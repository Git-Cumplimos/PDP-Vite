import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import Select from "../../../../components/Base/Select";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import {
  DEPARTAMENTOS_SIIAN,
  MUNICIPIOS_SIIAN,
} from "../../enumDataLocalizacionCredito";

const URL_CONSULTA_TERCEROS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/gestion-credito-facil/consulta-tercero`;
const URL_CREACION_TERCEROS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/gestion-credito-facil/creacion-tercero`;

const DATA_TIPO_ID = {
  NIT: 2,
  "CEDULA CIUDADANIA": 1,
  "TARJETA DE IDENTIDAD": 4,
  "REGISTRO CIVIL": 6,
  "TARJETA DE EXTRANJERIA": 7,
  "CEDULA EXTRANJERIA": 3,
  PASAPORTE: 8,
  "DEFINIDO POR LA DIAN": 10,
  "TIPO DOCUMENTO EXTRANJERO PJURIDICA": 5,
  "NIT PERSONA NATURAL": 11,
};
const DATA_SIIAN_ESTRATO = {
  "POR VERIFICAR": 7,
  "Estrato 1": 1,
  "Estrato 2": 2,
  "Estrato 3": 3,
  "Estrato 4": 4,
  "Estrato 5": 5,
  "Estrato 6": 6,
};

const DATA_SIIAN_INIT = {
  Apellido1: "",
  Apellido2: "",
  Digitoverificacion: 0,
  Direcciondomicilio: "",
  Esasociado: false,
  Escliente: false,
  Esempleado: false,
  Esinformaciontributaria: false,
  Esprovedor: false,
  Esrural: false,
  Fechacreacion: "",
  Fechaexpedicion: "",
  Fechanacimiento: "",
  Id: 0,
  Idbarriovereda: null,
  Idciudadexpedicion: null,
  Idcodigopostal: null,
  Iddepartamentonacimiento: null,
  Iddepartamentoubicacion: 1,
  Identificacion: "",
  Idestadocivil: 1,
  Idestrato: 1,
  Idgenero: 1,
  Idmunicipionacimiento: null,
  Idmunicipioubicacion: 1,
  Idniveleducativo: null,
  Idpaisdomicilio: null,
  Idpaisnacimiento: null,
  Idtipocliente: 12,
  Idtipoidentificacion: 1,
  Idtipovivienda: 1,
  Idusuario: "",
  Nombre1: "",
  Nombre2: "",
  Nombrecomercial: "",
  Nombrepropietario: "",
  Nombreunido: "",
  Numeropersonasacargo: 0,
  Razonsocial: "",
  Referenciaubicacion: "",
  Telefonopropietario: "",
  Tiempopermanenciameses: 0,
  Valoranticres: 0,
  Valorarriendo: 0,
  correocliente: "",
};
const DATA_FILTER_SIIAN = {
  Iddepartamentoubicacion: "",
  IddepartamentoubicacionNoChanges: "",
  Idmunicipioubicacion: "",
  IdmunicipioubicacionNoChanges: "",
  nombreEstrato: "",
  nombreCliente: "",
};

const DATA_TIPO_CLIENTE_SIIAN = {
  COMERCIOS: 12,
  OAT: 10,
  "PEQUEÑOS PRODUCTORES": 11,
  EMPLEADOS: 13,
};

const GestionTercerosCreditoFacil = () => {
  const navigate = useNavigate();
  const [dataSiian, setDataSiian] = useState(DATA_SIIAN_INIT);
  const [stateProc, setStateProc] = useState("consulta");
  const [filterData, setFilterData] = useState(DATA_FILTER_SIIAN);
  const [loadingPeticionConsultaTerceros, peticionConsultaTercero] = useFetch(
    fetchCustom(URL_CONSULTA_TERCEROS, "POST", "Consultar tercero")
  );
  const [loadingPeticionCreacionTerceros, peticionCreacionTercero] = useFetch(
    fetchCustom(URL_CREACION_TERCEROS, "POST", "Creación tercero")
  );
  const dataDepartamento = useMemo(() => {
    let filteredList = DEPARTAMENTOS_SIIAN.filter((item) =>
      item.Nombre.toUpperCase().includes(filterData.Iddepartamentoubicacion)
    );
    filteredList = filteredList.slice(0, 10);
    return {
      dataRender: filteredList.map((data, index) => (
        <h1 className="py-2">{data.Nombre}</h1>
      )),
      dataList: filteredList,
    };
  }, [filterData.Iddepartamentoubicacion]);
  const dataMunicipio = useMemo(() => {
    let filteredList = MUNICIPIOS_SIIAN.filter((item) =>
      item.Nombre.toUpperCase().includes(filterData.Idmunicipioubicacion)
    );
    filteredList = filteredList.slice(0, 10);
    return {
      dataRender: filteredList.map((data, index) => (
        <h1 className="py-2">{data.Nombre}</h1>
      )),
      dataList: filteredList,
    };
  }, [filterData.Idmunicipioubicacion]);
  const closeModule = useCallback((e) => {
    setDataSiian(DATA_SIIAN_INIT);
    setFilterData(DATA_FILTER_SIIAN);
    navigate(-1);
  }, []);
  const consultaTercero = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        id_comercio: dataSiian?.Identificacion,
      };
      notifyPending(
        peticionConsultaTercero({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            let dataTemp = res.obj.data;
            setDataSiian(dataTemp);
            let filteredListDepa = DEPARTAMENTOS_SIIAN.filter(
              (item) => item.Id === dataTemp.Iddepartamentoubicacion
            );
            let filteredListMuni = MUNICIPIOS_SIIAN.filter(
              (item) => item.Id === dataTemp.Idmunicipioubicacion
            );
            let filteredKeysEstrato = Object.keys(DATA_SIIAN_ESTRATO).filter(
              (key) => DATA_SIIAN_ESTRATO[key] === dataSiian?.Idestrato
            );
            let filteredKeysCliente = Object.keys(
              DATA_TIPO_CLIENTE_SIIAN
            ).filter(
              (key) => DATA_TIPO_CLIENTE_SIIAN[key] === dataSiian?.Idtipocliente
            );
            setFilterData({
              Iddepartamentoubicacion: filteredListDepa[0].Nombre ?? "BOGOTA",
              Idmunicipioubicacion:
                filteredListMuni[0].Nombre ?? "BOGOTA, D.C.",
              IddepartamentoubicacionNoChanges:
                filteredListDepa[0].Nombre ?? "BOGOTA",
              IdmunicipioubicacionNoChanges:
                filteredListMuni[0].Nombre ?? "BOGOTA, D.C.",
              nombreEstrato: filteredKeysEstrato[0] ?? "Estrato 1",
              nombreCliente: filteredKeysCliente[0] ?? "COMERCIOS",
            });
            setStateProc("creacion");
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [navigate, dataSiian]
  );
  const creacionTercero = useCallback(
    (ev) => {
      ev.preventDefault();
      if (filterData.IddepartamentoubicacionNoChanges === "") {
        return notifyError("Ingrese un departamento");
      }
      if (filterData.IdmunicipioubicacionNoChanges === "") {
        return notifyError("Ingrese una ciudad");
      }
      if (filterData.nombreEstrato === "") {
        return notifyError("Ingrese un estrato");
      }
      if (filterData.nombreCliente === "") {
        return notifyError("Ingrese un tipo de cliente");
      }
      const data = {
        id: dataSiian.Id,
        identificacion: dataSiian.Identificacion,
        razonsocial: dataSiian.Razonsocial,
        apellido1: dataSiian.Apellido1,
        apellido2: dataSiian.Apellido2,
        nombre1: dataSiian.Nombre1,
        nombre2: dataSiian.Nombre2,
        direccion: dataSiian.Direcciondomicilio,
        id_departamento: dataSiian.Iddepartamentoubicacion,
        nombre_departamento: filterData.IddepartamentoubicacionNoChanges,
        id_municipio: dataSiian.Idmunicipioubicacion,
        nombre_municipio: filterData.IdmunicipioubicacionNoChanges,
        id_estrato: dataSiian.Idestrato,
        nombre_estrato: filterData.nombreEstrato,
        email: dataSiian.correocliente,
        telefono: dataSiian.Telefonopropietario,
        id_tipo_cliente: dataSiian.Idtipocliente,
        nombre_cliente: filterData.nombreCliente,
      };
      notifyPending(
        peticionCreacionTercero({}, data),
        {
          render: () => {
            return "Procesando creación";
          },
        },
        {
          render: ({ data: res }) => {
            setStateProc("consulta");
            closeModule();
            return res?.msg ?? "Creación satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Creación fallida";
          },
        }
      );
    },
    [navigate, dataSiian, filterData]
  );

  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "Idestrato") {
      let nombreEstrato =
        Object.keys(DATA_SIIAN_ESTRATO).filter(
          (key) => DATA_SIIAN_ESTRATO[key] === parseInt(value)
        )[0] ?? "";
      setFilterData((old) => ({
        ...old,
        nombreEstrato: nombreEstrato,
      }));
    }
    if (ev.target.name === "Idtipocliente") {
      let nombreCliente =
        Object.keys(DATA_TIPO_CLIENTE_SIIAN).filter(
          (key) => DATA_TIPO_CLIENTE_SIIAN[key] === parseInt(value)
        )[0] ?? "";
      setFilterData((old) => ({
        ...old,
        nombreCliente: nombreCliente,
      }));
    }
    const dataNames = ["Nombre1", "Nombre2", "Apellido1", "Apellido2"];
    if (dataNames.includes(ev.target.name)) {
      value = value.toUpperCase();
    }
    setDataSiian((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    let num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataSiian((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onSelectSuggestion = useCallback(
    (i, el, name) => {
      if (name === "Iddepartamentoubicacion") {
        let dataDepa = dataDepartamento.dataList[i];
        setDataSiian((old) => {
          return { ...old, [name]: dataDepa.Id };
        });
        setFilterData((old) => {
          return {
            ...old,
            [name]: dataDepa.Nombre,
            IddepartamentoubicacionNoChanges: dataDepa.Nombre,
          };
        });
      } else if (name === "Idmunicipioubicacion") {
        let dataMuni = dataMunicipio.dataList[i];
        setDataSiian((old) => {
          return { ...old, [name]: dataMuni.Id };
        });
        setFilterData((old) => {
          return {
            ...old,
            [name]: dataMuni.Nombre,
            IddepartamentoubicacionNoChanges: dataMuni.Nombre,
          };
        });
      }
    },
    [dataDepartamento, dataMunicipio]
  );
  return (
    <>
      {stateProc === "consulta" ? (
        <>
          <h1 className="text-3xl">Gestión de Terceros</h1>
          <Form onSubmit={consultaTercero} grid>
            <Fieldset legend="Datos del tercero" className="lg:col-span-2">
              <Input
                id="Identificacion"
                name="Identificacion"
                label={"ID Comercio"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={20}
                value={dataSiian?.Identificacion}
                onChange={onChangeFormatNumber}
                disabled={loadingPeticionConsultaTerceros}
                required
              />
            </Fieldset>
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={closeModule}
                disabled={loadingPeticionConsultaTerceros}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loadingPeticionConsultaTerceros}>
                Consultar tercero
              </Button>
            </ButtonBar>
          </Form>
        </>
      ) : stateProc === "creacion" ? (
        <>
          <h1 className="text-3xl">Creación de Terceros</h1>
          <Form onSubmit={creacionTercero} grid>
            <Fieldset legend="Datos del tercero" className="lg:col-span-2">
              <Input
                id="Identificacion"
                name="Identificacion"
                label={"ID Comercio"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={20}
                value={dataSiian?.Identificacion}
                onChange={() => {}}
                disabled={true}
                required
              />
              <Input
                id="Razonsocial"
                name="Razonsocial"
                label={"Razón social"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={100}
                value={dataSiian?.Razonsocial ?? ""}
                onChange={onChangeFormat}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Nombre1"
                name="Nombre1"
                label={"Primer nombre"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={50}
                value={dataSiian?.Nombre1 ?? ""}
                onChange={onChangeFormat}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Nombre2"
                name="Nombre2"
                label={"Segundo nombre"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={50}
                value={dataSiian?.Nombre2 ?? ""}
                onChange={onChangeFormat}
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Apellido1"
                name="Apellido1"
                label={"Primer apellido"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={50}
                value={dataSiian?.Apellido1 ?? ""}
                onChange={onChangeFormat}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Apellido2"
                name="Apellido2"
                label={"Segundo apellido"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={50}
                value={dataSiian?.Apellido2 ?? ""}
                onChange={onChangeFormat}
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="correocliente"
                name="correocliente"
                label={"Email"}
                type="email"
                autoComplete="off"
                minLength={0}
                maxLength={50}
                value={dataSiian?.correocliente ?? ""}
                onChange={onChangeFormat}
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Direcciondomicilio"
                name="Direcciondomicilio"
                label={"Dirección"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={250}
                value={dataSiian?.Direcciondomicilio ?? ""}
                onChange={onChangeFormat}
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <InputSuggestions
                id="Idmunicipioubicacion"
                name="Idmunicipioubicacion"
                label={"Ciudad"}
                type="search"
                autoComplete="off"
                suggestions={dataMunicipio.dataRender || []}
                onSelectSuggestion={(i, el) =>
                  onSelectSuggestion(i, el, "Idmunicipioubicacion")
                }
                value={filterData.Idmunicipioubicacion || ""}
                onChange={(e) => {
                  setFilterData((old) => ({
                    ...old,
                    Idmunicipioubicacion: e.target.value.toUpperCase(),
                  }));
                }}
                maxLength={50}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <InputSuggestions
                id="Iddepartamentoubicacion"
                name=""
                label={"Departamento"}
                type="search"
                autoComplete="off"
                suggestions={dataDepartamento.dataRender || []}
                onSelectSuggestion={(i, el) =>
                  onSelectSuggestion(i, el, "Iddepartamentoubicacion")
                }
                value={filterData.Iddepartamentoubicacion || ""}
                onChange={(e) => {
                  setFilterData((old) => ({
                    ...old,
                    Iddepartamentoubicacion: e.target.value.toUpperCase(),
                  }));
                }}
                maxLength={50}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Input
                id="Telefonopropietario"
                name="Telefonopropietario"
                label={"Número de teléfono"}
                type="text"
                autoComplete="off"
                minLength={0}
                maxLength={20}
                value={dataSiian?.Telefonopropietario}
                onChange={onChangeFormatNumber}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Select
                id="Idestrato"
                name="Idestrato"
                label="Estrato"
                options={DATA_SIIAN_ESTRATO}
                value={dataSiian?.Idestrato}
                onChange={onChangeFormat}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
              <Select
                id="Idtipocliente"
                name="Idtipocliente"
                label="Tipo cliente"
                options={DATA_TIPO_CLIENTE_SIIAN}
                value={dataSiian?.Idtipocliente}
                onChange={onChangeFormat}
                required
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              />
            </Fieldset>
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={(e) => {
                  notifyError("Creación cancelada por el usuario");
                  closeModule(e);
                }}
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  loadingPeticionConsultaTerceros ||
                  loadingPeticionCreacionTerceros
                }
              >
                {dataSiian.Id === 0 ? "Crear tercero" : "Actualizar tercero"}
              </Button>
            </ButtonBar>
          </Form>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default GestionTercerosCreditoFacil;
