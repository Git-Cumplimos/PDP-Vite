import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { postConsultaPin } from "../../utils/fetchBackPines";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";

const InformacionPin = () => {
  const navigate = useNavigate();
  ////////////////////

  const { state } = useLocation();
  // const [{ searchConvenio = "" }, setQuery] = useQuery();

  const [pines, setConvenios] = useState([]);
  // const [maxPages, setMaxPages] = useState(0);

  useEffect(() => {
    if (state?.op) {
      fecthTablaConveniosPaginadoFunc();
    } else {
      navigate("../");
    }
  }, [state?.op]);

  ////////////////////

  const { roleInfo, infoTicket } = useAuth();

  // const [{ page, limit }, setPageData] = useState({
  //   page: 1,
  //   limit: 10,
  // });
  const [datosTrans, setDatosTrans] = useState({
    pin: "",
  });

  const tableTipoPin = useMemo(() => {
    return [
      ...pines?.map(({ productDesc, sell, validity }) => {
        return {
          "Nombre del Pin": productDesc,
          Valor: formatMoney.format(sell) ,
          "Días de validez": validity * 1,
        };
      }),
    ];
  }, [pines]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate("../Pines/PinesContenido/CompraPin", {
        state: {
          desc: pines[i]["productDesc"],
          sell: pines[i]["sell"],
          op: state.op,
        },
      });
    },
    [navigate, pines]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans]);

  const fecthTablaConveniosPaginadoFunc = () => {
    console.log('pin', datosTrans.pin)
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: state.op,
      pin: datosTrans.pin,
    })
      .then((autoArr) => {
        setConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1 className="text-3xl text-center">Información del Pin</h1>
      <TableEnterprise
        title="Tabla pines"
        headers={["Nombre del tipo de Pin", "Valor", "Días de validez"]}
        data={tableTipoPin}
        onSelectRow={onSelectAutorizador}
      >
        <Input
          id="searchConvenio"
          name="searchConvenio"
          label={"Nombre del tipo de Pin"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, pin: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default InformacionPin;
