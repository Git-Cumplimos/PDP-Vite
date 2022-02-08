import HNavbar from "../../components/Base/HNavbar/HNavbar";

import Form from "../../components/Base/Form/Form";

const VerificacionNuevosComercios = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={[subRoutes[0]]} isIcon />
        <HNavbar links={[subRoutes[1]]} isIcon />
      </Form>
    </div>
  );
};

export default VerificacionNuevosComercios;
