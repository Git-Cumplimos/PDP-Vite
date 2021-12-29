import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import EditUserForm from "../components/Users/EditUserForm";
import MassiveUpload from "../components/Users/MassiveUpload";
import UserForm from "../components/Users/UserForm";
import EditUserGroupForm from "../components/Users/EditUserGroupForm";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMUsers = () => {
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [massiveUpload, setMassiveUpload] = useState(false);
  const [editUser, setEditUser] = useState(0);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setMassiveUpload(false);
    setSelected(null);
    setEditUser(0);

    searchUsers(
      formData?.get("emailSearch"),
      formData?.get("unameSearch"),
      formData?.get("page")
    );
  };

  const searchUsers = useCallback((email, uname, _page) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    if (_page) {
      queries.page = _page;
    }
    if (Object.keys(queries).length > 0) {
      fetchData(`${url}/users`, "GET", queries)
        .then((res) => {
          if (res?.status) {
            setUsuariosDB(res?.obj?.results);
            setMaxPage(res?.obj?.maxpages);
          }
        })
        .catch(() => {});
    } else {
      setUsuariosDB([]);
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      setFormData(_formData);
      searchUsers(
        _formData?.get("emailSearch"),
        _formData?.get("unameSearch"),
        _formData?.get("page")
      );
    },
    [searchUsers]
  );

  return (
    <>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nuevo usuario
        </Button>
        <Button
          type={"button"}
          onClick={() => {
            setShowModal(true);
            setMassiveUpload(true);
          }}
        >
          Creacion masiva de usuarios
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar usuarios</h1>
      <PaginationAuth
        filters={{
          emailSearch: { label: "Email" },
          unameSearch: { label: "Nombre" },
        }}
        maxPage={maxPage}
        onChange={onChange}
      />
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
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={onCloseModal}>
        {selected ? (
          editUser === 0 ? (
            <ButtonBar>
              <Button type={"button"} onClick={() => setEditUser(1)}>
                Editar usuario
              </Button>
              <Button type={"button"} onClick={() => setEditUser(2)}>
                Editar grupos del usuario
              </Button>
            </ButtonBar>
          ) : editUser === 1 ? (
            <EditUserForm selected={selected} onCloseModal={onCloseModal} />
          ) : editUser === 2 ? (
            <EditUserGroupForm
              selected={selected}
              onCloseModal={onCloseModal}
            />
          ) : (
            ""
          )
        ) : massiveUpload ? (
          <MassiveUpload onCloseModal={onCloseModal} />
        ) : (
          <UserForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </>
  );
};

export default IAMUsers;
