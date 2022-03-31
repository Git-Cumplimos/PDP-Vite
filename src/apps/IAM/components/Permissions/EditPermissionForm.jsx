import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import MultipleSelect from "../../../../components/Base/MultipleSelect";
import Table from "../../../../components/Base/Table";
import fetchData from "../../../../utils/fetchData";
import Pagination from "../../../../components/Compound/Pagination";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const url_types = process.env.REACT_APP_URL_TRXS_TRX;

const searchTypes = async (page = 1, limit = 5) => {
  const queries = {};
  if (page && page !== "") {
    queries.page = page;
  }
  if (limit && limit !== "") {
    queries.limit = limit;
  }
  try {
    const res = await fetchData(
      `${url_types}/tipos-operaciones-pagination`,
      "GET",
      queries
    );
    if (res?.status) {
      return res?.obj;
    } else {
      notifyError(res?.msg);
    }
    return [];
  } catch (err) {
    notifyError(err);
  }
};

const searchTypesByPermission = async (id_permission) => {
  const temp_res = {};
  try {
    const typesOpPermission = await fetchData(
      `${url_iam}/permissions-opstrx`,
      "GET",
      {
        Permissions_id_permission: id_permission ?? 0,
      }
    );
    if (typesOpPermission?.status) {
      for (const typeOpPermission of typesOpPermission?.obj) {
        try {
          const typeOp = await fetchData(
            `${url_types}/tipos-operaciones-pagination`,
            "GET",
            {
              tipo_op: typeOpPermission.Tipos_operaciones_id_tipo_op,
            }
          );
          if (typeOp?.status) {
            console.log(typeOp?.obj?.results);
            for (const { id_tipo_operacion, Nombre, Autorizador } of typeOp?.obj
              ?.results) {
              temp_res[
                `${id_tipo_operacion}) ${Nombre} (${Autorizador})`
              ] = true;
            }
          }
        } catch (_err) {}
      }
      return temp_res;
    } else {
      notifyError(typesOpPermission?.msg);
    }
  } catch (err) {
    notifyError(err);
  }
};

const EditPermissionForm = ({ selected, onCloseModal }) => {
  const [{ page = 1 }] = useQuery();
  const [typesByPermissions, setTypesByPermissions] = useState({});
  const [typesDB, setTypesDB] = useState({});

  useEffect(() => {
    searchTypesByPermission(selected?.edit?.id_permission).then((res) => {
      setTypesByPermissions(res);
    });
  }, [selected?.edit?.id_permission]);

  // const onChange = (e) => {
  //   const form = refFrom.current;
  //   const formData = new FormData(form);

  //   searchTypes(formData.get("userEmail_edit"))
  //     .then((res) => setTypesDB(res))
  //     .catch((err) => {});
  // };

  useEffect(() => {
    searchTypes(page).then((res) => setTypesDB(res));
  }, [page]);

  const onSubmit = useCallback(
    async (e) => {
      const relations = Object.entries(typesByPermissions);

      let edited = 0;
      let allToEdit = 0;

      for (const [key, value] of relations) {
        try {
          const [id_tipo_operacion] = key.split(") ");
          if (value) {
            const usersGroups = await fetchData(
              `${url_iam}/permissions-opstrx`,
              "GET",
              {
                Permissions_id_permission: selected?.edit?.id_permission,
                Tipos_operaciones_id_tipo_op: id_tipo_operacion,
              }
            );
            if (usersGroups?.status) {
              if (
                Array.isArray(usersGroups?.obj) &&
                usersGroups?.obj.length > 0
              ) {
              } else {
                allToEdit++;
                const addUser2Group = await fetchData(
                  `${url_iam}/permissions-opstrx`,
                  "POST",
                  {},
                  {
                    Permissions_id_permission: selected?.edit?.id_permission,
                    Tipos_operaciones_id_tipo_op: id_tipo_operacion,
                  }
                );
                if (addUser2Group?.status) {
                  edited++;
                }
              }
            }
          } else {
            const usersGroups = await fetchData(
              `${url_iam}/permissions-opstrx`,
              "GET",
              {
                Permissions_id_permission: selected?.edit?.id_permission,
                Tipos_operaciones_id_tipo_op: id_tipo_operacion,
              }
            );
            if (usersGroups?.status) {
              if (
                Array.isArray(usersGroups?.obj) &&
                usersGroups?.obj.length > 0
              ) {
                allToEdit++;
                const addUser2Group = await fetchData(
                  `${url_iam}/permissions-opstrx`,
                  "DELETE",
                  {
                    Permissions_id_permission: selected?.edit?.id_permission,
                    Tipos_operaciones_id_tipo_op: id_tipo_operacion,
                  }
                );
                if (addUser2Group?.status) {
                  edited++;
                }
              }
            }
          }
        } catch (err) {
          notifyError(err);
        }
      }

      if (allToEdit === 0) {
        notifyError("No hay tipos seleccionados para editar en el permiso");
      } else {
        notify(
          `Se han editado ${edited} de ${allToEdit} tipos de operacion a editar en el permiso`
        );
        onCloseModal?.();
      }
    },
    [onCloseModal, selected?.edit?.id_permission, typesByPermissions]
  );

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">
        Editar transacciones visibles para el permiso
      </h1>
      {Object.entries(selected).map(([key, val]) => {
        return key !== "edit" ? (
          <div
            className="flex flex-row justify-between text-lg font-medium w-3/4"
            key={key}
          >
            <h1>{key}:</h1>
            <h1>{val}</h1>
          </div>
        ) : (
          ""
        );
      })}
      <Pagination maxPage={typesDB?.maxPages} lgButtons={false} grid>
        {Array.isArray(Object.keys(typesByPermissions)) &&
        Object.keys(typesByPermissions).length > 0 ? (
          <MultipleSelect
            label={"Transacciones visibles para el permiso"}
            options={typesByPermissions}
            onChange={setTypesByPermissions}
          />
        ) : (
          ""
        )}
        {Array.isArray(typesDB?.results) && typesDB?.results.length > 0 ? (
          <Table
            headers={["Id", "Nombre tipo transaccion", "Autorizador"]}
            data={typesDB?.results.map(
              ({ id_tipo_operacion, Nombre, Autorizador }) => {
                return { id_tipo_operacion, Nombre, Autorizador };
              }
            )}
            onSelectRow={(e, i) => {
              const { id_tipo_operacion, Nombre, Autorizador } =
                typesDB?.results[i];
              const copy = { ...typesByPermissions };
              copy[`${id_tipo_operacion}) ${Nombre} (${Autorizador})`] = true;
              setTypesByPermissions({ ...copy });
              // setTypesDB([]);
            }}
          />
        ) : (
          ""
        )}
      </Pagination>
      <ButtonBar /* className={"lg:col-span-2"} */>
        <Button type={"submit"} onClick={onSubmit}>
          Actualizar permiso
        </Button>
      </ButtonBar>
    </div>
  );
};

export default EditPermissionForm;
