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

  const [pines, setPines] = useState([]);

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
    fecthTablaTiposPines();
  }, [datosTrans]);

  const fecthTablaTiposPines = () => {
    console.log('info ', datosTrans.pin)
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: state.op,
      pin: datosTrans.pin,
    })
      .then((autoArr) => {
        setPines(autoArr?.results ?? []);
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
