import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import ToggleInput from "../../../../components/Base/ToggleInput/ToggleInput";
import { useAuth } from "../../../../utils/AuthHooks";
import fetchData from "../../../../utils/fetchData";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const EditUserForm = ({ selected, onCloseModal }) => {
  const { notify, notifyError } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    fetchData(
      `${url_iam}/users`,
      "PUT",
      {
        uuid: selected?.edit?.uuid,
      },
      {
        phone: formData.get("phone_edit"),
        direccion: formData.get("direccion_edit"),
        active: formData.get("active_edit"),
      }
    )
      .then((res) => {
        if (res?.status) {
          notify(res?.msg);
        } else {
          notifyError(res?.msg);
        }
        onCloseModal?.();
      })
      .catch((err) => {
        notifyError(err);
        onCloseModal?.();
      });
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Actualizar usuario</h1>
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
        <Input
          id={`direccion_edit`}
          name={`direccion_edit`}
          label={"Direccion"}
          type={"text"}
          autoComplete="off"
          required
          defaultValue={selected?.edit?.direccion}
        />
        <Input
          id={`phone_edit`}
          name={`phone_edit`}
          label={"Telefono"}
          type={"text"}
          autoComplete="off"
          required
          defaultValue={selected?.edit?.phone}
        />
        <ToggleInput
          id={`active_edit`}
          name={`active_edit`}
          label={"Activo"}
          defaultChecked={selected?.edit?.active}
        />
        <ButtonBar>
          <Button type={"submit"}>Actualizar usuario</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditUserForm;
