import Form from "../../../../components/Base/Form";
import HNavbar from "../../../../components/Base/HNavbar";

const RecaudoBancolombia = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={subRoutes} isIcon />
      </Form>
    </div>
  );
};

export default RecaudoBancolombia;