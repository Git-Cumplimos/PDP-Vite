import HNavbar from "../../components/Base/HNavbar";
import Error403 from "../Error403";

const Categorias = ({ subcategorias }) => {
  if (!subcategorias.length) return <Error403 />;

  return <HNavbar links={subcategorias} />;
};

export default Categorias;
