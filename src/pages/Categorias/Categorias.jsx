import Error403 from "../Error403";
import Subcategorias from "./Subcategorias";

const Categorias = ({ subcategorias }) => {
  if (!subcategorias.length) return <Error403 />;
  return (
    <>
      {subcategorias &&
        subcategorias.map((subcategoria) => {
          return (
            <Subcategorias
              key={subcategoria.nombre}
              comercios={subcategoria.comercios}
              title={subcategoria.nombre}
            />
          );
        })}
    </>
  );
};

export default Categorias;
