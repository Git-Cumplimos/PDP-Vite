import SubPage from "../../../components/Base/SubPage/SubPage";

const IAMPermissions = ({ route }) => {
  const { label } = route;
  return (
    <SubPage label={label}>
      Permisos
    </SubPage>
  );
};

export default IAMPermissions;
