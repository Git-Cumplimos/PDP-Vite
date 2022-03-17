import HNavbar from "../../components/Base/HNavbar";

import Form from "../../components/Base/Form";

const VerificacionNuevosComercios = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={subRoutes} isIcon />
      </Form>
    </div>
  );
};

export default VerificacionNuevosComercios;
