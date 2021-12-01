import { useCallback, useRef, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import EditPermissionForm from "../components/Permissions/EditPermissionForm";
import PermissionForm from "../components/Permissions/PermissionForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMPermissions = ({ route }) => {
  const { label } = route;

  const [permisosDB, setPermisosDB] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    fcn?.();
    setShowModal(false);
    setSelected(null);

    searchPermissions(formData.get("unameSearch"));
  };

  const searchPermissions = useCallback((uname) => {
    const queries = {};
    if (uname && uname !== "") {
      queries.name_permission = uname;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/permissions`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setPermisosDB(res?.obj);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setPermisosDB([]);
    }
  }, []);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchPermissions(formData.get("unameSearch"));
  };

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo permiso
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar permisos</h1>
      <Form
        onLazyChange={{
          callback: onChange,
          timeOut: 300,
        }}
        reff={refFrom}
        grid
      >
        <Input
          id={"unameSearch"}
          name={"unameSearch"}
          label={"Nombre"}
          type={"search"}
          autoComplete="off"
        />
        <ButtonBar></ButtonBar>
      </Form>
      {Array.isArray(permisosDB) && permisosDB.length > 0 ? (
        <Table
          headers={["Id", "Nombre del permiso"]}
          data={permisosDB.map(({ id_permission, name_permission }) => {
            return {
              id_permission,
              name_permission,
            };
          })}
          onSelectRow={(e, i) => {
            const { id_permission, name_permission } = permisosDB[i];
            const userMapped = {
              "ID grupo": id_permission,
              "Nombre del grupo": name_permission,
              edit: {
                id_permission,
              },
            };
            setSelected({ ...userMapped });
            setShowModal(true);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={onCloseModal}>
      {selected ? (
          <EditPermissionForm selected={selected} onCloseModal={onCloseModal} />
        ) : (
          <PermissionForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </SubPage>
  );
};

export default IAMPermissions;
