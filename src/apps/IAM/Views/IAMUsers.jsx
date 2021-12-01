import { useCallback, useRef, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import EditUserForm from "../components/Users/EditUserForm";
import UserForm from "../components/Users/UserForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMUsers = ({ route }) => {
  const { label } = route;

  const [usuariosDB, setUsuariosDB] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    fcn?.();
    setShowModal(false);
    setSelected(null);
    
    searchUsers(formData.get("emailSearch"), formData.get("unameSearch"));
  };

  const searchUsers = useCallback((email, uname) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/users`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setUsuariosDB(res?.obj);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setUsuariosDB([]);
    }
  }, []);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchUsers(formData.get("emailSearch"), formData.get("unameSearch"));
  };

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo usuario
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar usuarios</h1>
      <Form
        onLazyChange={{
          callback: onChange,
          timeOut: 300,
        }}
        reff={refFrom}
        grid
      >
        <Input
          id={"emailSearch"}
          name={"emailSearch"}
          label={"Email"}
          type={"search"}
          autoComplete="off"
        />
        <Input
          id={"unameSearch"}
          name={"unameSearch"}
          label={"Nombre"}
          type={"search"}
          autoComplete="off"
        />
      </Form>
      {Array.isArray(usuariosDB) && usuariosDB.length > 0 ? (
        <Table
          headers={["Id", "Nombre completo", "E-mail"]}
          data={usuariosDB.map(({ uuid, uname, email }) => {
            return { uuid, uname, email };
          })}
          onSelectRow={(e, i) => {
            const {
              active,
              direccion,
              doc_id,
              email,
              phone,
              uname,
              uuid,
              doc_type: { "Nombre corto": _doc_type },
            } = usuariosDB[i];
            const userMapped = {
              "Id usuario": uuid,
              "Nombre completo": uname,
              Identificacion: `${_doc_type} ${doc_id}`,
              Email: email,
              edit: {
                uuid,
                direccion,
                phone,
                active,
              },
            };
            setSelected({ ...userMapped });
            setShowModal(true);
            console.log(userMapped);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={onCloseModal}>
        {selected ? (
          <EditUserForm selected={selected} onCloseModal={onCloseModal} />
        ) : (
          <UserForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </SubPage>
  );
};

export default IAMUsers;
