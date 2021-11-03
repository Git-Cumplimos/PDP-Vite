import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AppIcons from "../../../../components/Base/AppIcons/AppIcons";
import fetchData from "../../../../utils/fetchData";
import Loteria from "../../../LoteriaBog/Views/Loteria";
import Premios from "../../../LoteriaBog/Views/Premios";
import Reportes from "../../../LoteriaBog/Views/Reportes";
import Sorteos from "../../../../assets/svg/SORTEO-01.svg";

import Pago from "../../../../assets/svg/PAGO-01.svg";
import Reporte from "../../../../assets/svg/REPORTES-01.svg";
import Button from "../../../../components/Base/Button/Button";

// datos fundacion de la mujer
import Desembolsos from  "../Pages/Desembolsos"; 
import Recaudo from "../Pages/Recaudos";
import Transacciones from "../Pages/Transacciones"

const FundacionWomen = () => {


  const [desembolso, setDesembolso] = useState(null);
  
  const [recaudo, setRecaudo] = useState(null);
  const [transacciones, settransacciones] = useState(null);


  
  const { page } = useParams();
  const { pathname } = useLocation();

  const notifyError = useCallback((msg = "Error") => {
    toast.warning(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);



  const SelectPage = () => {
    switch (page) {
     
      case "Desembolso":
        return <Desembolsos sorteo={desembolso}   sorteoExtra={setDesembolso}/>;
         

      case"Recaudo":
        return  <Recaudo sorteo={recaudo} sorteoExtra={setRecaudo}/>


      case "transacciones":
        return <Transacciones sorteo={transacciones} sorteoExtra={settransacciones}/>
        return <p></p>;
    }
  };

  const FundacionIcons = ({ Logo, name }) => {
    return (
      <div className="flex flex-col justify-center flex-1 text-center text-base md:text-xl">
        <AppIcons Logo={Logo} />
        <h1>{name}</h1>
      </div>
    );
  };

  const options = [
    {
      value: "Desembolso",
      label: <FundacionIcons name="Desembolso"  Logo={"https://w7.pngwing.com/pngs/663/975/png-transparent-systemic-lupus-erythematosus-lupus-foundation-of-america-computer-icons-others-purple-violet-text.png"} />,
    },
    {
      value: "Recaudo",
      label: <FundacionIcons name="Recaudo"  Logo={"https://irp-cdn.multiscreensite.com/c82c664f/MOBILE/png/943810-tuerca_icono.png"}  />,
    },
    {
      value: "transacciones",
      label: <FundacionIcons name="transacciones" Logo={"https://www.elempleo.com/sitios-empresariales/colombia/fundacion-de-la-mujer/video/LogoLoopFundacion_1_1.jpg"}  />,
    },
  ];

  const posibles = ["Desembolso", "Recaudo", "transacciones"];

  return (
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
  );
};

export default FundacionWomen;
