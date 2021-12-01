import { useCallback, useRef, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import EditGroupForm from "../components/Groups/EditGroupForm";
import GroupForm from "../components/Groups/GroupForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMGroups = ({ route }) => {
  const { label } = route;

  const [gruposDB, setGruposDB] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);
  };

  const searchGroups = useCallback((uname) => {
    const queries = {};
    if (uname && uname !== "") {
      queries.name_group = uname;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/groups`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setGruposDB(res?.obj);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setGruposDB([]);
    }
  }, []);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchGroups(formData.get("unameSearch"));
  };

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo grupo
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar grupos</h1>
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
      {Array.isArray(gruposDB) && gruposDB.length > 0 ? (
        <Table
          headers={["Id", "Nombre del grupo"]}
          data={gruposDB.map(({ id_group, name_group }) => {
            return { id_group, name_group };
          })}
          onSelectRow={(e, i) => {
            const { name_group, id_group } = gruposDB[i];
            const userMapped = {
              "ID grupo": id_group,
              "Nombre del grupo": name_group,
              edit: {
                id_group,
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
          <EditGroupForm selected={selected} onCloseModal={onCloseModal} />
        ) : (
          <GroupForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </SubPage>
  );
};

export default IAMGroups;
