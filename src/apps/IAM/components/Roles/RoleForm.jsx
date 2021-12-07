import { useMemo } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";
import { useAuth } from "../../../../utils/AuthHooks";
import fetchData from "../../../../utils/fetchData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const RoleForm = ({ onCloseModal }) => {
  const { notify, notifyError } = useAuth();

  const makeForm = useMemo(() => {
    return {
      "Nombre del rol": {},
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetchData(
      `${url_iam}/roles`,
      "POST",
      {},
      {
        name_role: formData.get("Nombre del rol"),
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
      <h1 className="text-2xl my-4">Creacion de rol</h1>
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
          <Button type={"submit"}>Crear rol</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default RoleForm;
