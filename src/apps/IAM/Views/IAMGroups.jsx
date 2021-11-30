import SubPage from "../../../components/Base/SubPage/SubPage";

const IAMGroups = ({ route }) => {
  const { label } = route;
  return (
    <SubPage label={label}>
      Grupos
    </SubPage>
  );
};

export default IAMGroups;
