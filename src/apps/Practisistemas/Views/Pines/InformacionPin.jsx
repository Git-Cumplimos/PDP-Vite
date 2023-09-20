import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { postConsultaPin } from "../../utils/fetchBackPines";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
const InformacionPin = () => {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);

  const { state } = useLocation();

  const [pines, setPines] = useState([]);
  const [filteredPines, setFilteredPines] = useState([]);

  useEffect(() => {
    if (state?.op) {
      fecthTablaTiposPines();
    } else {
      navigate("../");
    }
  }, [state?.op]);

  const { roleInfo, infoTicket } = useAuth();

  const [datosTrans, setDatosTrans] = useState({
    pin: "",
  });

  const tableTipoPin = useMemo(() => {
    return [
      ...filteredPines.map(({ productDesc, sell, validity }) => {
        return {
          "Nombre del Pin": productDesc,
          Valor: formatMoney.format(sell),
          "Vigencia del Plan": validity * 1,
        };
      }),
    ];
  }, [filteredPines]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate("../Pines/PinesContenido/CompraPin", {
        state: {
          desc: pines[i]["productDesc"],
          cod: pines[i]["internalCod"],
          sell: pines[i]["sell"],
          op: state.op,
        },
      });
    },
    [navigate, pines]
  );

  useEffect(() => {
    fecthTablaTiposPines();
  }, [datosTrans]);

  const fecthTablaTiposPines = () => {
    setShowLoading(true)
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: state.op,
      pin: datosTrans.pin,
    })
      .then((autoArr) => {
        setShowLoading(false)
        const filteredResults = autoArr?.results.filter((pin) =>
          pin.productDesc.toLowerCase().includes(datosTrans.pin.toLowerCase())
        ) ?? [];
        setPines(autoArr?.results ?? []);
        setFilteredPines(filteredResults);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl text-center">Información del Pin</h1>
      <TableEnterprise
        title="Tabla pines"
        headers={["Nombre del tipo de Pin", "Valor", "Vigencia del Plan"]}
        data={tableTipoPin}
        onSelectRow={onSelectAutorizador}
      >
        <Input
          id="searchPin"
          name="searchPin"
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
