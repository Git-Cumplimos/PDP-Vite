import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMUsers = ({ route }) => {
  const { label } = route;

  const [usuariosDB, setUsuariosDB] = useState([]);
  const [emailSearch, setEmailSearch] = useState("");
  const [unameSearch, setUnameSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const onCloseModal = () => {
    showModal(false);
  }

  const searchUsers = useCallback((email, uname) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    fetchData(`${url}/users`, "GET", queries)
      .then((res) => {
        if (res?.status) {
          setUsuariosDB(res?.obj);
        }
      })
      .catch((err) => console.error(err));
  }, [])

  useEffect(() => {
    searchUsers();
  }, [searchUsers]);

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button>Nuevo usuario</Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar usuarios</h1>
      <Form grid>
        <Input
          id={"emailSearch"}
          label={"Email"}
          type={"text"}
          autoComplete="off"
          value={emailSearch}
          onInput={(e) => {
            setEmailSearch(e.target.value);
          }}
          onLazyInput={{
            callback: (e) => {
              const email = e.target.value;
              searchUsers(email, unameSearch);
            },
            timeOut: 300
          }}
        />
        <Input
          id={"unameSearch"}
          label={"Nombre"}
          type={"text"}
          autoComplete="off"
          value={unameSearch}
          onInput={(e) => {
            setUnameSearch(e.target.value);
          }}
          onLazyInput={{
            callback: (e) => {
              const uname = e.target.value;
              searchUsers(emailSearch, uname);
            },
            timeOut: 300
          }}
        />
      </Form>
      {Array.isArray(usuariosDB) && usuariosDB.length > 0 ? (
        <Table
          headers={["Nombre completo", "E-mail"]}
          data={usuariosDB.map(({ uname, email }) => {
            return { uname, email };
          })}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={onCloseModal}>
        
      </Modal>
    </SubPage>
  );
};

export default IAMUsers;
