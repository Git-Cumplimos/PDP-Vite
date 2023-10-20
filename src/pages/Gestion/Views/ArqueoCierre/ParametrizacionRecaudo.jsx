import React, { useState, useCallback, useEffect, Fragment } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  crearEntidad,
  buscarEntidades,
  editarEntidades,
} from "../../utils/fetchCaja";
import {notifyError, notifyPending} from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset";
import MoneyInput from "../../../../components/Base/MoneyInput";
import _ from 'lodash';

var Num = 1;
var valor = 0;
var validate = true;


const originalState= {pk_numero_cuenta1: undefined, pk_numero_cuenta2: undefined, pk_numero_cuenta3: undefined};
const originalStateParametros = {monto_maximo: undefined, monto_minimo: undefined};

const ParametrizacionRecaudo = () => {
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState(null);
  const [maxpages, setMaxPages] = useState(2);
  const [data, setData] = useState([]);
  const [dataComplet, setDataComplet] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ pk_nombre_entidad: "" });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [Count, setCount] = useState(1);
  const [NumCountjson, setNumCountjson] = useState(originalState)
  const [parametrosValues, setParametrosValues] = useState(originalStateParametros)
  const keysToExclude = ["pk_numero_cuenta1", "pk_numero_cuenta2", "pk_numero_cuenta3"];
  const range = _.range(1, Count+1);

  const closeModal = useCallback(() => {
    setCount(1);
    Num = 1;
    setShowModal(false);
    setType(null);
    setSelectedEntity(null);
    setNumCountjson(originalState);
  }, []);

  const buscarEnt = useCallback(() => {
    buscarEntidades({ ...pageData, ...searchFilters })
      .then((res) => {
        setMaxPages(res?.obj?.maxPages);
        const originalData =  JSON.parse(JSON.stringify(res?.obj?.results));
        const changeValues = res?.obj?.results.map((element) => {
          if (element.pk_numero_cuenta !== null) {
            let NumCuentas=element.pk_numero_cuenta.pk_numero_cuenta1===undefined?[]:[element.pk_numero_cuenta.pk_numero_cuenta1+"\n"]
            if(element?.pk_numero_cuenta?.pk_numero_cuenta2 !== undefined)
              NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta2+"\n")
            if(element?.pk_numero_cuenta?.pk_numero_cuenta3 !== undefined)
              NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta3+"\n")
            element.pk_numero_cuenta=NumCuentas;
          }
          return element
        });
        setDataComplet(originalData);
        setData(changeValues);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [pageData, searchFilters]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData)).map(([key, val]) => {
          if (keysToExclude.includes(key)) {return ["pk_numero_cuenta",NumCountjson];}
          return [
            key,
            key === "pk_is_transportadora"
              ? val === "2"
              : key === "pk_nombre_entidad"
              ? val.trim()
              : val,
          ];
        })
      );
      if (body?.pk_is_transportadora === false) {
        if (body?.pk_numero_cuenta['pk_numero_cuenta1'] !== undefined) {
          validate = verificarValoresDiferentes(
          body?.pk_numero_cuenta?.pk_numero_cuenta1,
          body?.pk_numero_cuenta?.pk_numero_cuenta2,
          body?.pk_numero_cuenta?.pk_numero_cuenta3);
        }
      }
      if (validate) {
        notifyPending(
          crearEntidad(body),
          {
            render: () => {
              return "Procesando peticion";
            },
          },
          {
            render: ({ data: res }) => {
              closeModal();
              buscarEnt();
              return res?.msg;
            },
          },
          {
            render: ({ data: err }) => {
              if (err?.cause === "custom") {
                if (body.pk_is_transportadora) {
                  return 'Transportadora duplicada';
                }else{
                  return 'Entidad bancaria duplicada';
                }
              }
              console.error(err?.message);
              return "Peticion fallida";
            },
          }
        );
      }else{
        notifyError('Número de cuentas duplicado')
      }
    },
    [closeModal, buscarEnt,NumCountjson]
  );

  const handleSubmitUpdate = useCallback(
    (ev) => {
      ev.preventDefault();
      selectedEntity.parametros = parametrosValues
      if (selectedEntity?.parametros === null ) {
        delete selectedEntity.parametros
      } 
      validate = verificarValoresDiferentes(
        selectedEntity?.pk_numero_cuenta?.pk_numero_cuenta1,
        selectedEntity?.pk_numero_cuenta?.pk_numero_cuenta2,
        selectedEntity?.pk_numero_cuenta?.pk_numero_cuenta3);
      if (validate) {
        notifyPending(
          editarEntidades(
            {
              pk_nombre_entidad: "",
              pk_is_transportadora: "",
              pk_id_entidad:"",
            },
            selectedEntity
          ),
          {
            render: () => {
              return "Procesando peticion";
            },
          },
          {
            render: ({ data: res }) => {
              closeModal();
              buscarEnt();
              return res?.msg;
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
      }else{
        notifyError('Número de cuentas duplicado')
      }
    },
    [closeModal, buscarEnt, selectedEntity,parametrosValues]
  );

  useEffect(() => {
    buscarEnt();
  }, [buscarEnt]);

  const handleChangeCount = (Nun) => {
    if(Num >= 1 ){ if(Num <= 2 || Nun < 0){
        Num = Num + Nun
        valor=Num+1
        if (valor < 4) {NumCountjson['pk_numero_cuenta'+(valor).toString()] = undefined}
        setCount(Num) 
      }
    }if (Num === 0){ Num=1  
      setCount(Num)}
  };

  const handleInput = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 20) {
      setNumCountjson((old)=>{return{...old,[e.target.name]:value}})
    }
  }
  
  function verificarValoresDiferentes(...valores) {
    let no_cuentas=[]
    for (const valor of valores) {
      if (valor !== undefined) {
        no_cuentas.push(valor);
      }
    }
    const conjunto = new Set(no_cuentas);
    return conjunto.size === no_cuentas.length;
  }

  const generateUniqueKey = (existingKeys) => {
    let index = 1;
    let newKey = `pk_numero_cuenta${index}`;
    while (existingKeys.includes(newKey)) {
      index++;
      newKey = `pk_numero_cuenta${index}`;
    }
    return newKey;
  };

  const DisableState = (valueDsBle) => {
    let valores = Object.values(valueDsBle)
    return valores.includes("")
  };

  const handleChangeNum = (e,key) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 20) {
      setSelectedEntity((old) => {
        const cuentasBanco = new Map(
          Object.entries(old?.pk_numero_cuenta ?? {})
        );
        cuentasBanco.set(key, value);
        return {
          ...old,
          pk_numero_cuenta: Object.fromEntries(cuentasBanco),
        };
      })
    }
  };

  const handleChangeCurrenci = (e,valor) => {
    setParametrosValues((old) => {
      return{...old,[e.target.name]:valor}
    })
  };

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear cuenta
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Bancos/Transportadoras"
        headers={["Nombre entidad", "Tipo entidad","Número de Cuentas"]}
        maxPage={maxpages}
        onSetPageData={setPageData}
        data={
          data?.map(({ pk_nombre_entidad, pk_is_transportadora, pk_numero_cuenta}) => ({
            pk_nombre_entidad,
            pk_is_transportadora: pk_is_transportadora ? "TRANSPORTADORA" : "BANCO",
            pk_numero_cuenta: pk_numero_cuenta === undefined ? null : pk_numero_cuenta,
          })) ?? []
        }
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
        onSelectRow={(e, i) => {
          setSelectedEntity(dataComplet[i]);
          setSelectedEntity((old)=>{return {...old, pk_numero_cuenta : dataComplet[i].pk_numero_cuenta === null?{}:dataComplet[i].pk_numero_cuenta}});
          setParametrosValues((old)=>{return {
            ...old, 
            monto_maximo : data[i]?.parametros?.monto_maximo,
            monto_minimo : data[i]?.parametros?.monto_minimo
          }})
        }}
      >
        <Input
          id="pk_nombre_entidad"
          name="pk_nombre_entidad"
          label={"Entidad"}
          type="text"
          autoComplete="off"
          maxLength={"20"}
        />
        <ButtonBar />
      </TableEnterprise>
      <Modal show={showModal || selectedEntity} handleClose={closeModal}>
        {!selectedEntity ? (
          <Form onSubmit={handleSubmit} grid>
            <Select
              id="pk_is_transportadora"
              name="pk_is_transportadora"
              label="Tipo de entidad"
              options={[
                { value: "", label: "" },
                { value: "1", label: "Bancos" },
                { value: "2", label: "Transportadora" },
              ]}
              onChange={(e) =>
                setType(
                  e.target.value === "1"
                    ? false
                    : e.target.value === "2"
                    ? true
                    : null
                )
              }
              required
            />
            {type !== null && (
              <Fragment>
                <Input
                  id="pk_nombre_entidad"
                  name="pk_nombre_entidad"
                  label={`Nombre ${type ? "transportadora" : "banco"}`}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  autoComplete="off"
                  maxLength={"20"}
                  required
                />
                {type === false ?(
                  range.map((number) => (
                    <Input
                      id={"pk_numero_cuenta"+number}
                      name={"pk_numero_cuenta"+number}
                      label={`Número de Cuenta`}
                      type="number"
                      value={NumCountjson['pk_numero_cuenta'+number]}
                      onChange={(e) => handleInput(e)}
                      autoComplete="off"
                      required
                    />
                  ))
                ):null}
                <ButtonBar>
                  <Button type="button" onClick={closeModal}>
                    Cancelar
                  </Button>
                  {type === false ?( 
                    <Button type="button" onClick={() =>handleChangeCount(1)}>
                      Añadir cuenta
                    </Button>):null}
                  {type === false ?(
                     Count > 1 ?(<Button type="button" onClick={() =>handleChangeCount(-1)}>Eliminar Cuenta</Button>):null
                  ):null}
                  <Button type="submit">
                    Crear {type ? "transportadora" : "banco"}
                  </Button>
                </ButtonBar>
               </Fragment>
            )}
          </Form>
        ) : (
          <Form onSubmit={handleSubmitUpdate} grid>
            <Input
              id="pk_nombre_entidad"
              name="pk_nombre_entidad"
              label={`Nombre ${
                selectedEntity?.pk_is_transportadora === null
                  ? "entidad"
                  : selectedEntity?.pk_is_transportadora
                  ? "transportadora"
                  : "banco"
              }`}
              value={selectedEntity?.pk_nombre_entidad ?? ""}
              readOnly
            />
            {selectedEntity.pk_is_transportadora === false ? (
              <Fieldset legend={"Cuentas"}>
                {Object.entries(selectedEntity?.pk_numero_cuenta ?? {}).map(
                  ([key, val], ind) => (
                    <div>
                      <Input
                        id={`pk_numero_cuenta${ind+1}`}
                        name={`pk_numero_cuenta${ind+1}`}
                        label={`Número de Cuenta`}
                        value={val}
                        type="text"
                        onChange={(e) => handleChangeNum(e,key)}
                        autoComplete="off"
                        maxLength={"20"}
                        required
                      />
                      <ButtonBar className={"lg:col-span-2"}>
                        <Button
                          type="button"
                          onClick={() =>{
                            setSelectedEntity((old) => {
                              const cuentasBanco = new Map(
                                Object.entries(old?.pk_numero_cuenta ?? {})
                              );
                              cuentasBanco.delete(key);
                              return {
                                ...old,
                                pk_numero_cuenta: Object.fromEntries(cuentasBanco),
                              };
                            })
                          }}
                        >
                          Eliminar Cuenta
                        </Button>
                      </ButtonBar>
                    </div>
                  )
                )}
                {Object.keys(selectedEntity?.pk_numero_cuenta).length < 3?
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={() =>{
                        setSelectedEntity((old) => {
                          const cuentasBanco = new Map(
                            Object.entries(old?.pk_numero_cuenta ?? {})
                          );
                          const newKey = generateUniqueKey(Object.keys(old?.pk_numero_cuenta ?? {}));
                            cuentasBanco.set(newKey,'');
                            return {
                              ...old,
                              pk_numero_cuenta: Object.fromEntries(cuentasBanco),
                            };
                        })
                      }}
                      disabled={DisableState(selectedEntity?.pk_numero_cuenta)}
                    >
                      Agregar Cuenta
                    </Button>
                  </ButtonBar>
                :null}
              </Fieldset>
            ):null}
            <Fieldset legend={"Parámetros"}>
              <MoneyInput
                id='monto_maximo'
                name='monto_maximo'
                label="Monto Máximo"
                defaultValue={parametrosValues?.monto_maximo !== undefined?parametrosValues?.monto_maximo:null}
                onChange={handleChangeCurrenci}
                autoComplete="off"
                placeholder="$0"
                maxLength={28}
              />
              <MoneyInput
                key='monto_minimo'
                name='monto_minimo'
                label="Monto Mínimo"
                defaultValue={parametrosValues?.monto_minimo !== undefined?parametrosValues?.monto_minimo:null}
                onChange={handleChangeCurrenci}
                autoComplete="off"
                placeholder="$0"
                maxLength={28}
              />
            </Fieldset>
            <ButtonBar>
              <Button type="submit">Actualizar información</Button>
              <Button type="button" onClick={closeModal}>
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        )}
      </Modal>
    </Fragment>
  );
};

export default ParametrizacionRecaudo;
