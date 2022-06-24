import React, { Fragment, useState } from 'react'
import ButtonBar from '../../../components/Base/ButtonBar'
import Button from '../../../components/Base/Button'
import Input from '../../../components/Base/Input'
import Select from '../../../components/Base/Select'
import Form from '../../../components/Base/Form'
import TableEnterprise from '../../../components/Base/TableEnterprise'

const ConcilacionMovistar = () => {
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const [tipoOp, setTipoOp] = useState("");
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [table, setTable] = useState("");



  const options = [
    { value: "", label: "" },
    { value: "5", label: "Conciliaciones efectivas" },
    { value: "6", label: "Conciliaciones pendientes" },

  ];
  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Conciliaciones Movistar</h1>
      <Form  grid>
      <TableEnterprise
          title="Conciliación Movistar"
          maxPage={maxPages}
          headers={[
            "Archivo Movistar",
            "Archivo Punto de Pago",
            "Archivo de Diferencias"
          ]}

          data={table || []}
          // onSelectRow={(e, index) => {
          //   if (table[index]["Codigo Estado"] !== 1) {
          //     notifyError(table[index].Estado);
          //   } else {
          //     setSelected(table[index]);
          //   }
          // }}
          onSetPageData={setPageData}
        >
      <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            // setPage(1);
            setMaxPages(1);
            setFechaInicial(e.target.value);
            // if (fechaFinal !== "") {
            //   if (tipoOp !== "") {
            //     report(
            //       comercio,
            //       usuario,
            //       tipoOp,
            //       1,
            //       e.target.value,
            //       fechaFinal,
            //       limit
            //     );
            //   }
            // }
          }}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            // setPage(1);
            setFechaFinal(e.target.value);
            if (fechaInicial !== "") {
              // if (tipoOp !== "") {
              //   report(
              //     comercio,
              //     usuario,
              //     tipoOp,
              //     1,
              //     fechaInicial,
              //     e.target.value,
              //     limit
              //   );
              // }
            }
          }}
        />
        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={options}
          value={tipoOp}
          onChange={(e) => {
            // setPage(1);
            setTipoOp(parseInt(e.target.value));
            // if (!(e.target.value === null || e.target.value === "")) {
            //   report(
            //     comercio,
            //     usuario,
            //     e.target.value,
            //     1,
            //     fechaInicial,
            //     fechaFinal,
            //     limit
            //   );
            // }
          }}
        />
      
          </TableEnterprise>
        </Form>
  </div>
   
  )
}

export default ConcilacionMovistar