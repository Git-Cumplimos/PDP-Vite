import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Fieldset from "../../../../components/Base/Fieldset";
import ToggleInput from "../../../../components/Base/ToggleInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Modal from "../../../../components/Base/Modal";
import SearchTables from "./SearchTables";
import { useAuth } from "../../../../hooks/AuthHooks";
import {
  createUser,
  updateUser,
  updateUserGroups,
} from "../../utils/fetchFunctions";
import AddressForm from "../../../../components/Base/AddressForm";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import { onChangeNumber } from "../../../../utils/functions";
import { CommerceTagsIam } from "../../components/Commerce";

const url_types = process.env.REACT_APP_URL_SERVICE_COMMERCE;
const url = process.env.REACT_APP_URL_IAM_PDP;

const HandleUser = () => {
  const { uuid } = useParams();
  const { pdpUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [userGroups, setUserGroups] = useState(null);
  const [updateSonsCommerces, setUpdateSonsCommerces] = useState(
    () => (_) => {}
  );
  const [docTypes, setDocTypes] = useState(null);

  const [selected, setSelected] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [searchType, setSearchType] = useState(null);
  const [searchSelectFunction, setSearchSelectFunction] = useState(null);
  const [modifyAddress, setModifyAddress] = useState(false);
  const [addressState, setAddressState] = useState(null);
  const [userHasSons, setUserHasSons] = useState(true);

  const handleClose = useCallback(() => {
    setSearchType(null);
    setSearchSelectFunction(null);
    setModifyAddress(false);
  }, []);

  const onSelectGroup = useCallback(
    (selectedGroup) => {
      setSelected((old) => ({
        ...old,
        groups_user: [...(old.groups_user ?? []), selectedGroup].filter(
          ({ id_group }, index, self) =>
            index ===
            self.findIndex(
              ({ id_group: id_compare }) => id_group === id_compare
            )
        ),
      }));
      handleClose();
    },
    [handleClose]
  );
  const onSelectCommerce = useCallback(
    (selectedCommerce) => {
      setSelected((old) => ({
        ...old,
        fk_id_comercio: selectedCommerce?.pk_comercio,
        nombre_comercio: selectedCommerce?.nombre_comercio,
      }));
      handleClose();
    },
    [handleClose]
  );

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      const bodyData = isCreate
        ? {
            email: selected?.email,
            uname: selected?.uname,
            doc_id: selected?.doc_id,
            doc_type_id: selected?.doc_type_id,
            phone: selected?.phone,
            direccion: selected?.direccion,
            is_comercio_padre: selected?.is_comercio_padre,
          }
        : {
            uuid: selected?.uuid,
            uname: selected?.uname,
            phone: selected?.phone,
            direccion: selected?.direccion,
            active: selected?.active,
            is_comercio_padre: selected?.is_comercio_padre,
          };
      if (isCreate) {
        const formData = new FormData(ev.target);
        bodyData.uname = formData
          .getAll("u_name")
          .filter((val) => val)
          .join(" ");
      }
      bodyData.usuario_ultima_actualizacion = pdpUser?.uuid;

      if (selected?.fk_id_comercio) {
        bodyData.fk_id_comercio = selected?.fk_id_comercio;
      }

      notifyPending(
        isCreate ? createUser(bodyData) : updateUser({}, bodyData),
        {
          render: () => {
            return `${isCreate ? "Creando" : "Actualizando"} usuario`;
          },
        },
        {
          render: ({ data: res }) => {
            notifyPending(
              updateUserGroups({
                users_uuid: isCreate ? res?.obj?.uuid : selected?.uuid,
                groups_id_group: (selected?.groups_user ?? []).map(
                  ({ id_group }) => id_group
                ),
              }),
              {
                render: () => {
                  return `${
                    isCreate ? "Creando" : "Actualizando"
                  } grupos de usuario`;
                },
              },
              {
                render: ({ data: res_groups }) => {
                  updateSonsCommerces(
                    isCreate ? res?.obj?.uuid : selected?.uuid
                  );
                  return res_groups?.msg;
                },
              },
              {
                render({ data: err }) {
                  if (err?.cause === "custom") {
                    return err?.message;
                  }
                  console.error(err?.message);
                  return "Peticion fallida";
                },
              }
            );
            return res?.msg;
          },
        },
        {
          render({ data: err }) {
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Peticion fallida";
          },
        }
      );
    },
    [selected, isCreate, pdpUser?.uuid, updateSonsCommerces]
  );

  const [getUser] = useFetchDispatchDebounce(
    {
      onSuccess: useCallback((res) => setUserData(res?.obj), []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 100 }
  );

  const [getUserGroups] = useFetchDispatchDebounce(
    {
      onSuccess: useCallback((res) => setUserGroups(res?.obj), []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 100 }
  );
  const [getDocTypes] = useFetchDispatchDebounce(
    {
      onSuccess: useCallback((res) => setDocTypes(res?.obj), []),
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

  useEffect(() => {
    if (!isNaN(parseInt(uuid))) {
      getUser(`${url}/user-unique?uuid=${uuid}`);
      getUserGroups(`${url}/user-groups?uuid=${uuid}`);
    } else {
      getDocTypes(`${url_types}/type-doc`);
    }
  }, [uuid, getUser, getUserGroups, getDocTypes]);

  useEffect(() => {
    if (isNaN(parseInt(uuid))) {
      setIsCreate(true);
      setSelected({});
    } else {
      setIsCreate(false);
      setSelected({
        ...userData,
        groups_user: userGroups,
      });
    }
  }, [uuid, userData, userGroups]);

  if (!selected) {
    return <Fragment />;
  }

  return (
    <Fragment>
      <h1 className="text-3xl text-center">
        {isCreate ? "Crear" : "Actualizar"} usuario
      </h1>
      <Form onSubmit={onSubmit} grid>
        <Fieldset legend={"Información básica"} className={"lg:col-span-2"}>
          {!isCreate ? (
            <Fragment>
              <Input
                id="check_uuid"
                name="uuid"
                label={"Id de usuario"}
                type="tel"
                value={selected?.uuid ?? ""}
                disabled
              />
              <Input
                id="check_email"
                name="email"
                label={"Email"}
                type="email"
                autoComplete="off"
                value={selected?.email ?? ""}
                title={selected?.email || "Vacio"}
                disabled
              />
              <Input
                id="check_uname"
                name="uname"
                label={"Nombre de usuario"}
                type="text"
                maxLength={120}
                autoComplete="off"
                value={selected?.uname ?? ""}
                title={selected?.uname || "Vacio"}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    uname: ev.target.value ?? "",
                  }))
                }
                // disabled
              />
              <Input
                id="check_doc_id"
                name="doc_id"
                label={"No. Documento"}
                type="text"
                value={`${selected?.doc_type?.nombre_corto ?? ""} ${
                  selected?.doc_id ?? ""
                }`}
                disabled
              />
            </Fragment>
          ) : (
            <Fragment>
              <Input
                id="check_f_name"
                name="u_name"
                label={"Primer nombre"}
                type="text"
                maxLength={30}
                autoComplete="off"
                required
              />
              <Input
                id="check_s_name"
                name="u_name"
                label={"Segundo nombre"}
                type="text"
                maxLength={30}
                autoComplete="off"
              />
              <Input
                id="check_f_lastname"
                name="u_name"
                label={"Primer apellido"}
                type="text"
                maxLength={30}
                autoComplete="off"
                required
              />
              <Input
                id="check_s_lastname"
                name="u_name"
                label={"Segundo apellido"}
                type="text"
                maxLength={30}
                autoComplete="off"
              />
              <Select
                className="place-self-stretch"
                id={"Tipo de documento"}
                name="doc_type_id"
                label="Tipo de documento"
                options={[
                  {
                    value: "",
                    label: "",
                  },
                  ...(docTypes?.map(({ id_doc, Nombre, nombre_corto }) => ({
                    value: id_doc,
                    label: `${Nombre} (${nombre_corto})`,
                  })) ?? []),
                ]}
                value={selected?.doc_type_id ?? ""}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    doc_type_id: parseInt(ev.target.value) ?? "",
                  }))
                }
                required
              />
              <Input
                id="check_doc_id"
                name="doc_id"
                label={"Número de documento"}
                type="tel"
                minLength={5}
                maxLength={15}
                autoComplete="off"
                value={selected?.doc_id ?? ""}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    doc_id: !isNaN(parseInt(ev.target.value))
                      ? parseInt(ev.target.value)
                      : "",
                  }))
                }
                required
              />
              <Input
                id="check_email"
                name="email"
                label={"Email"}
                type="email"
                maxLength={80}
                autoComplete="off"
                value={selected?.email ?? ""}
                title={selected?.email || "Vacio"}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    email: ev.target.value ?? "",
                  }))
                }
                required
              />
            </Fragment>
          )}
          <Input
            id="check_phone"
            name="phone"
            label={"Teléfono"}
            type="tel"
            maxLength={10}
            autoComplete="off"
            value={selected?.phone ?? ""}
            onChange={(ev) =>
              setSelected((old) => ({
                ...old,
                phone: onChangeNumber(ev) ?? "",
              }))
            }
            required
          />
          <Input
            id="check_direccion"
            name="direccion"
            label={"Dirección"}
            className="pointer-events-none"
            type="text"
            autoComplete="off"
            value={selected?.direccion ?? ""}
            onChange={() => {}}
            // onChange={(ev) =>
            //   setSelected((old) => ({
            //     ...old,
            //     direccion: ev.target.value,
            //   }))
            // }
            actionBtn={{
              callback: (_) => setModifyAddress(true),
              label: selected?.direccion ? "Editar" : "Agregar",
            }}
            required
          />
          <Input
            id="check_fk_id_comercio"
            name="fk_id_comercio"
            label={"Comercio relacionado"}
            type="text"
            className="pointer-events-none"
            value={selected?.nombre_comercio ?? ""}
            onChange={() => {}}
            title={selected?.nombre_comercio || "Sin comercio relacionado"}
            placeholder="vacio"
            actionBtn={{
              callback: (ev) => {
                if (selected?.fk_id_comercio) {
                  setSelected((old) => ({
                    ...old,
                    fk_id_comercio: null,
                    nombre_comercio: null,
                  }));
                } else {
                  setSearchType("commerce");
                  setSearchSelectFunction(() => onSelectCommerce);
                }
              },
              label: selected?.fk_id_comercio ? "Eliminar" : "Agregar",
            }}
          />
          {!isCreate && (
            <ToggleInput
              id={`active_edit`}
              name={`active`}
              label={"Activo"}
              checked={selected?.active ?? false}
              onChange={() =>
                setSelected((old) => ({
                  ...old,
                  active: !old?.active,
                }))
              }
            />
          )}
          <ToggleInput
            id={`is_comercio_padre_edit`}
            name={`is_comercio_padre`}
            label={"¿Es un usuario padre?"}
            checked={selected?.is_comercio_padre ?? false}
            onChange={() =>
              setSelected((old) => ({
                ...old,
                is_comercio_padre: !old?.is_comercio_padre,
              }))
            }
            disabled={userHasSons}
            title={
              userHasSons
                ? "Desabilitado: no debe tener comercios hijo"
                : "Activar / desactivar opcion"
            }
          />
        </Fieldset>
        <Fieldset legend={"Grupos del usuario"} className={"lg:col-span-2"}>
          <ButtonBar className={"lg:col-span-2"}>
            {selected?.groups_user?.length > 0 ? (
              selected?.groups_user?.map(({ id_group, name_group }, ind) => (
                <button
                  type="button"
                  className="rounded-md bg-primary-light px-4 py-2 my-2 text-base text-white"
                  title={name_group}
                  key={ind}
                >
                  {id_group}) {name_group} &nbsp;&nbsp;
                  <span
                    className="bi bi-x-lg pointer-events-auto"
                    onClick={() =>
                      setSelected((old) => {
                        const copy = structuredClone(old);
                        copy.groups_user.splice(ind, 1);
                        return copy;
                      })
                    }
                  />
                </button>
              ))
            ) : (
              <h1 className="text-xl text-center my-auto">
                No hay grupos relacionados
              </h1>
            )}
          </ButtonBar>
          <ButtonBar className={"lg:col-span-2"}>
            <Button
              type="button"
              onClick={() => {
                setSearchType("groups");
                setSearchSelectFunction(() => onSelectGroup);
              }}
            >
              Agregar grupo
            </Button>
          </ButtonBar>
        </Fieldset>
        <CommerceTagsIam
          setIsNotEmpty={setUserHasSons}
          setUpdateCommerces={setUpdateSonsCommerces}
          uuid={selected?.uuid}
          show={selected?.is_comercio_padre}
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type="submit">
            {isCreate ? "Crear" : "Actualizar"} usuario
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={searchType || modifyAddress} handleClose={handleClose}>
        {searchType && (
          <SearchTables
            searchType={searchType}
            onSelectItem={searchSelectFunction}
          />
        )}
        {modifyAddress && (
          <AddressForm
            editAddress={addressState}
            onCancel={handleClose}
            onSuccess={(direccion, stateDieccion) => {
              setSelected((old) => ({
                ...old,
                direccion,
              }));
              setAddressState(stateDieccion);
              handleClose();
            }}
          />
        )}
      </Modal>
    </Fragment>
  );
};

export default HandleUser;
