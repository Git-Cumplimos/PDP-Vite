import HNavbar from "../../components/Base/HNavbar";

const Categorias = ({ subcategorias }) => {
  const subcats = subcategorias.filter((subcat) => subcat.status);
  if (!subcats.length)
    return <h2 className="text-xl">No se encuentran subcategorías.</h2>;

  return <HNavbar links={subcats} isIcon />;
};

export default Categorias;
