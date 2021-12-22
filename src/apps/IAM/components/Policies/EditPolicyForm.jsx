import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const EditPolicyForm = ({ selected, onCloseModal }) => {
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const [id_group] = selected.Grupo.split(") ");
      const [id_role] = selected.Rol.split(") ");
      const groupRole = await fetchData(`${url_iam}/groups-roles`, "DELETE", {
        Groups_id_group: id_group,
        Roles_id_role: id_role,
      });
      if (groupRole?.status) {
        notify("Politica eliminada satisfactoriamente");
      } else {
        notifyError(`Error al eliminar politica: ${groupRole?.msg}`);
      }
    } catch (err) {
      notifyError(err);
    }

    onCloseModal?.();
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">Eliminar politica</h1>
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
        <ButtonBar>
          <Button type={"submit"}>Eliminar politica</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditPolicyForm;
