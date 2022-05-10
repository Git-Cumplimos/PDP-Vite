import { useMemo } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const PermissionForm = ({ onCloseModal }) => {
  const makeForm = useMemo(() => {
    return {
      "Id del permiso": {
        type: "number",
        required: false,
        info: "Campo opcional",
      },
      "Nombre del permiso": {},
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = { name_permission: formData.get("Nombre del permiso") };

    const settedId = parseInt(formData.get("Id del permiso")) ?? 0;

    if (settedId) {
      body.id_permission = settedId;
    }

    fetchData(`${url_iam}/permissions`, "POST", {}, body)
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
      <h1 className="text-2xl my-4">Creacion de permiso</h1>
      <Form onSubmit={onSubmit} grid>
        {Object.entries(makeForm).map(([key, val]) => {
          if (!Object.keys(val).includes("options")) {
            const { required, type, ...rest } = val;
            return (
              <Input
                key={`${key}_new`}
                id={`${key}_new`}
                label={key}
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
          <Button type={"submit"}>Crear permiso</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default PermissionForm;
