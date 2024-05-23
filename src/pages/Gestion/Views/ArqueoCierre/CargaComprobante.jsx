import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Fragment,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Select from "../../../../components/Base/Select";
import FileInput from "../../../../components/Base/FileInput";
import Fieldset from "../../../../components/Base/Fieldset";
import TextArea from "../../../../components/Base/TextArea";
import Button from "../../../../components/Base/Button";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { onChangeAccountNumber,makeMoneyFormatter } from "../../../../utils/functions";
import {
  buscarEntidades,
  subirComprobante,
  agregarComprobante,
  buscarTiposComprobantes,
  movimientoBoveda,
  verValorBoveda,
  movimientoEfectivoEntreCajeros,
} from "../../utils/fetchCaja";
import { useAuth } from "../../../../hooks/AuthHooks";
import useMoney from "../../../../hooks/useMoney";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";
import Magnifier from "react-magnifier";
import ButtonLink from "../../../../components/Base/ButtonLink";
import Modal from "../../../../components/Base/Modal/Modal";
// import SearchEntidadesExternas from "../../components/CargarComprobantes/SearchEntidadesExternas";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";

const formatMoney = makeMoneyFormatter(0);

const url_user = process.env.REACT_APP_URL_IAM_PDP;

const CargaComprobante = () => {
  const navigate = useNavigate();
  const { roleInfo,userPermissions,quotaInfo,userInfo,pdpUser} = useAuth();
  const formRef = useRef(null);
  const [tiposComprobantes, setTiposComprobantes] = useState([]);

  const [movementType, setMovementType] = useState("");
  const [foundEntities, setFoundEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [EntityIndex, setEntityIndex] = useState([]);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [TipoMovimiento, settipoMovimiento] = useState("");
  const [comprobanteNumber, setComprobanteNumber] = useState("");
  const [valorComprobante, setValorComprobante] = useState(0.0);
  const [valorEfectivoPdp, setvalorEfectivoPdp] = useState(0.0);

  const [valorEfectivoBoveda, setvalorEfectivoBoveda] = useState(0.0);
  const [valorEfectivoRedesExternas, setvalorEfectivoRedesExternas] = useState(0.0);
  const [observaciones, setObservaciones] = useState("");
  const [rolIngreso, setRolIngreso] = useState(false);
  const [rolRetiro, setRolRetiro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [selectedEntidadesExt, setSelectedEntidadesExt] = useState({
  //   entidades_agregar: [],
  // });
  const [valorEnCaja, setValorEnCaja] = useState(0);
  const [valor_Boveda, setValorEnBoveda] = useState(0);
  // const [idComercio, setIdComercio] = useState(roleInfo?.id_comercio);
  // const [nameComercio, setNameComercio] = useState(roleInfo?.nombre_comercio);
  // const [idUser, setIdUser] = useState(pdpUser?.uuid);
  // const [nameUser, setNameUser] = useState(pdpUser?.uname);

  const [idUserRecibe, setIdUserRecibe] = useState("");
  const [valorEfectivoTransferir, setvalorEcfectivoTransferir] = useState(0.0);
  const [nameUserRecibe, setNameUserRecibe] = useState("");

  // const [valoresExternos, setValoresExternos] = useState({});

  const [limitesMontos, setLimitesMontos] = useState({
    max: 100000000,
    min: 5000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const staticInfo = useMemo(
    () => ({
      "Id comercio": roleInfo?.id_comercio ?? 59,
      "Nombre comercio": roleInfo?.nombre_comercio,
      "Id usuario": roleInfo?.id_usuario ?? 8202,
      "Nombre usuario": pdpUser?.uname
    }),
    [roleInfo?.id_comercio, roleInfo?.id_usuario, pdpUser?.uname, roleInfo?.nombre_comercio]
  );

  const staticInfo2 = useMemo(
    () => ({
      "Id comercio": roleInfo?.id_comercio ?? 59,
      "Nombre comercio": roleInfo?.nombre_comercio,
      "Id Usuario que transfiere": roleInfo?.id_usuario ?? 8202,
      "Nombre usuario que transfiere": pdpUser?.uname
    }),
    [roleInfo?.id_comercio, roleInfo?.id_usuario, pdpUser?.uname, roleInfo?.nombre_comercio]
  );

  const searchEntities = useCallback((is_transport) => {
    buscarEntidades({
      pk_is_transportadora: is_transport,
      limit: 50,
    })
      .then((res) => {
        if (Array.isArray(res?.obj?.results)) {
          for (const element of res?.obj?.results) {
            if (element.pk_numero_cuenta !== null) {
              let NumCuentas = element.pk_numero_cuenta.pk_numero_cuenta1===undefined?[]:[element.pk_numero_cuenta.pk_numero_cuenta1]
              if(element.pk_numero_cuenta.pk_numero_cuenta2 !== undefined)
                NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta2)
              if(element.pk_numero_cuenta.pk_numero_cuenta3 !== undefined)
                NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta3)
              element.pk_numero_cuenta=NumCuentas
            }
          }
          setFoundEntities(res?.obj?.results);
          if (res?.obj?.results?.length === 0) {
            notifyError("No se encontradon datos de entidades");
          }
          return;
        }
        throw new Error("Objeto recibido erroneo");
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

  const uploadComprobante = useCallback(async () => {
    try {
      // var valores = await verValorBoveda({
      //   id_usuario: roleInfo?.id_usuario,
      //   id_comercio: roleInfo?.id_comercio,
      //   id_terminal: roleInfo?.id_dispositivo,
      // });
      // var valor_Boveda = valores?.obj[0]?.valor_boveda !== undefined?parseInt(valores?.obj[0]?.valor_boveda):0
      if (movementType !== "Transferencia de efectivo entre cajeros") {
        if (movementType !== "Movimiento a bóveda") {
          // var sumExter = 0
          // Object.values(valoresExternos).map((e)=> sumExter += e)
          // if (parseInt(valorComprobante) !== 0 || (Object.keys(valoresExternos).length !== 0 && sumExter !== 0)) {
          if (parseInt(valorComprobante) !== 0) {
            // if (movementType !== "Recibido transportadora") {          
            //   if ((quotaInfo?.quota-valor_Boveda) < valorEfectivoPdp) {
            //     throw new Error("Efectivo insuficiente en Caja", {
            //       cause: "custom",
            //     });
            //   }
            //   if (valor_Boveda < valorEfectivoBoveda) {
            //     throw new Error("Efectivo insuficiente en bóveda", {
            //       cause: "custom",
            //     });
            //   }
            // }

            if (!selectedEntity) {
              throw new Error("No se ha seleccionado una entidad", {
                cause: "custom",
              });
            }
            if (!file) {
              throw new Error("No se ha seleccionado un archivo", {
                cause: "custom",
              });
            }
      
            /**
             * Pedir url prefirmada
             */
            const resFile = await subirComprobante({
              filename: `comprobantes/${roleInfo?.id_comercio};${
                roleInfo?.id_comercio
              }_${roleInfo?.id_usuario}_${roleInfo?.id_dispositivo}_comprobante.${
                file?.name?.split(/\./)?.[1]
              }`,
              contentType: file?.type,
            });
      
            /**
             * Armar peticion para subir a s3
             */
            const { url, fields } = resFile.obj;
            const filename = fields.key;
      
            const reqBody = {
              fk_nombre_entidad: selectedEntity,
              fk_tipo_comprobante: movementType,
              id_comercio: roleInfo?.id_comercio,
              nombre_comercio: roleInfo?.nombre_comercio,
              id_usuario: roleInfo?.id_usuario,
              id_terminal: roleInfo?.id_dispositivo,
              nro_comprobante: comprobanteNumber,
              valor_movimiento: valorComprobante,
              observaciones: observaciones,
              archivo: filename,
              valor_efectivo_pdp: valorEfectivoPdp,
              valor_efectivo_boveda: valorEfectivoBoveda,
              valores_externos: valorEfectivoRedesExternas,
            };
            if (movementType === "Consignación Bancaria") {
              reqBody["nro_cuenta"] = accountNumber;
            }
            await agregarComprobante(reqBody);
      
            const formData = new FormData();
            for (var key in fields) {
              formData.append(key, fields[key]);
            }
            formData.set("file", file);
            await fetch(url, {
              method: "POST",
              body: formData,
              mode: "no-cors",
            });
          }else{
            throw new Error("Registre un valor para el comprobante", {
              cause: "custom",
            });
          }
        }else{
          if(TipoMovimiento === "Ingreso a bóveda"){
            if((quotaInfo?.quota-valor_Boveda) < valorComprobante) {
              throw new Error("Efectivo insuficiente en Caja", {
                cause: "custom",
              });
            }
          }
          const reqBody = {
            id_comercio: roleInfo?.id_comercio,
            id_usuario: roleInfo?.id_usuario,
            id_terminal: roleInfo?.id_dispositivo,
            valor_movimiento: valorComprobante,
            observaciones: observaciones,
            tipo_movimiento: TipoMovimiento,
          };
          await movimientoBoveda(reqBody);
        }
      }else{
        const reqBody = {
          id_comercio: roleInfo?.id_comercio,
          nombre_comercio: roleInfo?.nombre_comercio,
          id_usuario: roleInfo?.id_usuario,
          nombre_usuario: pdpUser?.uname,
          id_usuario_recibe: idUserRecibe,
          nombre_usuario_recibe: nameUserRecibe,
          valor_movimiento: valorEfectivoTransferir,
          observaciones: observaciones,
        };
          await movimientoEfectivoEntreCajeros(reqBody);
      }
    } catch (error) {
      throw error;
    }
  }, [
    idUserRecibe,
    nameUserRecibe,
    valorEfectivoTransferir,
    pdpUser?.uname,
    valor_Boveda,
    file,
    movementType,
    selectedEntity,
    roleInfo?.id_comercio,
    roleInfo?.id_usuario,
    roleInfo?.id_dispositivo,
    accountNumber,
    comprobanteNumber,
    valorComprobante,
    observaciones,
    TipoMovimiento,
    quotaInfo,
    valorEfectivoPdp,
    valorEfectivoBoveda,
    // valoresExternos,
    roleInfo?.nombre_comercio,
    valorEfectivoRedesExternas,
    // nameUserRecibe
  ]);

  const onFileChange = useCallback((files) => {   
    const _files = Array.from(files);
    if (_files.length > 0) {
      setFile(_files[0]);
      setImage(URL.createObjectURL(_files[0]));
    }
  }, []);
  
  const valuesComprobante = () => {
    const suma = valorEfectivoPdp + valorEfectivoBoveda + valorEfectivoRedesExternas;
    setValorComprobante(suma.toString());
  };
  
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      notifyPending(
        uploadComprobante(),
        {
          render: () => {
            return "Procesando peticion";
          },
        },
        {
          render: () => {
            // navigate("/gestion/arqueo");
            if (movementType === "Movimiento a bóveda" || movementType === "Transferencia de efectivo entre cajeros") {
              return "Movimiento exitoso";
            }else{
              return "Comprobante subido exitosamente";
            }
          },
        },
        {
          render: ({ data: err }) => {
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Peticion fallida";
          },
        }
      );           
    },
    [uploadComprobante, navigate, movementType]
  );

  useEffect(() => {
    const id_permission = []
    userPermissions.forEach(function(val) {
      id_permission.push(val.id_permission)
    })
    id_permission.includes(7012)?setRolIngreso(true):setRolIngreso(false)
    id_permission.includes(7013)?setRolRetiro(true):setRolRetiro(false)
    buscarTiposComprobantes()
      .then((res) => {
        setTiposComprobantes(
          (res?.obj ?? [])
            .filter(({ nombre_comprobante }) => 
              (id_permission.includes(7014) && nombre_comprobante === 'Consignación Bancaria') ||
              (id_permission.includes(7015) && nombre_comprobante === 'Entrega transportadora') ||
              (id_permission.includes(7016) && nombre_comprobante === 'Recibido transportadora') ||
              (id_permission.includes(7017) && nombre_comprobante === 'Movimiento a bóveda') ||
              (id_permission.includes(7018) && nombre_comprobante === 'Transferencia de efectivo entre cajeros')
            )
            .map(({ nombre_comprobante }) => ({
              value: nombre_comprobante,
              label: nombre_comprobante
            }))
        );
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  }, [userPermissions]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        var valores = await verValorBoveda({
          id_usuario: roleInfo?.id_usuario,
          id_comercio: roleInfo?.id_comercio,
          id_terminal: roleInfo?.id_dispositivo,
        });
        var valor_Boveda = valores?.obj[0]?.valor_boveda !== undefined?parseInt(valores?.obj[0]?.valor_boveda):0
        setValorEnBoveda(valor_Boveda)
        setValorEnCaja(quotaInfo?.quota-valor_Boveda)
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, [
    quotaInfo?.quota,
    roleInfo?.id_usuario,
    roleInfo?.id_comercio,
    roleInfo?.id_dispositivo,
  ]);

  // const EntityExt = useCallback(() =>{
  //   setShowModal(true);
  // }, []);

  const handleClose2 = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleUserRecibe = useCallback(async (ev) => {
    if (ev !== "") {
      var valor = ev.replace(/[^0-9]/g, '');
      setIdUserRecibe(valor)
      const nameUser = await getUser(`${url_user}/user-unique?uuid=${valor}`);
      setNameUserRecibe(nameUser)
    }else{
      setIdUserRecibe("")
      setNameUserRecibe("")
    }
  }, []);

  const [getUser] = useFetchDispatchDebounce(
    {
      onSuccess: useCallback((res) => {return res?.obj}, []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          // notifyError(error.message);
          return null
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 100 }
  );

  // const renderInputs = () => {
  //   return selectedEntidadesExt.entidades_agregar.map(entidad => (
  //     <Input
  //       id={`${entidad.nombre_plataforma}`}
  //       name={`${entidad.nombre_plataforma}`}
  //       label={`Valor efectivo ${entidad.nombre_plataforma}`}
  //       autoComplete="off"
  //       type="tel"
  //       maxLength={"12"}
  //       onInput={(ev) => handleInputChange(entidad.nombre_plataforma, onChangeMoney(ev))}
  //       actionBtn = {{
  //         callback: () => {onSelectComercioDeleteAgregar(entidad)},
  //         label: <span className="bi bi-x-lg self-center cursor-pointer"/>
  //       }}
  //     />
  //   ));
  // };

  // const onSelectComercioDeleteAgregar = useCallback((entidadToDelete) => {
  //   let newList = []
  //   selectedEntidadesExt?.entidades_agregar?.map((entidad) => {
  //     if(entidad.id_plataforma !== entidadToDelete.id_plataforma) {
  //       newList.push(entidad)
  //     }else{
  //       const nuevosValores = Object.fromEntries(
  //         Object.entries(valoresExternos).filter(([key]) => key !== entidadToDelete.nombre_plataforma)
  //       );
  //       setValoresExternos(nuevosValores)
  //     }
  //   })
  //   setSelectedEntidadesExt((old) => {
  //     return {
  //       ...old,
  //       entidades_agregar: newList,
  //     };
  //   });
  // }, [setSelectedEntidadesExt,valoresExternos,selectedEntidadesExt]);

  // const handleInputChange = (id, value) => {
  //   setValoresExternos({
  //     ...valoresExternos,
  //     [id]: value,
  //   });
  // };

  const handleCheck = useCallback(() => {
    if (nameUserRecibe !== null && nameUserRecibe !== "") {
      if (nameUserRecibe?.active === true) {
        if (nameUserRecibe?.fk_id_comercio === roleInfo?.id_comercio) {
          if (nameUserRecibe?.email === pdpUser?.email) {
            setShowModal(true)
          }else{
            notifyError("No esta permitido hacer transferencia entre el mismo usuario")
          }
        }else{
          notifyError("El usuario que recibe no esta asociado al mismo comercio")
        }
      }else{
        notifyError("El usuario que recibe no esta activo")
      }
    }else{
      notifyError("El id usuario que recibe no existe")
    }
  }, [nameUserRecibe,
    pdpUser?.email,
    roleInfo?.id_comercio
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Bóveda, Consignaciones y Transportadora</h1>
      <Form grid>
        <Select
          id="searchByType"
          name="tipoComp"
          label="Tipo de movimiento"
          options={[{ value: "", label: "" }, ...tiposComprobantes]}
          onChange={(e) => {
            const val = e.target.value ?? "";
            formRef.current?.reset?.();
            setSelectedEntity(null);
            setMovementType(val);
            searchEntities(val !== "Consignación Bancaria");
            setValorComprobante(0.0)
            setvalorEfectivoPdp(0.0)
            setvalorEfectivoBoveda(0.0)
            setvalorEfectivoRedesExternas(0.0)
            setvalorEcfectivoTransferir(0.0)
            setIdUserRecibe("")
            setNameUserRecibe("")
            setFile(null)
            setImage(null)
            // setSelectedEntidadesExt((old) => {return {...old,entidades_agregar: [],};});
            // setValoresExternos({})
          }}
        />
        <ButtonBar />
      </Form>
      {Boolean(movementType) && (
        <Form onSubmit={onSubmit} ref={formRef} grid>
          <Fieldset
            legend={"Información del movimiento"}
            className="lg:col-span-2"
          >
          {movementType !== "Transferencia de efectivo entre cajeros" ?
            Object.entries(staticInfo).map(([key, val]) => (
              <Input
                key={key}
                id={key}
                label={key}
                type="text"
                value={val}
                disabled
              />
            ))
          :
            Object.entries(staticInfo2).map(([key, val]) => (
              <Input
                key={key}
                id={key}
                label={key}
                type="text"
                value={val}
                disabled
              />
            ))
          }
          {movementType !== "Transferencia de efectivo entre cajeros"?<>
            {movementType !== "Movimiento a bóveda"?
              <>
                <Select
                  id="searchEntities"
                  name="tipoComp"
                  label={`Buscar ${
                    movementType === "Consignación Bancaria"
                      ? "bancos"
                      : "transportadoras"
                  }`}
                  options={[
                    { value: "", label: "" },
                    ...foundEntities.map(({ pk_nombre_entidad }) => ({
                      value: pk_nombre_entidad,
                      label: pk_nombre_entidad,
                    })),
                  ]}
                  value={selectedEntity}
                  onChange={(e) => {
                    const tempMap = new Map(
                      foundEntities.map(({ pk_nombre_entidad, parametros }) => [
                        pk_nombre_entidad,
                        parametros,
                      ])
                    );
                    if (foundEntities[e?.target?.selectedIndex-1]?.pk_numero_cuenta != null) {
                      setEntityIndex(foundEntities[e?.target?.selectedIndex-1]?.pk_numero_cuenta)
                    }else{setEntityIndex([])}
                    setSelectedEntity(e.target.value);
                    setLimitesMontos((old) => ({
                      min: tempMap.get(e.target.value)?.monto_minimo ?? old.min,
                      max: tempMap.get(e.target.value)?.monto_maximo ?? old.max,
                    }));
                  }}
                  required
                />
                {movementType === "Consignación Bancaria" && (
                  <Select
                    id="accountNum"
                    name="accountNum"
                    label="Número de cuenta"
                    options={[
                      { value: "", label: "" },
                      ...EntityIndex.map((pk_numero_cuenta) => ({
                        value: pk_numero_cuenta,
                        label: pk_numero_cuenta,
                      })),
                    ]}
                    value={accountNumber}
                    onChange={(ev) => {
                      setAccountNumber(ev.target.value)
                    }}
                    required
                    type="tel"
                  />
                )}
                <Input
                  id="comprobanteNum"
                  name="comprobanteNum"
                  label="Número de comprobante"
                  type="tel"
                  autoComplete="off"
                  minLength={"4"}
                  maxLength={"19"}
                  onInput={(ev) => setComprobanteNumber(onChangeAccountNumber(ev))}
                  required
                />
                {movementType === "Consignación Bancaria" || movementType === "Entrega transportadora" ?(<>
                  {roleInfo?.tipo_comercio === "OFICINAS PROPIAS"?<>
                    <Input
                      id="valor_caja_pdp"
                      name="valor_caja_pdp"  
                      label={`Valor efectivo Caja`}
                      autoComplete="off"
                      type="tel"
                      maxLength={"13"}
                      onInput={(ev) => setvalorEfectivoPdp(onChangeMoney(ev))}
                      onBlur={valuesComprobante}
                    />
                    <Input
                      id="valor_boveda"
                      name="valor_boveda"  
                      label={`Valor efectivo Bóveda`}
                      autoComplete="off"
                      type="tel"
                      maxLength={"12"}
                      onInput={(ev) => setvalorEfectivoBoveda(onChangeMoney(ev))}
                      onBlur={valuesComprobante}
                    />
                    <Input
                      id="valor_redes_externas"
                      name="valor_redes_externas"  
                      label={`Valor efectivo Redes Externas`}
                      autoComplete="off"
                      type="tel"
                      maxLength={"12"}
                      onInput={(ev) => setvalorEfectivoRedesExternas(onChangeMoney(ev))}
                      onBlur={valuesComprobante}
                    />
                    <Input
                      id="valor"
                      name="valor"  
                      label={`Valor total`}
                      type="tel"
                      value={formatMoney.format(valorComprobante)}
                      disabled
                    />
                  </>:<>
                    <Input
                      id="valor_caja_pdp"
                      name="valor_caja_pdp"  
                      label={`Valor efectivo`}
                      autoComplete="off"
                      type="tel"
                      minLength={"5"}
                      maxLength={"13"}
                      onInput={(ev) => setvalorEfectivoPdp(onChangeMoney(ev))}
                      onBlur={valuesComprobante}
                      required
                    />
                  </>}
                  {/* {renderInputs()} */}
                  {/* <ButtonBar>
                    <Button type="button" onClick={() => EntityExt()}>
                      Agregar valores redes externas
                    </Button>
                  </ButtonBar> */}
                </>):(
                  <Input
                    id="valor"
                    name="valor"  
                    label={`Valor ${movementType.split(/\s/)[0].toLowerCase()}`}
                    autoComplete="off"
                    type="tel"
                    minLength={"5"}
                    maxLength={"13"}
                    onInput={(ev) => setValorComprobante(onChangeMoney(ev))}
                    required
                  />  
                )}
              </>:<>
                <Select
                  id="tipo_movimiento"
                  name="tipo_movimiento"
                  label="Tipo de movimiento"
                  options={[
                    { value: "", label: "" },
                    ...(rolIngreso?[{ value: "Ingreso a bóveda", label: "Ingreso a bóveda" }]:[]),
                    ...(rolRetiro?[{ value: "Retiro de bóveda", label: "Retiro de bóveda" }]:[]),
                  ]}
                  value={TipoMovimiento}
                  onChange={(ev) => {
                    settipoMovimiento(ev.target.value)
                  }}
                  required
                  type="tel"
                />
                {TipoMovimiento === "Ingreso a bóveda"?
                  <Input
                    id="efectivo_caja"
                    name="efectivo_caja"  
                    label={`Efectivo en caja`}
                    type="tel"
                    value={formatMoney.format(valorEnCaja)}
                    disabled
                  />
                :null}
                {TipoMovimiento === "Retiro de bóveda"?
                  <Input
                    id="efectivo_boveda"
                    name="efectivo_boveda"  
                    label={`Efectivo en bóveda`}
                    type="tel"
                    value={formatMoney.format(valor_Boveda)}
                    disabled
                  />
                :null}
                <Input
                  id="valor"
                  name="valor"
                  label={`Valor del movimiento`}
                  autoComplete="off"
                  type="tel"
                  maxLength={"12"}
                  onInput={(ev) => setValorComprobante(onChangeMoney(ev))}
                  required
                />
              </>}
              <TextArea
                id="observaciones"
                name="observaciones"
                label="Observaciones"
                className="w-full place-self-stretch"
                autoComplete="off"
                maxLength={"60"}
                onInput={(e) => {
                  setObservaciones(e.target.value.trimLeft());
                  e.target.value = e.target.value.trimLeft();
                }}
                info={`Máximo 60 caracteres`}
                required
              />
              {movementType !== "Movimiento a bóveda" ?
                !file ? (
                  <FileInput
                    label={"Elegir archivo (comprobante)"}
                    onGetFile={onFileChange}
                    name="file"
                    accept=".png,.jpg,.jpeg"
                    allowDrop={true}
                  />
                ) : (
                  <>
                    <div className="text-center my-4 mx-auto md:mx-4 flex flex-row flex-wrap justify-around">
                      <div className="">
                        <div className="flex flex-row justify-center">
                          <h3 className="text-sm">{file?.name ?? ""}</h3>
                          <span
                            className="bi bi-x-lg text-2xl ml-5 self-center cursor-pointer"
                            onClick={() => setFile(null)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <div className="text-2xl mt-2 mb-3">                            
                        {file && (
                          <div style={{ width: '30%', margin: '0 auto' }}>
                            <Magnifier src={image} zoomFactor={2} alt="Uploaded" style={{ width: '100%' }}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              :null}
            </>:<>
              <Input
                id="id_usuario_recibido"
                name="id_usuario_recibido"  
                label={`Id Usuario que recibe`}
                autoComplete="off"
                type="tel"
                maxLength={"15"}
                value={idUserRecibe}
                onChange={(ev) => {handleUserRecibe(ev.target.value)}}
                required
              />
              <Input
                id="name_usuario_recibe"
                name="name_usuario_recibe"  
                label={`Nombre usuario que recibe`}
                autoComplete="off"
                type="tel"
                value={nameUserRecibe === ""?"":nameUserRecibe?.uname}
                required
                disabled
              />
              <Input
                id="valor_transferir_recibe"
                name="valor_transferir_recibe"  
                label={`Valor a transferir`}
                autoComplete="off"
                type="tel"
                maxLength={"12"}
                onInput={(ev) => setvalorEcfectivoTransferir(onChangeMoney(ev))}
                required
              />
              <TextArea
                id="observaciones"
                name="observaciones"
                label="Observaciones"
                className="w-full place-self-stretch"
                autoComplete="off"
                maxLength={"100"}
                onInput={(e) => {
                  setObservaciones(e.target.value.trimLeft());
                  e.target.value = e.target.value.trimLeft();
                }}
                info={`Máximo 100 caracteres`}
                required
              />
              <Input
                id="total_efectivo_cajero"
                name="total_efectivo_cajero"  
                label={`Total efectivo cajero`}
                type="tel"
                value={formatMoney.format(valor_Boveda)}
                disabled
              />
            </>}
            <ButtonBar className="lg:col-span-2">
              <ButtonLink
                to={"/gestion/arqueo"}
                onClick={() => { notifyError("Movimiento Cancelado") }}
              >
                Cancelar
              </ButtonLink>
              {movementType !== "Transferencia de efectivo entre cajeros" ?
                <Button type="submit" className="text-center">
                  Realizar movimiento
                </Button>
              :
                <Button type="" className="text-center" onClick={() => handleCheck()}
                disabled={
                  idUserRecibe === "" ||
                  valorEfectivoTransferir === 0.0 ||
                  observaciones === ""}
                >
                  Realizar movimiento
                </Button>
              }
            </ButtonBar>

            {/* <Modal show={showModal} handleClose={handleClose2}>
              <SearchEntidadesExternas
                setSelectedEntidadesExt={setSelectedEntidadesExt}
                handleClose={handleClose2}
                selectedEntidadesExt={selectedEntidadesExt}
              />
            </Modal> */}

            <Modal show={showModal} handleClose={handleClose2}>
              <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
                <>
                  <PaymentSummary 
                    title = {"¿Está seguro de realizar la transferencia de efectivo?"} 
                    subtitle = {"Resumen del movimiento"}
                    summaryTrx={
                      {"Id usuario que transfiere": roleInfo?.id_usuario,
                        "Nombre usuario que transfiere": userInfo?.attributes?.name,
                        "Id usuario que recibe": idUserRecibe,
                        "Nombre usuario que recibe": nameUserRecibe?.uname,
                      }
                    }>
                  </PaymentSummary>
                  <ButtonBar>
                    <Button onClick={() => {handleClose2()}}>
                      Cancelar
                    </Button>
                    <Button type='submit' onClick={() => onSubmit}>
                      Aceptar
                    </Button>
                  </ButtonBar>
                </>
              </div>
            </Modal>

          </Fieldset>
        </Form>
      )}
    </Fragment>
  );
};

export default CargaComprobante;
