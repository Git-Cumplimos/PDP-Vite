import { useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const url_types = process.env.REACT_APP_URL_SERVICE_COMMERCE;
const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const UserForm = ({ onCloseModal }) => {
  const [docTypes, setDocTypes] = useState({ "": "" });

  useEffect(() => {
    fetchData(`${url_types}/type-doc`, "GET", {}, {})
      .then((res) => {
        const temp = { "": "" };
        if (res?.status) {
          for (const { id_doc, Nombre, nombre_corto } of res?.obj) {
            temp[`${Nombre} (${nombre_corto})`] = id_doc;
          }
          setDocTypes(temp);
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
  }, []);

  const makeForm = useMemo(() => {
    return {
      "Primer nombre": {},
      "Segundo nombre": {
        required: false,
      },
      "Primer apellido": {},
      "Segundo apellido": {
        required: false,
      },
      "Tipo de documento": {
        options: docTypes,
      },
      "Numero de documento": {},
      Email: {
        type: "email",
      },
      Telefono: {},
      Direccion: {},
    };
  }, [docTypes]);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetchData(
      `${url_iam}/users`,
      "POST",
      {},
      {
        email: formData.get("Email"),
        uname: `${formData.get("Primer nombre")} ${formData.get(
          "Segundo nombre"
        )} ${formData.get("Primer apellido")} ${formData.get(
          "Segundo apellido"
        )}`,
        doc_type_id: formData.get("Tipo de documento"),
        doc_id: formData.get("Numero de documento"),
        phone: formData.get("Telefono"),
        direccion: formData.get("Direccion"),
      }
    )
      .then((res) => {
        if (res?.status) {
          notify(res?.msg);
        } else {
          notifyError(res?.msg);
        }
        form.reset();
        onCloseModal?.();
      })
      .catch((err) => {
        notifyError(err);
        form.reset();
        onCloseModal?.();
      });
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Creacion de usuario</h1>
      <Form onSubmit={onSubmit} grid>
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
        <ButtonBar>
          <Button type={"submit"}>Crear usuario</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default UserForm;
