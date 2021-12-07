import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import fetchData from "../../../utils/fetchData";
import EditPermissionForm from "../components/Permissions/EditPermissionForm";
import PermissionForm from "../components/Permissions/PermissionForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMPermissions = ({ route }) => {
  const { label } = route;

  const [permisosDB, setPermisosDB] = useState([]);
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);

    searchPermissions(formData.get("unameSearch"), formData.get("page"));
  };

  const searchPermissions = useCallback((uname, _page) => {
    const queries = {};
    if (uname && uname !== "") {
      queries.name_permission = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/permissions`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setPermisosDB(res?.obj?.results);
            setMaxPage(res?.obj?.maxpages);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setPermisosDB([]);
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      setFormData(_formData);
      searchPermissions(_formData.get("unameSearch"), _formData.get("page"));
    },
    [searchPermissions]
  );

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo permiso
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar permisos</h1>
      <Pagination
        filters={{
          unameSearch: { label: "Nombre" },
        }}
        maxPage={maxPage}
        onChange={onChange}
      />
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
