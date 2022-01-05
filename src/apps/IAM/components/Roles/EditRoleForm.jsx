import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import Table from "../../../../components/Base/Table/Table";
import PaginationAuth from "../../../../components/Compound/PaginationAuth/PaginationAuth";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const EditRoleForm = ({ selected, onCloseModal }) => {
  const [usuariosGrupo, setUsuariosGrupo] = useState({});
  const [permisosDB, setPermisosDB] = useState([]);

  const [maxPage, setMaxPage] = useState(1);

  const searchPermissions = useCallback((uname, _page) => {
    const queries = { limit: 5 };
    if (uname && uname !== "") {
      queries.name_permission = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url_iam}/permissions`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setPermisosDB(res?.obj?.results);
            setMaxPage(res?.obj?.maxpages);
          }
        })
        .catch(() => {});
    } else {
      setPermisosDB([]);
    }
  }, []);

  const searchPermissionsByRole = useCallback(async (id_role) => {
    const temp_res = {};
    try {
      const usersGroups = await fetchData(
        `${url_iam}/roles-permissions`,
        "GET",
        {
          Roles_id_role: id_role ?? 0,
        }
      );
      if (usersGroups?.status) {
        for (const userGroup of usersGroups?.obj) {
          try {
            const user = await fetchData(`${url_iam}/permissions`, "GET", {
              id_permission: userGroup.Permissions_id_permission,
            });
            if (user?.status) {
              const usrInfo = user?.obj?.results?.[0];
              temp_res[
                `${usrInfo.id_permission}) ${usrInfo.name_permission}`
              ] = true;
            }
          } catch (_err) {}
        }
        return temp_res;
      } else {
        notifyError(usersGroups?.msg);
      }
    } catch (err) {
      notifyError(err);
    }
  }, []);

  useEffect(() => {
    searchPermissionsByRole(selected?.edit?.id_role).then((res) => {
      setUsuariosGrupo(res);
    });
  }, [searchPermissionsByRole, selected?.edit?.id_role]);

  const onChange = (formData) => {
    searchPermissions(formData.get("namePermission"), formData.get("page"));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const relations = Object.entries(usuariosGrupo);

    let edited = 0;
    let allToEdit = 0;

    for (const [key, value] of relations) {
      try {
        const [id_permission] = key.split(") ");
        if (value) {
          const usersGroups = await fetchData(
            `${url_iam}/roles-permissions`,
            "GET",
            {
              Permissions_id_permission: id_permission,
              Roles_id_role: selected?.edit?.id_role ?? 0,
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
                `${url_iam}/roles-permissions`,
                "POST",
                {},
                {
                  Permissions_id_permission: id_permission,
                  Roles_id_role: selected?.edit?.id_role ?? 0,
                }
              );
              if (addUser2Group?.status) {
                edited++;
              }
            }
          }
        } else {
          const usersGroups = await fetchData(
            `${url_iam}/roles-permissions`,
            "GET",
            {
              Permissions_id_permission: id_permission,
              Roles_id_role: selected?.edit?.id_role ?? 0,
            }
          );
          if (usersGroups?.status) {
            if (
              Array.isArray(usersGroups?.obj) &&
              usersGroups?.obj.length > 0
            ) {
              allToEdit++;
              const addUser2Group = await fetchData(
                `${url_iam}/roles-permissions`,
                "DELETE",
                {
                  Permissions_id_permission: id_permission,
                  Roles_id_role: selected?.edit?.id_role ?? 0,
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
      notifyError("No hay permisos para editar en el rol");
    } else {
      notify(
        `Se han editado ${edited} de ${allToEdit} permisos a editar en el rol`
      );
      onCloseModal?.();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Actualizar rol</h1>
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
      <Form onSubmit={onSubmit} grid>
        {Array.isArray(Object.keys(usuariosGrupo)) &&
        Object.keys(usuariosGrupo).length > 0 ? (
          <MultipleSelect
            label={"Permisos en el rol"}
            options={usuariosGrupo}
            onChange={setUsuariosGrupo}
          />
        ) : (
          ""
        )}
        <PaginationAuth
          filters={{
            namePermission: { label: "Buscar permiso para añadir" },
          }}
          maxPage={maxPage}
          onChange={onChange}
        />
        {Array.isArray(permisosDB) && permisosDB.length > 0 ? (
          <Table
            headers={["Id", "Nombre del permiso"]}
            data={permisosDB.map(({ id_permission, name_permission }) => {
              return { id_permission, name_permission };
            })}
            onSelectRow={(e, i) => {
              const { id_permission, name_permission } = permisosDB[i];
              const copy = { ...usuariosGrupo };
              copy[`${id_permission}) ${name_permission}`] = true;
              setUsuariosGrupo({ ...copy });
              setPermisosDB([]);
            }}
          />
        ) : (
          ""
        )}
        <ButtonBar>
          <Button type={"submit"}>Actualizar rol</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditRoleForm;
