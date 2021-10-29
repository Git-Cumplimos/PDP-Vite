import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import AppIcons from "../../../components/Base/AppIcons/AppIcons";
import fetchData from "../../../utils/fetchData";
import Loteria from "../Views/Loteria";
import Premios from "../Views/Premios";
import Reportes from "../Views/Reportes";
import Sorteos from "../../../assets/svg/SORTEO-01.svg";
import Pago from "../../../assets/svg/PAGO-01.svg";
import Reporte from "../../../assets/svg/REPORTES-01.svg";
import Button from "../../../components/Base/Button/Button";
import dayjs from 'dayjs'

const urlLoto =
  "http://loginconsulta.us-east-2.elasticbeanstalk.com/contiploteria";

const CashierLoteria = () => {
  const [sorteo, setSorteo] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);
  const [day, setDay] = useState('');
  const [hora, setHora] = useState('');

  const { page } = useParams();
  const  history  = useHistory();
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


  //Este servicio sonsulta los sorteos disponibles de la loteria
  const searchLoteriaInfo = useCallback(() => {
    fetchData(
      urlLoto,
      "GET",
      {
        num_loteria: "02",//este valor debe cambiar dependiendo de la loterie 
      },
      {}
    )
      .then((res) => {
        const sortOrd = res.filter(({ tip_sorteo }) => {
          return tip_sorteo === 1;
        });
        const sortExt = res.filter(({ tip_sorteo }) => {
          return tip_sorteo === 2;
        });
        if (sortOrd.length > 0) {
          setSorteo(sortOrd[0].num_sorteo);
        } else {
          notifyError("No se encontraron sorteos ordinarios");
        }
        if (sortExt.length > 0) {
          setSorteoExtra(sortExt[0].num_sorteo);
        } else {
          notifyError("No se encontraron sorteos extraordinarios");
        }
      })
      .catch((err) => console.error(err));
  }, [notifyError]);

  useEffect(() => {
    searchLoteriaInfo();
    setDay(dayjs().day())
    setHora(dayjs().format('HH'))
  }, [searchLoteriaInfo]);

  const SelectPage = () => {
    switch (page) {
      case "sorteos":
        if(day===4 && parseInt(hora)>=20){
          notifyError('Fuera de horario')
          history.push(`/${pathname.split("/")[1]}`)
          return <div></div>;
        }
        return <Loteria sorteo={sorteo} sorteoExtra={sorteoExtra} />;

      case "premios":
        return <Premios />;

      case "reportes":
        return <Reportes sorteo={sorteo} sorteoExtra={sorteoExtra} />;

      default:
        return <p></p>;
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
    { value: "sorteos", label: <LotoIcons Logo={Sorteos} name="Sorteos" /> },
    {
      value: "premios",
      label: <LotoIcons Logo={Pago} name="Premios" />,
    },
    {
      value: "reportes",
      label: <LotoIcons Logo={Reporte} name="Reportes" />,
    },
  ];

  const posibles = ["sorteos", "premios", "reportes"];

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
            <div className="hidden md:block">{options.find(({ value }) => page === value).label}</div>
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

export default CashierLoteria;
