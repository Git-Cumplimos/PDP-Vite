import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import fetchData from "../../../utils/fetchData";
import EditRoleForm from "../components/Roles/EditRoleForm";
import RoleForm from "../components/Roles/RoleForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMRoles = ({ route }) => {
  const { label } = route;

  const [rolesDB, setRolesDB] = useState([]);
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);

    searchRoles(formData.get("unameSearch"), formData.get("page"));
  };

  const searchRoles = useCallback((uname, _page) => {
    const queries = {};
    if (uname && uname !== "") {
      queries.name_role = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/roles`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setRolesDB(res?.obj?.results);
            setMaxPage(res?.obj?.maxpages);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setRolesDB([]);
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      setFormData(_formData);
      searchRoles(_formData.get("unameSearch"), _formData.get("page"));
    },
    [searchRoles]
  );

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo rol
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar roles</h1>
      <Pagination
        filters={{
          unameSearch: { label: "Nombre" },
        }}
        maxPage={maxPage}
        onChange={onChange}
      />
      {Array.isArray(rolesDB) && rolesDB.length > 0 ? (
        <Table
          headers={["Id", "Nombre del rol"]}
          data={rolesDB.map(({ id_role, name_role }) => {
            return { id_role, name_role };
          })}
          onSelectRow={(e, i) => {
            const { id_role, name_role } = rolesDB[i];
            const userMapped = {
              "ID rol": id_role,
              "Nombre del rol": name_role,
              edit: {
                id_role,
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
          <EditRoleForm selected={selected} onCloseModal={onCloseModal} />
        ) : (
          <RoleForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </SubPage>
  );
};

export default IAMRoles;
