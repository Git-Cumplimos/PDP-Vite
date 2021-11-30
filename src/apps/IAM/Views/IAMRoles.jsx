import SubPage from "../../../components/Base/SubPage/SubPage";

const IAMRoles = ({ route }) => {
  const { label } = route;
  return (
    <SubPage label={label}>
      Roles
    </SubPage>
  );
};

export default IAMRoles;
