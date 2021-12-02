import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";
import fetchData from "../../../../utils/fetchData";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import sendFormData from "../../../../utils/sendFormData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const MassiveUpload = ({ onCloseModal }) => {
  const [groupsUsers, setGroupsUsers] = useState({ "": "" });
  const [isUploading, setIsUploading] = useState(false);
  const [usersFile, setUsersFile] = useState(null);

  const onFileCharge = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const [m_file] = files;
        setUsersFile({ file: m_file, fileName: m_file.name });
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  }, []);

  const makeForm = useMemo(() => {
    return {
      "Elegir archivo de usuarios": {
        type: "file",
        disabled: isUploading,
        accept: ".csv",
        onGetFile: onFileCharge,
        required: false,
      },
      "Grupo para los usuarios": {
        options: groupsUsers,
      },
    };
  }, [groupsUsers, isUploading, onFileCharge]);

  useEffect(() => {
    fetchData(`${url_iam}/groups`, "GET", {}, {})
      .then((res) => {
        const temp = { "": "" };
        if (res?.status) {
          res?.obj.forEach(({ id_group, name_group }) => {
            temp[`${name_group}`] = id_group;
          });
          setGroupsUsers(temp);
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
  }, []);

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

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!usersFile) {
      notifyError("No se ha selecionado un archivo para subir");
      return;
    }

    setIsUploading(true);

    formData.append("file", usersFile.file);
    formData.append("id_group", formData.get("Grupo para los usuarios"));
    formData.delete("Elegir archivo de usuarios");
    formData.delete("Grupo para los usuarios");

    sendFormData(
      `${url_iam}/users-massive`,
      "POST",
      formData,
      (xhr) => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const res = xhr.response;
          if (!res?.status) {
            notifyError(res?.msg);
          } else {
            const {
              added_users,
              all_users,
              // failed_to_add,
              // failed_to_group,
              grouped_users,
            } = res?.obj;
            notify(
              `Se han creado ${added_users.length} de ${all_users.length} usuarios`
            );
            if (added_users.length > 0) {
              notify(
                `Se han agrupado ${grouped_users.length} de ${added_users.length} usuarios creados`
              );
            }
          }
        }
      },
      (xhr) => {
        setIsUploading(false);
        notifyError("Error de red");
      },
      "json"
    );
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Creacion de usuarios</h1>
      <SimpleLoading show={isUploading} />
      <Form onSubmit={onSubmit} grid>
        {Object.entries(makeForm).map(([key, val]) => {
          if (!Object.keys(val).includes("options")) {
            const { required, type, ...rest } = val;
            return (
              <Input
                key={`${key}_new`}
                id={`${key}_new`}
                name={key}
                label={key}
                type={type || "text"}
                autoComplete="off"
                required={required ?? true}
                {...rest}
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
        <ButtonBar>
          <Button type={"submit"}>Crear usuarios</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default MassiveUpload;
