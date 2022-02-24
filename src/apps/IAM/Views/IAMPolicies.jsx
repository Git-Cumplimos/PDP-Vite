import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import EditPolicyForm from "../components/Policies/EditPolicyForm";
import PolicyForm from "../components/Policies/PolicyForm";

const url = process.env.REACT_APP_URL_IAM_PDP;

const IAMPolicies = () => {
  const [policiesDB, setPoliciesDB] = useState([]);
  const [formData, setFormData] = useState(new FormData());

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const onCloseModal = (fcn) => {
    fcn?.();
    setShowModal(false);
    setSelected(null);

    searchPolicies(formData.get("gnameSearch"), formData.get("rnameSearch"))
      .then((res) => {
        setPoliciesDB(res);
      })
      .catch((err) => err);
  };

  const searchPolicies = useCallback(async (name_group, name_role) => {
    if (!name_group && !name_role) {
      return [];
    }
    try {
      const _policies = await fetchData(`${url}/politicas`, "GET", {
        name_group,
        name_role,
      });

      if (!_policies?.status) {
        notifyError(_policies?.msg);
        return [];
      }
      const temp_policies = [
        ...(_policies?.obj || []).map(
          ({
            group: { id_group = 0, name_group = "" },
            role: { id_role = 0, name_role = "" },
          }) => ({
            group: `${id_group}) ${name_group}`,
            role: `${id_role}) ${name_role}`,
          })
        ),
      ];
      return temp_policies;
    } catch {
      setPoliciesDB([]);
    }
  }, []);

  const onChange = useCallback(
    (_formData) => {
      setFormData(_formData);
      searchPolicies(_formData.get("gnameSearch"), _formData.get("rnameSearch"))
        .then((res) => {
          setPoliciesDB(res);
        })
        .catch((err) => err);
    },
    [searchPolicies]
  );

  return (
    <>
      <ButtonBar>
        <Button type={"button"} onClick={() => setShowModal(true)}>
          Nueva politica
        </Button>
      </ButtonBar>
      <h1 className="text-3xl">Buscar politicas</h1>
      <PaginationAuth
        filters={{
          gnameSearch: { label: "Nombre del grupo" },
          rnameSearch: { label: "Nombre del rol" },
        }}
        onChange={onChange}
      />
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
              Rol: role,
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
    </>
  );
};

export default IAMPolicies;
