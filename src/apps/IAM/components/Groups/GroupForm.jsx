import { useMemo } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import fetchData from "../../../../utils/fetchData";
import { onChangeNumber } from "../../../../utils/functions";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = import.meta.env.VITE_URL_IAM_PDP;

const GroupForm = ({ onCloseModal }) => {
  const makeForm = useMemo(() => {
    return {
      "Nombre del grupo": {
        maxLength: 60
      },
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetchData(
      `${url_iam}/groups`,
      "POST",
      {},
      {
        name_group: formData.get("Nombre del grupo"),
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
      <h1 className="text-2xl my-4">Creacion de grupo</h1>
      <Form onSubmit={onSubmit} grid>
        {Object.entries(makeForm).map(([key, val]) => {
          if (!Object.keys(val).includes("options")) {
            const { maxLength=60,type = "text",required, } = val;
            return (
              <Input
                key={`${key}_new`}
                id={`${key}_new`}
                name={key}
                label={key}
                maxLength={maxLength}
                type={type}
                onChange={(ev) => type === "number" ?(ev.target.value = onChangeNumber(ev)):ev.target.value}
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
          <Button type={"submit"}>Crear grupo</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default GroupForm;
