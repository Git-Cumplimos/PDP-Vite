import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Fieldset from "../../../../../components/Base/Fieldset";
import Input from "../../../../../components/Base/Input";
import { notifyError } from "../../../../../utils/notify";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import Select from "../../../../../components/Base/Select";
import ToggleInput from "../../../../../components/Base/ToggleInput";
import Modal from "../../../../../components/Base/Modal";
import AddressForm, {
  initialAddress,
} from "../../../../../components/Base/AddressForm";
import { CitySearchTable } from "../../../../../components/Compound/CitySearch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { onChangeNumber } from "../../../../../utils/functions";
import NitInput from "../../ConveniosPDP/components/NitInput";

type Props = {
  setRlPks: (_: {
    pk_tipo_identificacion_rl?: number;
    pk_numero_identificacion_rl?: string;
  }) => void;
  fk_tipo_identificacion_rl?: number | null;
  fk_numero_identificacion_rl?: string | null;
};

type PropietarioRL = {
  pk_tipo_identificacion_rl: number;
  pk_numero_identificacion_rl: string;
  nombre_rl: string;
  apellido_rl: string;
  pep_rl: boolean;
  telefono_fijo_rl: string;
  direccion_rl: string;
  barrio_rl: string;
  dane_municipio_rl: string;
  dane_departamento_rl: string;
  nombre_ciudad: string;
  usuario_ultima_actualizacion: number;
  dv_interno?: number;
};

const initialPropietarioRL: PropietarioRL = {
  pk_tipo_identificacion_rl: 0,
  pk_numero_identificacion_rl: "",
  nombre_rl: "",
  apellido_rl: "",
  pep_rl: false,
  telefono_fijo_rl: "",
  direccion_rl: "",
  barrio_rl: "",
  dane_municipio_rl: "",
  dane_departamento_rl: "",
  nombre_ciudad: "",
  usuario_ultima_actualizacion: 0,
  dv_interno: 0,
};

const url_comercios = process.env.REACT_APP_URL_SERVICE_COMMERCE;
// const url_comercios = `http://localhost:5000`;

