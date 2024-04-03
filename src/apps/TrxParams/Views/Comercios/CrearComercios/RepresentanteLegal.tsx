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
import { notify, notifyError } from "../../../../../utils/notify";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import Select from "../../../../../components/Base/Select";
import ToggleInput from "../../../../../components/Base/ToggleInput";
import Modal from "../../../../../components/Base/Modal";
import AddressForm, {
  initialAddress,
} from "../../../../../components/Base/AddressForm";
import { CitySearchTable } from "../../../../../components/Compound/CitySearch";
import { useAuth } from "../../../../../hooks/AuthHooks";

type Props = {};

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
  dv_interno: number;
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
const url_comercios_dev = `http://localhost:5000`;

const RepresentanteLegal = (props: Props) => {
  const { pdpUser } = useAuth();
  const [propietarioRL, setPropietarioRL] =
    useState<PropietarioRL>(initialPropietarioRL);
  const [propietarioRLExists, setPropietarioRLExists] = useState(false);

  const [docTypesRL, setDocTypesRL] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [modifyAddress, setModifyAddress] = useState(false);
  const [modifyCity, setModifyCity] = useState(false);

  const [addressState, setAddressState] = useState<typeof initialAddress>();
  const [addressToShow, setAddressToShow] = useState("");

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
      setAddressToShow(direccion);
      setAddressState(stateDieccion);
      handleClose();
    },
    [handleClose]
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
              res?.obj
                ?.filter(({ id_doc }: { id_doc: number }) =>
                  [1, 3].includes(id_doc)
                )
                ?.map(
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
          `${url_comercios_dev}/propietarios-rl/unique?pk_tipo_identificacion_rl=${propietarioRL.pk_tipo_identificacion_rl}&pk_numero_identificacion_rl=${propietarioRL.pk_numero_identificacion_rl}`,
        [
          propietarioRL.pk_tipo_identificacion_rl,
          propietarioRL.pk_numero_identificacion_rl,
        ]
      ),
      fetchIf: useMemo(
        () =>
          Boolean(propietarioRL.pk_tipo_identificacion_rl) &&
          Boolean(propietarioRL.pk_numero_identificacion_rl),
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
        notify("Propietario o RL encontrado");
        setPropietarioRLExists(true);
      }, []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          // notifyError(error.message);
          console.error(error.message);
        } else {
          console.error(error);
        }
        setPropietarioRLExists(false);
      }, []),
    },
    // { delay: 50 }
  );

  useEffect(() => {
    setPropietarioRL((old) => ({
      ...old,
      usuario_ultima_actualizacion: (pdpUser ?? { uuid: 0 })?.uuid,
    }));
  }, [pdpUser]);

  return (
    <Fragment>
      <Fieldset
        legend={"Representante legal o propietario (occidente)"}
        className="lg:col-span-2"
      >
        <Select
          className="place-self-stretch"
          id="pk_tipo_identificacion_rl"
          name="pk_tipo_identificacion_rl"
          label="Tipo de documento"
          options={docTypesRL ?? []}
          value={propietarioRL.pk_tipo_identificacion_rl}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) => {
            setPropietarioRL((old) => ({
              ...old,
              pk_tipo_identificacion_rl: ev.target.value
                ? parseInt(ev.target.value)
                : 0,
            }));
          }}
          required
        />
        <Input
          label="Número de identificación"
          id="pk_numero_identificacion_rl"
          name="pk_numero_identificacion_rl"
          type="tel"
          minLength={5}
          maxLength={12}
          required
          value={propietarioRL.pk_numero_identificacion_rl}
          onChange={(ev) => {
            setPropietarioRL((old) => ({
              ...old,
              pk_numero_identificacion_rl: ev.target.value,
            }));
          }}
          autoComplete="off"
        />
        <Input
          label="Nombre"
          id="nombre_rl"
          name="nombre_rl"
          type="text"
          minLength={1}
          maxLength={40}
          required
          value={propietarioRL.nombre_rl}
          onChange={(ev) =>
            setPropietarioRL((old) => ({
              ...old,
              nombre_rl: ev.target.value,
            }))
          }
          autoComplete="off"
        />
        <Input
          label="Apellido"
          id="apellido_rl"
          name="apellido_rl"
          type="text"
          minLength={1}
          maxLength={40}
          required
          value={propietarioRL.apellido_rl}
          onChange={(ev) =>
            setPropietarioRL((old) => ({
              ...old,
              apellido_rl: ev.target.value,
            }))
          }
          autoComplete="off"
        />
        <ToggleInput
          label="¿PEP?"
          id="pep_rl"
          name="pep_rl"
          checked={propietarioRL.pep_rl}
          onChange={(_: ChangeEvent<HTMLInputElement>) =>
            setPropietarioRL((old) => ({
              ...old,
              pep_rl: !old.pep_rl,
            }))
          }
        />
        <Input
          label="Teléfono fijo"
          id="telefono_fijo_rl"
          name="telefono_fijo_rl"
          type="tel"
          minLength={1}
          maxLength={10}
          required
          value={propietarioRL.telefono_fijo_rl}
          onChange={(ev) =>
            setPropietarioRL((old) => ({
              ...old,
              telefono_fijo_rl: ev.target.value,
            }))
          }
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
            callback: (_) => setModifyCity(true),
            label: <span className="px-1 py-0 text-sm bi bi-pencil-square" />,
          }}
          required
        />
        <Input
          label="Dirección"
          id="direccion_rl"
          name="direccion_rl"
          className="pointer-events-none"
          type="text"
          autoComplete="off"
          value={addressToShow ?? ""}
          onChange={() => {}}
          actionBtn={{
            callback: (_) => setModifyAddress(true),
            label: <span className="px-1 py-0 text-sm bi bi-pencil-square" />,
          }}
          required
        />
        <Input
          label="Barrio"
          id="barrio_rl"
          name="barrio_rl"
          type="text"
          minLength={4}
          maxLength={20}
          required
          value={propietarioRL.barrio_rl}
          onChange={(ev) =>
            setPropietarioRL((old) => ({
              ...old,
              barrio_rl: ev.target.value,
            }))
          }
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
          <CitySearchTable
            onSelectCity={(cityInfo) => {
              setPropietarioRL((old) => ({
                ...old,
                dane_municipio_rl: cityInfo.c_digo_dane_del_municipio,
                dane_departamento_rl: cityInfo.c_digo_dane_del_departamento,
                nombre_ciudad: `${cityInfo.municipio} - ${cityInfo.departamento}`,
              }));
              handleClose();
            }}
          />
        )}
      </Modal>
    </Fragment>
  );
};

export default RepresentanteLegal;
