import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import Table from "../../../../components/Base/Table/Table";
import Pagination from "../../../../components/Compound/Pagination/Pagination";
import { useAuth } from "../../../../utils/AuthHooks";
import fetchData from "../../../../utils/fetchData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const EditUserGroupForm = ({ selected, onCloseModal }) => {
  const [usuariosGrupo, setUsuariosGrupo] = useState({});
  const [usuariosDB, setUsuariosDB] = useState([]);

  const [maxPage, setMaxPage] = useState(1);

  const { notify, notifyError } = useAuth();

  const searchUsers = useCallback(async (gname, _page) => {
    const queries = { limit: 5 };
    if (gname && gname !== "") {
      queries.name_group = gname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      try {
        const res = await fetchData(`${url_iam}/groups`, "GET", queries);
        if (res?.status) {
          return res?.obj;
        }
        return [];
      } catch (err) {
        notifyError(err);
      }
    } else {
      return [];
    }
  }, [notifyError]);

  const searchGroupByUsers = useCallback(async (uuid) => {
    const temp_res = {};
    try {
      const usersGroups = await fetchData(`${url_iam}/users-groups`, "GET", {
        Users_uuid: uuid ?? 0,
      });
      if (usersGroups?.status) {
        for (const userGroup of usersGroups?.obj) {
          try {
            const group = await fetchData(`${url_iam}/groups`, "GET", {
              id_group: userGroup.Groups_id_group,
            });
            if (group?.status) {
              const groupInfo = group?.obj?.results[0];
              temp_res[`${groupInfo.id_group}) ${groupInfo.name_group}`] = true;
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
  }, [notifyError]);

  useEffect(() => {
    searchGroupByUsers(selected?.edit?.uuid).then((res) => {
      setUsuariosGrupo(res);
    });
  }, [searchGroupByUsers, selected?.edit?.uuid]);

  const onChange = (formData) => {
    searchUsers(formData.get("userEmail"), formData.get("page"))
      .then((res) => {
        setUsuariosDB([...res?.results]);
        setMaxPage(res?.maxpages);
      })
      .catch((err) => {});
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const relations = Object.entries(usuariosGrupo);

    let edited = 0;
    let allToEdit = 0;

    for (const [key, value] of relations) {
      try {
        const [id_group] = key.split(") ");
        if (value) {
          const usersGroups = await fetchData(
            `${url_iam}/users-groups`,
            "GET",
            {
              Users_uuid: selected?.edit?.uuid ?? 0,
              Groups_id_group: id_group,
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
                `${url_iam}/users-groups`,
                "POST",
                {},
                {
                  Users_uuid: selected?.edit?.uuid ?? 0,
                  Groups_id_group: id_group,
                }
              );
              if (addUser2Group?.status) {
                edited++;
              }
            }
          }
        } else {
          const usersGroups = await fetchData(
            `${url_iam}/users-groups`,
            "GET",
            {
              Users_uuid: selected?.edit?.uuid ?? 0,
              Groups_id_group: id_group,
            }
          );
          if (usersGroups?.status) {
            if (
              Array.isArray(usersGroups?.obj) &&
              usersGroups?.obj.length > 0
            ) {
              allToEdit++;
              const addUser2Group = await fetchData(
                `${url_iam}/users-groups`,
                "DELETE",
                {
                  Users_uuid: selected?.edit?.uuid ?? 0,
                  Groups_id_group: id_group,
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
      notifyError("No hay usuarios para editar en el grupo");
    } else {
      notify(
        `Se han editado ${edited} de ${allToEdit} usuarios a editar en el grupo`
      );
      onCloseModal?.();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Actualizar grupo</h1>
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
            label={"Usuarios en el grupo"}
            options={usuariosGrupo}
            onChange={setUsuariosGrupo}
          />
        ) : (
          ""
        )}
        <Pagination
          filters={{
            userEmail: { label: "Buscar grupo para añadir" },
          }}
          maxPage={maxPage}
          onChange={onChange}
        />
        {Array.isArray(usuariosDB) && usuariosDB.length > 0 ? (
          <Table
            headers={["Id", "Nombre completo"]}
            data={usuariosDB.map(({ id_group, name_group }) => {
              return { id_group, name_group };
            })}
            onSelectRow={(e, i) => {
              const { id_group, name_group } = usuariosDB[i];
              const copy = { ...usuariosGrupo };
              copy[`${id_group}) ${name_group}`] = true;
              setUsuariosGrupo({ ...copy });
              setUsuariosDB([]);
            }}
          />
        ) : (
          ""
        )}
        <ButtonBar>
          <Button type={"submit"}>Actualizar usuario</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditUserGroupForm;
