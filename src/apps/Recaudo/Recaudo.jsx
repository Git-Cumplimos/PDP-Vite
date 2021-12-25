import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import ButtonLink from "../../components/Base/ButtonLink/ButtonLink";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import InputSuggestions from "../../components/Base/InputSuggestions/InputSuggestions";
import fetchData from "../../utils/fetchData";

const initialItems = [
  {
    link: "/recaudo/manual?id_convenio=2",
    label: <AppIcons Logo="" name={"Mas transado 1"} />,
  },
  {
    link: "/recaudo/manual?id_convenio=3",
    label: (
      <AppIcons
        Logo="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/ETB_Bogot%C3%A1_logo.svg/800px-ETB_Bogot%C3%A1_logo.svg.png"
        name={"Mas transado 2"}
      />
    ),
  },
  {
    link: "/recaudo/manual?id_convenio=4",
    label: <AppIcons Logo="" name={"Mas transado 3"} />,
  },
];

const initialFounds = [
  {
    id_convenio: 22,
    nombre_convenio: "Etb",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/ETB_Bogot%C3%A1_logo.svg/800px-ETB_Bogot%C3%A1_logo.svg.png",
  },
  {
    id_convenio: 32,
    nombre_convenio: "Kimel",
    image: "https://picsum.photos/400",
  },
];

const Recaudo = () => {
  const [mostUsed, setMostUsed] = useState([]);

  const [foundConv, setFoundConv] = useState([]);

  const mapSuggestions = useMemo(() => {
    return foundConv.map(({ id_convenio, nombre_convenio, image }) => {
      return (
        <Link to={`/recaudo/manual?id_convenio=${id_convenio}`}>
          <div className="grid grid-cols-4 place-items-center">
            <img src={image} alt={nombre_convenio} width={25} height={25} />
            <h1 className="col-span-3">{nombre_convenio}</h1>
          </div>
        </Link>
      );
    });
  }, [foundConv]);

  const searchConvenios = useCallback((e) => {
    const _nameConvenio = e.target.value;
    if (_nameConvenio.length > 2) {
      setFoundConv(initialFounds);
      // fetchData("", "GET", {
      //   q: _actividad,
      //   limit: 5,
      // })
      //   .then((res) => {
      //     if (res?.status) {
      //       setFoundConv(res?.obj);
      //     }
      //   })
      //   .catch(() => {});
    } else {
      setFoundConv([]);
    }
  }, []);

  useEffect(() => {
    setMostUsed(initialItems);
    // fetchData("", "GET", {})
    //   .then((res) => {
    //     if (res?.status) {
    //       setMostUsed(res?.obj);
    //     } else {
    //       console.error(res?.msg);
    //     }
    //   })
    //   .catch((err) => console.error(err));
  }, []);

  return (
    <Fragment>
      <ButtonBar>
        <ButtonLink to="/recaudo/codigo">Leer codigo de barras</ButtonLink>
      </ButtonBar>
      <HNavbar links={mostUsed} isIcon />
      <InputSuggestions
        label={"Buscar convenio"}
        name={"nameConvenio"}
        type={"search"}
        autocomplete="off"
        suggestions={mapSuggestions || []}
        onLazyInput={{
          callback: searchConvenios,
          timeOut: 500,
        }}
      />
    </Fragment>
  );
};

export default Recaudo;
