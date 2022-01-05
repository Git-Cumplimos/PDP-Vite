import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppIcons from "../../components/Base/AppIcons/AppIcons";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import ButtonLink from "../../components/Base/ButtonLink/ButtonLink";
// import HNavbar from "../../components/Base/HNavbar/HNavbar";
import InputSuggestions from "../../components/Base/InputSuggestions/InputSuggestions";
import fetchData from "../../utils/fetchData";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;

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

const Recaudo = () => {
  const [, setMostUsed] = useState([]);

  const [foundConv, setFoundConv] = useState([]);

  const mapSuggestions = useMemo(() => {
    return foundConv.map(({ id_convenio, nombre_convenio }) => {
      return (
        <Link to={`/recaudo/manual?id_convenio=${id_convenio}`}>
          <div className="grid grid-cols-1 place-items-center px-4 py-2">
            <h1 className="text-lg">{nombre_convenio}</h1>
          </div>
        </Link>
      );
    });
  }, [foundConv]);

  const searchConvenios = useCallback((e) => {
    const _nameConvenio = e.target.value;
    if (_nameConvenio.length > 2) {
      // setFoundConv(initialFounds);
      fetchData(`${urlConvenios}/convenio_many`, "GET", {
        tags: _nameConvenio,
        limit: 5,
      })
        .then((res) => {
          if (res?.status) {
            setFoundConv(res?.obj?.results);
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    } else {
      setFoundConv([]);
    }
  }, []);

  useEffect(() => {
    setMostUsed(initialItems);
    // fetchData(`${urlConvenios}/`, "GET", {})
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
      {/* <HNavbar links={mostUsed} isIcon /> */}
      <InputSuggestions
        label={"Buscar convenio"}
        name={"nameConvenio"}
        type={"search"}
        autoComplete="off"
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
