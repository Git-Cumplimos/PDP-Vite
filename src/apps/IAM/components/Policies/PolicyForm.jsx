import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import Select from "../../../../components/Base/Select/Select";
import Table from "../../../../components/Base/Table/Table";
import fetchData from "../../../../utils/fetchData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const PolicyForm = ({ onCloseModal }) => {
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

  const [selectedGroups, setSelectedGroups] = useState({});
  const [selectedRoles, setSelectedRoles] = useState({});
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);

  const makeForm = useMemo(() => {
    return {
      "Nombre del grupo": {
        required: false,
      },
      "Nombre del rol": {
        required: false,
      },
    };
  }, []);

  const searchGroups = useCallback(async (name_group) => {
    if (name_group === "") {
      setGroups([]);
      return;
    }
    try {
      const _groups = await fetchData(`${url_iam}/groups`, "GET", {
        name_group,
      });
      if (_groups?.status) {
        setGroups(_groups?.obj);
      }
    } catch {}
  }, []);

  const searchRoles = useCallback(async (name_role) => {
    if (name_role === "") {
      setRoles([]);
      return;
    }
    try {
      const _roles = await fetchData(`${url_iam}/roles`, "GET", { name_role });
      if (_roles?.status) {
        setRoles(_roles?.obj);
      }
    } catch {}
  }, []);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchGroups(formData.get("Nombre del grupo"));
    searchRoles(formData.get("Nombre del rol"));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const _selectedG = Object.entries(selectedGroups).filter(([, val]) => val);
    const _selectedR = Object.entries(selectedRoles).filter(([, val]) => val);

    if (_selectedG.length === 0 || _selectedR.length === 0) {
      notifyError("No hay politicas para agregar");
      return;
    }

    let added = 0;

    for (const [gkey] of _selectedG) {
      for (const [rkey] of _selectedR) {
        const [id_group] = gkey.split(") ");
        const [id_role] = rkey.split(") ");
        try {
          const groupRole = await fetchData(
            `${url_iam}/groups-roles`,
            "POST",
            {},
            {
              Groups_id_group: id_group,
              Roles_id_role: id_role,
            }
          );
          if (groupRole?.status) {
            added++;
          }
        } catch (err) {}
      }
    }

    notify(
      `Se han agregado ${added} de ${Math.max(
        _selectedG.length,
        _selectedR.length
      )} politica(s)`
    );
    onCloseModal?.();
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Creacion de politica</h1>
      <Form
        onSubmit={onSubmit}
        onLazyChange={{
          callback: onChange,
          timeOut: 300,
        }}
        reff={refFrom}
        grid
      >
        {Array.isArray(Object.keys(selectedGroups)) &&
        Object.keys(selectedGroups).length > 0 ? (
          <MultipleSelect
            label={"Grupos"}
            options={selectedGroups}
            onChange={setSelectedGroups}
          />
        ) : (
          ""
        )}
        {Array.isArray(Object.keys(selectedRoles)) &&
        Object.keys(selectedRoles).length > 0 ? (
          <MultipleSelect
            label={"Roles"}
            options={selectedRoles}
            onChange={setSelectedRoles}
          />
        ) : (
          ""
        )}
        {Object.entries(makeForm).map(([key, val]) => {
          if (!Object.keys(val).includes("options")) {
            const { required, type } = val;
            return (
              <Input
                key={`${key}_new`}
                id={`${key}_new`}
                name={key}
                label={key}
                type={type || "text"}
                autoComplete="off"
                required={required ?? true}
              />
            );
          } else {
            const { required, options } = val;
            return (
              <Select
                key={`${key}_new`}
                id={`${key}_new`}
                name={key}
                label={key}
                required={required ?? true}
                options={options ?? []}
              />
            );
          }
        })}
        {Array.isArray(groups) && groups.length > 0 ? (
          <Table
            headers={["Id", "Nombre del grupo"]}
            data={groups.map(({ id_group, name_group }) => {
              return { id_group, name_group };
            })}
            onSelectRow={(e, i) => {
              const { id_group, name_group } = groups[i];
              const copy = { ...selectedGroups };
              copy[`${id_group}) ${name_group}`] = true;
              setSelectedGroups({ ...copy });
              setGroups([]);
              refFrom.current.reset();
            }}
          />
        ) : (
          ""
        )}
        {Array.isArray(roles) && roles.length > 0 ? (
          <Table
            headers={["Id", "Nombre del rol"]}
            data={roles.map(({ id_role, name_role }) => {
              return { id_role, name_role };
            })}
            onSelectRow={(e, i) => {
              const { id_role, name_role } = roles[i];
              const copy = { ...selectedRoles };
              copy[`${id_role}) ${name_role}`] = true;
              setSelectedRoles({ ...copy });
              setRoles([]);
              refFrom.current.reset();
            }}
          />
        ) : (
          ""
        )}
        <ButtonBar>
          <Button type={"submit"}>Crear politica(s)</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default PolicyForm;
