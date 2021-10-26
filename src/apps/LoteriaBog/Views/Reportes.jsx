import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import Graphs from "../components/Graphs/Graphs";
import { useLoteria } from "../utils/LoteriaHooks";
//import Modal from "../../../components/Base/Modal/Modal";

const Reportes = ({ sorteo, sorteoExtra }) => {
  const {
    reportes: {
      moda,
      sorteo: inputSorteo,
      setSorteo,
      fechaInicial,
      setFechaInicial,
      fechaFinal,
      setFechaFinal,
    },
    searchModa,
  } = useLoteria();

  return (
    <>
      <h1 className="text-xl m-4">Numeros mas buscados</h1>
      <Select
        id="searchBySorteo"
        label="Sorteo"
        options={[
          { value: "", label: "" },
          { value: sorteo, label: `Sorteo ordinario - ${sorteo}` },
          {
            value: sorteoExtra,
            label: `Sorteo extraordinario - ${sorteoExtra}`,
          },
        ]}
        value={inputSorteo}
        onChange={(e) => {
          setSorteo(e.target.value);
          searchModa(null, null, e.target.value);
        }}
      />
      {inputSorteo === "" ? (
        <>
          <div className="flex flex-row justify-center w-full">
            {/* <hr className="border-black flex-auto" /> */}
            Ó
            {/* <hr className="border-black flex-auto" /> */}
          </div>
          <Form>
            <Input
              id="dateInit"
              label="Fecha inicial"
              type="date"
              value={fechaInicial}
              onInput={(e) => {
                setFechaInicial(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {
                  searchModa(e.target.value, fechaInicial);
                },
                timeOut: 500,
              }}
            />
            <Input
              id="dateEnd"
              label="Fecha final"
              type="date"
              value={fechaFinal}
              onInput={(e) => {
                setFechaFinal(e.target.value);
              }}
              onLazyInput={{
                callback: (e) => {
                  searchModa(fechaInicial, e.target.value);
                },
                timeOut: 500,
              }}
            />
          </Form>
        </>
      ) : (
        ""
      )}
      <Graphs moda={moda} />
    </>
  );
};

export default Reportes;
