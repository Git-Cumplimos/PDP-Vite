import { useCallback, useRef, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import SubPage from "../../../components/Base/SubPage/SubPage";
import Table from "../../../components/Base/Table/Table";
import { useAuth } from "../../../utils/AuthHooks";
import fetchData from "../../../utils/fetchData";
import EditPolicyForm from "../components/Policies/EditPolicyForm";
import PolicyForm from "../components/Policies/PolicyForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMPolicies = ({ route }) => {
  const { label } = route;
  const { getPermissions, userInfo } = useAuth();

  const [policiesDB, setPoliciesDB] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);

    const form = refFrom.current;
    const formData = new FormData(form);

    searchPolicies(formData.get("gnameSearch"), formData.get("rnameSearch"))
      .then((res) => setPoliciesDB(res))
      .catch((err) => err);

    getPermissions(userInfo?.attributes?.email);
  };

  const searchPolicies = useCallback(async (name_group, name_role) => {
    try {
      const groups = await fetchData(`${url}/groups`, "GET", { name_group });
      const roles = await fetchData(`${url}/roles`, "GET", { name_role });

      const temp_policies = [];
      if (groups?.status && roles?.status) {
        for (const group of groups?.obj) {
          for (const role of roles?.obj) {
            const { id_group, name_group: _name_group } = group;
            const { id_role, name_role: _name_role } = role;
            const groupRole = await fetchData(`${url}/groups-roles`, "GET", {
              Groups_id_group: id_group,
              Roles_id_role: id_role,
            });
            if (groupRole?.status && groupRole?.obj.length > 0) {
              temp_policies.push({
                group: `${id_group}) ${_name_group}`,
                role: `${id_role}) ${_name_role}`,
              });
            }
          }
        }
      }
      return temp_policies;
    } catch {
      setPoliciesDB([]);
    }
  }, []);

  const refFrom = useRef(null);

  const onChange = (e) => {
    const form = refFrom.current;
    const formData = new FormData(form);

    searchPolicies(formData.get("gnameSearch"), formData.get("rnameSearch"))
      .then((res) => setPoliciesDB(res))
      .catch((err) => err);
  };

  return (
    <SubPage label={label}>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nueva politica
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar politicas</h1>
      <Form
        onLazyChange={{
          callback: onChange,
          timeOut: 300,
        }}
        reff={refFrom}
        grid
      >
        <Input
          id={"gnameSearch"}
          name={"gnameSearch"}
          label={"Nombre del grupo"}
          type={"search"}
          autoComplete="off"
        />
        <Input
          id={"rnameSearch"}
          name={"rnameSearch"}
          label={"Nombre del rol"}
          type={"search"}
          autoComplete="off"
        />
      </Form>
      {Array.isArray(policiesDB) && policiesDB.length > 0 ? (
        <Table
          headers={["Grupo", "Rol"]}
          data={policiesDB.map(({ group, role }) => {
            return { group, role };
          })}
          onSelectRow={(e, i) => {
            const { group, role } = policiesDB[i];
            const userMapped = {
              Grupo: group,
              Rol: role
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
          <EditPolicyForm selected={selected} onCloseModal={onCloseModal} />
        ) : (
          <PolicyForm onCloseModal={onCloseModal} />
        )}
      </Modal>
    </SubPage>
  );
};

export default IAMPolicies;
