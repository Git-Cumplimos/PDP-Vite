import { useParams, useHistory, useLocation, Link } from "react-router-dom";
import CargaArchivos from "../Views/CargaArchivos";
import DescargarArchivosS3 from "../Views/DescargarArchivosS3";
import CrearSorteos from "../Views/CrearSorteos";
import Button from "../../../components/Base/Button/Button";
import { useEffect} from "react";

import { useAuth } from "../../../utils/AuthHooks";


import AppIcons from "../../../components/Base/AppIcons/AppIcons";

const AdminLoteria = () => {
  const history = useHistory();
  const { page } = useParams();
  const { pathname } = useLocation();


  const SelectPage = () => {
    
    switch (page) {
      case "cargar":
        return <CargaArchivos />;

      case "descargar":
        return <DescargarArchivosS3 />;
      
      case "sorteos":
        return <CrearSorteos />;
      
      // case "crear_rol":
      //   return <CrearRoles />
      // default:
      //   return "";
    }
  };

  const LotoIcons = ({ Logo, name }) => {
    return (
      <div className="flex flex-col justify-center flex-1 text-center text-base md:text-xl">
        <AppIcons Logo={Logo} />
        <h1>{name}</h1>
      </div>
    );
  };

  const options = [
    { value: "cargar", label: <LotoIcons Logo={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU'} name="Cargar" /> },
    {
      value: "descargar",
      label: <LotoIcons Logo={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU'} name="Descargar" />,
    },
    {
      value: "sorteos",
      label: <LotoIcons Logo={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU'} name="Sorteos" />,
    },
  ];

  const posibles = ["cargar", "descargar","sorteos"];
  // const check = () => {
  //   const posib = [];
  //   const opts = [{ value: "", label: "" }];
  //   opts.push(
  //     { value: "cargar", label: "Cargar archivos" },
  //     { value: "descargar", label: "Descargar archivos" },
  //     // { value: "crear_rol", label: "Crear un usuario" }
  //   );
  //   posib.push("cargar", "descargar", "crear_rol");
  //   return [[...opts], [...posib]];
  // };

  // const [options, posibles] = check();


  // const { consulta_roles  } = useAuth();

  // useEffect(() => {
  //   consulta_roles()
  //   .then((res) => {
         
        
  //   })
    
  // }, [])
    
  return (
    
    <div className="flex flex-col justify-center items-center w-full">
      <>
      {pathname === `/${pathname.split("/")[1]}` ? (
        <div className="flex flex-row flex-wrap justify-center gap-8">
          {options.map(({ value, label }) => {
            return (
              <Link to={`/${pathname.split("/")[1]}/${value}`} key={value}>
                {label}
              </Link>
            );
          })}
        </div>
      ) : (
        ""
      )}
      {posibles.includes(page) ? (
        <div className="flex flex-col md:flex-row justify-evenly w-full">
          <div className="flex flex-col">
            <div className="hidden md:block">
              {options.find(({ value }) => page === value).label}
            </div>
            <div>
              <Link to={`/${pathname.split("/")[1]}`}>
                <Button>Volver</Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center flex-1">
            <SelectPage />
          </div>
        </div>
      ) : (
        ""
      )}
    </>
    </div>
  );
};

export default AdminLoteria