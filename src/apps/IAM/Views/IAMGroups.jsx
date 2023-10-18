import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Table from "../../../components/Base/Table";
import PaginationAuth from "../../../components/Compound/PaginationAuth";
import fetchData from "../../../utils/fetchData";
import GroupForm from "../components/Groups/GroupForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMGroups = () => {
  const [gruposDB, setGruposDB] = useState([]);
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());

  const [showModal, setShowModal] = useState(false);
  const [, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);

    searchGroups(formData.get("unameSearch"), formData.get("page"));
  };

  const searchGroups = useCallback((uname, _page) => {
    const queries = {};
    if (uname && uname !== "") {
      queries.name_group = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/groups`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setGruposDB(res?.obj?.results);
            setMaxPage(res?.obj?.maxpages);
          }
        })
        .catch(() => {});
    } else {
      setGruposDB([]);
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      setFormData(_formData);
      searchGroups(_formData.get("unameSearch"), _formData.get("page"));
    },
    [searchGroups]
  );

  return (
    <>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo grupo
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar grupos</h1>
      <PaginationAuth
        filters={{
          unameSearch: { label: "Nombre", maxLength: 60 },
        }}
        maxPage={maxPage}
        onChange={onChange}
      />
      {Array.isArray(gruposDB) && gruposDB.length > 0 ? (
        <Table
          headers={["Id", "Nombre del grupo"]}
          data={gruposDB.map(({ id_group, name_group }) => {
            return { id_group, name_group };
          })}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={onCloseModal}>
        <GroupForm onCloseModal={onCloseModal} />
      </Modal>
    </>
  );
};

export default IAMGroups;
