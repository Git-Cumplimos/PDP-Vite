import HNavbar from "../../components/Base/HNavbar";
import Error403 from "../Error403";
import Subcategorias from "./Subcategorias";

const Categorias = ({ subcategorias }) => {
  if (!subcategorias.length) return <Error403 />;

  return (<HNavbar links={subcategorias} />);
  // return (
  //   <>
  //     {subcategorias &&
  //       subcategorias.map((subcategoria) => {
  //         return subcategoria.status ? (
  //           subcategoria.comercios?.length > 0 ? (
              
  //             <>Sirvo</>
  //           ) : null
  //         ) : null;
  //       })}
  //   </>
  // );
};

export default Categorias;
