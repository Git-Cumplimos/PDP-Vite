import HNavbar from "../../components/Base/HNavbar";

const Categorias = ({ subcategorias }) => {
  if (!subcategorias.length)
    return <h2 className="text-xl">No se encuentran subcategorías.</h2>;

  return <HNavbar links={subcategorias} isIcon />;
};

export default Categorias;
