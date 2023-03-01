import Form from "../../components/Base/Form";
import HNavbar from "../../components/Base/HNavbar";

const RecaudoEmpresarial = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={subRoutes} isIcon />
      </Form>
    </div>
  );
};

export default RecaudoEmpresarial;