const RepresentanteLegal = ({
  setRlPks,
  fk_tipo_identificacion_rl,
  fk_numero_identificacion_rl,
}: Props) => {
  const { pdpUser } = useAuth();
  const [propietarioRL, setPropietarioRL] =
    useState<PropietarioRL>(initialPropietarioRL);
  const [propietarioRLExists, setPropietarioRLExists] = useState(false);
  const [updateRl, setUpdateRl] = useState(false);

  const [docTypesRL, setDocTypesRL] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [modifyAddress, setModifyAddress] = useState(false);
  const [modifyCity, setModifyCity] = useState(false);

  const [addressState, setAddressState] = useState<typeof initialAddress>();

  const propietarioRL2Send = useMemo(() => {
    const copy = structuredClone(propietarioRL);
    copy.dane_departamento_rl = copy.dane_departamento_rl.padStart(2, "0");
    copy.dane_municipio_rl = copy.dane_municipio_rl
      .replace(".", "")
      .padStart(5, "0");
    delete copy.dv_interno;
    return copy;
  }, [propietarioRL]);

  const areAllFieldsEmpty = useMemo(
    () =>
      Object.entries(propietarioRL2Send).every(([key, val]) =>
        ![
          "dv_interno",
          "usuario_ultima_actualizacion",
          "dane_departamento_rl",
          "dane_municipio_rl",
        ].includes(key)
          ? !val
          : true
      ),
    [propietarioRL2Send]
  );

  const makeUpdateRl = useCallback(
    () =>
      setUpdateRl(
        !!propietarioRL.pk_tipo_identificacion_rl &&
          !!propietarioRL.pk_numero_identificacion_rl
      ),
    [
      propietarioRL.pk_tipo_identificacion_rl,
      propietarioRL.pk_numero_identificacion_rl,
    ]
  );

  const handleClose = useCallback(() => {
    setModifyAddress(false);
    setModifyCity(false);
  }, []);

  const saveAddress = useCallback(
    (direccion: string, stateDieccion: typeof initialAddress) => {
      setPropietarioRL((old) => ({
        ...old,
        direccion_rl: direccion,
      }));
      setAddressState(stateDieccion);
      makeUpdateRl();
      handleClose();
    },
    [handleClose, makeUpdateRl]
  );

  useFetchDebounce(
    {
      url: `${url_comercios}/type-doc`,
    },
    {
      onSuccess: useCallback(
        (res) =>
          setDocTypesRL(
            [
              {
                value: "",
                label: "",
              },
            ].concat(
              res?.obj?.map(
                ({
                  id_doc,
                  Nombre,
                  nombre_corto,
                }: {
                  id_doc: number;
                  Nombre: string;
                  nombre_corto: string;
                }) => ({
                  value: id_doc,
                  label: `${Nombre} (${nombre_corto})`,
                })
              ) ?? []
            )
          ),
        []
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 50 }
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${url_comercios}/propietarios-rl/unique?pk_tipo_identificacion_rl=${propietarioRL.pk_tipo_identificacion_rl}&pk_numero_identificacion_rl=${propietarioRL.pk_numero_identificacion_rl}`,
        [
          propietarioRL.pk_tipo_identificacion_rl,
          propietarioRL.pk_numero_identificacion_rl,
        ]
      ),
      fetchIf: useMemo(
        () =>
          Boolean(propietarioRL.pk_tipo_identificacion_rl) &&
          Boolean(propietarioRL.pk_numero_identificacion_rl) &&
          propietarioRL.pk_tipo_identificacion_rl !== 8
            ? propietarioRL.pk_numero_identificacion_rl.length >= 5
            : propietarioRL.pk_numero_identificacion_rl.length === 13,
        [
          propietarioRL.pk_tipo_identificacion_rl,
          propietarioRL.pk_numero_identificacion_rl,
        ]
      ),
    },
    {
      onSuccess: useCallback((res) => {
        setPropietarioRL((old) => ({
          ...res?.obj,
          usuario_ultima_actualizacion: old.usuario_ultima_actualizacion,
        }));
        // notify("Propietario o RL encontrado");
        setPropietarioRLExists(true);
        setUpdateRl(false);
      }, []),
      onError: useCallback(
        (error) => {
          if (error?.cause === "custom") {
            // notifyError(error.message);
            console.error(error.message);
          } else {
            console.error(error);
          }
          setPropietarioRLExists(false);
          makeUpdateRl();
          setPropietarioRL((old) => ({
            ...initialPropietarioRL,
            pk_tipo_identificacion_rl: old.pk_tipo_identificacion_rl,
            pk_numero_identificacion_rl: old.pk_numero_identificacion_rl,
          }));
        },
        [makeUpdateRl]
      ),
    },
    { delay: 500 }
  );

  useFetchDebounce(
    {
      url: `${url_comercios}/propietarios-rl/admin`,
      options: useMemo(
        () => ({
          method: !propietarioRLExists ? "POST" : "PUT",
          body: JSON.stringify(propietarioRL2Send),
          headers: { "Content-Type": "application/json" },
        }),
        [propietarioRLExists, propietarioRL2Send]
      ),
      fetchIf: useMemo(
        () =>
          updateRl && propietarioRL2Send.pk_tipo_identificacion_rl !== 8
            ? propietarioRL2Send.pk_numero_identificacion_rl.length >= 5
            : propietarioRL2Send.pk_numero_identificacion_rl.length === 13,
        [
          updateRl,
          propietarioRL2Send.pk_numero_identificacion_rl.length,
          propietarioRL2Send.pk_tipo_identificacion_rl,
        ]
      ),
    },
    {
      onSuccess: useCallback(
        (_) => {
          // searchRL();
          setUpdateRl(false);
          setPropietarioRLExists(true);
        },
        [
          /* searchRL */
        ]
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
          // console.error(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 1000 }
  );

  useEffect(() => {
    setPropietarioRL((old) => ({
      ...old,
      usuario_ultima_actualizacion: (pdpUser ?? { uuid: 0 })?.uuid,
    }));
  }, [pdpUser]);

  useEffect(() => {
    if (propietarioRLExists) {
      setRlPks({
        pk_numero_identificacion_rl: propietarioRL.pk_numero_identificacion_rl,
        pk_tipo_identificacion_rl: propietarioRL.pk_tipo_identificacion_rl,
      });
    } else if (
      !propietarioRL.pk_tipo_identificacion_rl &&
      !propietarioRL.pk_numero_identificacion_rl
    ) {
      setRlPks({
        pk_numero_identificacion_rl: undefined,
        pk_tipo_identificacion_rl: undefined,
      });
    }
  }, [
    setRlPks,
    propietarioRLExists,
    propietarioRL.pk_numero_identificacion_rl,
    propietarioRL.pk_tipo_identificacion_rl,
  ]);

  useEffect(() => {
    setPropietarioRL((old) => ({
      ...old,
      pk_tipo_identificacion_rl: fk_tipo_identificacion_rl ?? 0,
    }));
  }, [fk_tipo_identificacion_rl]);

  useEffect(() => {
    setPropietarioRL((old) => ({
      ...old,
      pk_numero_identificacion_rl: fk_numero_identificacion_rl ?? "",
    }));
  }, [fk_numero_identificacion_rl]);

  return (
    <Fragment>
      <Fieldset
        legend={"Representante legal o propietario"}
        className="lg:col-span-2"
      >
        <Select
          className="place-self-stretch"
          id="pk_tipo_identificacion_rl"
          name="pk_tipo_identificacion_rl"
          label="Tipo de documento"
          options={docTypesRL ?? []}
          value={propietarioRL.pk_tipo_identificacion_rl ?? ""}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) => {
            setPropietarioRLExists(false);
            setUpdateRl(false);
            setPropietarioRL((old) => ({
              ...initialPropietarioRL,
              pk_numero_identificacion_rl: old.pk_numero_identificacion_rl,
              pk_tipo_identificacion_rl: ev.target.value
                ? parseInt(ev.target.value)
                : 0,
            }));
          }}
          required={!areAllFieldsEmpty}
        />
        {propietarioRL.pk_tipo_identificacion_rl !== 8 ? (
          <Input
            label="Número de identificación"
            id="pk_numero_identificacion_rl"
            name="pk_numero_identificacion_rl"
            type="tel"
            minLength={!areAllFieldsEmpty ? 5 : 0}
            maxLength={12}
            value={propietarioRL.pk_numero_identificacion_rl}
            onChange={(ev) => {
              setPropietarioRLExists(false);
              setUpdateRl(false);
              // Clean number on event and not on setState
              const newNumId = onChangeNumber(ev, false);
              setPropietarioRL((old) => ({
                ...initialPropietarioRL,
                pk_tipo_identificacion_rl: old.pk_tipo_identificacion_rl,
                pk_numero_identificacion_rl: newNumId,
              }));
            }}
            autoComplete="off"
            required={!areAllFieldsEmpty}
          />
        ) : (
          <NitInput
            label="Número de identificación"
            id="pk_numero_identificacion_rl"
            name="pk_numero_identificacion_rl"
            type="tel"
            minLength={!areAllFieldsEmpty ? 5 : 0}
            maxLength={12}
            value={propietarioRL.pk_numero_identificacion_rl}
            onChange={(_, nit) => {
              setPropietarioRLExists(false);
              setUpdateRl(false);

              setPropietarioRL((old) => ({
                ...initialPropietarioRL,
                pk_tipo_identificacion_rl: old.pk_tipo_identificacion_rl,
                pk_numero_identificacion_rl: nit,
              }));
            }}
            autoComplete="off"
            required={!areAllFieldsEmpty}
          />
        )}
        <Input
          label="Nombre"
          id="nombre_rl"
          name="nombre_rl"
          type="text"
          minLength={1}
          maxLength={40}
          value={propietarioRL.nombre_rl}
          onChange={(ev) => {
            setPropietarioRL((old) => ({
              ...old,
              nombre_rl: ev.target.value,
            }));
            makeUpdateRl();
          }}
          autoComplete="off"
        />
        <Input
          label="Apellido"
          id="apellido_rl"
          name="apellido_rl"
          type="text"
          minLength={1}
          maxLength={40}
          value={propietarioRL.apellido_rl}
          onChange={(ev) => {
            setPropietarioRL((old) => ({
              ...old,
              apellido_rl: ev.target.value,
            }));
            makeUpdateRl();
          }}
          autoComplete="off"
        />
        <ToggleInput
          label="¿PEP?"
          id="pep_rl"
          name="pep_rl"
          checked={propietarioRL.pep_rl}
          onChange={(_: ChangeEvent<HTMLInputElement>) => {
            setPropietarioRL((old) => ({
              ...old,
              pep_rl: !old.pep_rl,
            }));
            makeUpdateRl();
          }}
        />
        <Input
          label="Teléfono fijo"
          id="telefono_fijo_rl"
          name="telefono_fijo_rl"
          type="tel"
          minLength={10}
          maxLength={10}
          value={propietarioRL.telefono_fijo_rl}
          onChange={(ev) => {
            setPropietarioRL((old) => ({
              ...old,
              telefono_fijo_rl: onChangeNumber(ev),
            }));
            makeUpdateRl();
          }}
          autoComplete="off"
        />
        <Input
          label="Ciudad residencia"
          id="ciudad_residencia_rl"
          name="ciudad_residencia_rl"
          className="pointer-events-none"
          type="text"
          autoComplete="off"
          value={propietarioRL.nombre_ciudad}
          onChange={() => {}}
          actionBtn={{
            callback: propietarioRL.nombre_ciudad
              ? (_) =>
                  setPropietarioRL((old) => ({
                    ...old,
                    dane_municipio_rl: "",
                    dane_departamento_rl: "",
                    nombre_ciudad: "",
                  }))
              : (_) => setModifyCity(true),
            label: propietarioRL.nombre_ciudad ? (
              <span className="px-1 py-0 text-sm bi bi-trash" />
            ) : (
              <span className="px-1 py-0 text-sm bi bi-pencil-square" />
            ),
          }}
        />
        <Input
          label="Dirección"
          id="direccion_rl"
          name="direccion_rl"
          className="pointer-events-none"
          type="text"
          autoComplete="off"
          value={propietarioRL.direccion_rl}
          onChange={() => {}}
          actionBtn={{
            callback: (_) => setModifyAddress(true),
            label: <span className="px-1 py-0 text-sm bi bi-pencil-square" />,
          }}
        />
        <Input
          label="Barrio"
          id="barrio_rl"
          name="barrio_rl"
          type="text"
          minLength={4}
          maxLength={50}
          value={propietarioRL.barrio_rl}
          onChange={(ev) => {
            setPropietarioRL((old) => ({
              ...old,
              barrio_rl: ev.target.value,
            }));
            makeUpdateRl();
          }}
          autoComplete="off"
        />
        {propietarioRLExists && (
          <Input
            label="DV interno"
            id="dv_interno"
            name="dv_interno"
            type="tel"
            minLength={1}
            maxLength={30}
            readOnly
            disabled
            value={propietarioRL.dv_interno}
            autoComplete="off"
          />
        )}
      </Fieldset>
      <Modal show={modifyAddress || modifyCity} handleClose={handleClose}>
        {modifyAddress && (
          <AddressForm
            editAddress={addressState}
            onCancel={handleClose}
            onSuccess={saveAddress}
          />
        )}
        {modifyCity && (
          <Fragment>
            <Fieldset legend={"Municipio actual"}>
              <ul className="grid grid-flow-row gap-2 justify-center align-middle">
                {Object.entries({
                  "Código DANE departamento":
                    propietarioRL.dane_departamento_rl,
                  "Código DANE municipio": propietarioRL.dane_municipio_rl,
                  "Nombre ciudad": propietarioRL.nombre_ciudad,
                }).map(([key, val]) => {
                  return (
                    <li key={key}>
                      <h1 className="grid grid-flow-col auto-cols-fr gap-6">
                        <strong className="justify-self-end">{key}:</strong>
                        <p className="justify-self-start whitespace-pre-wrap">
                          {val}
                        </p>
                      </h1>
                    </li>
                  );
                })}
              </ul>
            </Fieldset>
            <CitySearchTable
              onSelectCity={(cityInfo) => {
                setPropietarioRL((old) => ({
                  ...old,
                  dane_municipio_rl: cityInfo.c_digo_dane_del_municipio,
                  dane_departamento_rl: cityInfo.c_digo_dane_del_departamento,
                  nombre_ciudad: `${cityInfo.municipio} - ${cityInfo.departamento}`,
                }));
                makeUpdateRl();
                handleClose();
              }}
            />
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};

export default RepresentanteLegal;
