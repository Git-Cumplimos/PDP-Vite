import React from "react";
import fetchData from "../../../utils/fetchData";
import { useMemo, useEffect, useState } from "react";
import Select from "../../../components/Base/Select";


import { useLoteria } from "../utils/LoteriaHooks";


const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;

const Inventario = () => {
  const {
    infoLoto: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      setLoterias,
    },
    consultaInventario,
    codigos_lot,
  } = useLoteria();


  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);
  const [sorteo, setSorteo] = useState("")
  
  const sorteosLOT = useMemo(() => {
    var cod = "";
    console.log(codigos_lot?.length);
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    console.log(cod);
    return cod;
  }, [codigos_lot]);

  useEffect(() => {
    const query = {
      num_loteria: sorteosLOT,
    };
    fetchData(urlLoto, "GET", query, {})
      .then((res) => {
        setSorteofisico(null);
        setSorteofisicoextraordinario(null);
        console.log(res);
        const sortOrdfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && fisico;
        });
        const sortExtfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && fisico;
        });

        if (sortOrdfisico.length > 0) {
          setSorteofisico(sortOrdfisico[0]);
        } else {
          /*    notifyError("No se encontraron extraordinarios fisicos"); */
        }

        if (sortExtfisico.length > 0) {
          setSorteofisicoextraordinario(sortExtfisico[0]);
        } else {
          /*   notifyError("No se encontraron extraordinarios fisicos"); */
        }
      })
      .catch((err) => console.error(err));
  }, [codigos_lot, sorteosLOT]);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    console.log(sorteoOrdifisico);
    const copy = [{ value: "", label: "" }];
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo ordinario  fisico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.num_loteria}`,
        label: `Sorteo extraordinario fisico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);
  }, [
    sorteoExtrafisico,
    sorteoOrdifisico,
    sorteosLOT,
    codigos_lot,
  ]);

  return (
  <Select
          disabled={serie !== "" || numero !== ""}
          id="selectSorteo"
          label="Tipo de sorteo"
          options={opcionesdisponibles}
          value={sorteo}
          onChange={(e) => {
            setSorteo(e.target.value)
            consultaInventario(e.target.value.split[0],e.target.value.split[1]).then((res) => {
              console.log(res)
            });
          }
          }
        />
  
  );
};

export default Inventario;
