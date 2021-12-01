import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import Table from "../../../../components/Base/Table/Table";
import fetchData from "../../../../utils/fetchData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const EditGroupForm = ({ selected, onCloseModal }) => {
  const [usuariosGrupo, setUsuariosGrupo] = useState({});
  const [usuariosDB, setUsuariosDB] = useState([]);

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const searchUsers = useCallback(async (email, uname) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    if (Object.keys(queries).length > 0) {
      try {
        const res = await fetchData(`${url_iam}/users`, "GET", queries);
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
  }, []);

  const searchUsersByGroup = useCallback(async (id_group) => {
    const temp_res = {};
    try {
      const usersGroups = await fetchData(`${url_iam}/users-groups`, "GET", {
        Groups_id_group: id_group ?? 0,
      });
      if (usersGroups?.status) {
        for (const userGroup of usersGroups?.obj) {
          try {
            const user = await fetchData(`${url_iam}/users`, "GET", {
              uuid: userGroup.Users_uuid,
            });
            if (user?.status) {
              const usrInfo = user?.obj[0];
              temp_res[`${usrInfo.uuid}) ${usrInfo.email}`] = true;
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
    searchUsersByGroup(selected?.edit?.id_group).then((res) => {
      setUsuariosGrupo(res);
    });
  }, [searchUsersByGroup, selected?.edit?.id_group]);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchUsers(formData.get("userEmail_edit"))
      .then((emailSearch) => {
        searchUsers("", formData.get("userEmail_edit"))
          .then((nameSearch) => {
            console.log(emailSearch);
            console.log(nameSearch);
            const allSearch = [...emailSearch, ...nameSearch];
            console.log(allSearch);
            setUsuariosDB([
              ...allSearch.filter((el, idx, arr) => {
                return (
                  idx ===
                  arr.findIndex((_el) => {
                    return _el.uuid === el.uuid;
                  })
                );
              }),
            ]);
          })
          .catch((err) => {});
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
        const [uuid] = key.split(") ");
        if (value) {
          const usersGroups = await fetchData(
            `${url_iam}/users-groups`,
            "GET",
            {
              Users_uuid: uuid,
              Groups_id_group: selected?.edit?.id_group ?? 0,
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
                  Users_uuid: uuid,
                  Groups_id_group: selected?.edit?.id_group ?? 0,
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
              Users_uuid: uuid,
              Groups_id_group: selected?.edit?.id_group ?? 0,
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
                  Users_uuid: uuid,
                  Groups_id_group: selected?.edit?.id_group ?? 0,
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
      <Form
        onSubmit={onSubmit}
        onLazyChange={{
          callback: onChange,
          timeOut: 300,
        }}
        reff={refFrom}
        grid
      >
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
        <Input
          id={`userEmail_edit`}
          name={`userEmail_edit`}
          label={"Buscar usuario para añadir"}
          type={"text"}
          autoComplete="off"
        />
        {Array.isArray(usuariosDB) && usuariosDB.length > 0 ? (
          <Table
            headers={["Id", "Nombre completo", "E-mail"]}
            data={usuariosDB.map(({ uuid, uname, email }) => {
              return { uuid, uname, email };
            })}
            onSelectRow={(e, i) => {
              const { email, uuid } = usuariosDB[i];
              const copy = { ...usuariosGrupo };
              copy[`${uuid}) ${email}`] = true;
              setUsuariosGrupo({ ...copy });
              setUsuariosDB([]);
              refFrom.current.reset();
            }}
          />
        ) : (
          ""
        )}
        <ButtonBar>
          <Button type={"submit"}>Actualizar grupo</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditGroupForm;
