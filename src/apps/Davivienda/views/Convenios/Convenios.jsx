import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

const Convenios = () => {
  return (
    <div>
      <TableEnterprise
        title="Tabla de convenios Banco Davivienda"
        headers={["Código convenio", "Nombre convenio", "EAN"]}
        data={[
          {
            "Código convenio": 1,
            "Nombre convenio": "Convenio 1",
            EAN: 123456789,
          },
          {
            "Código convenio": 2,
            "Nombre convenio": "Convenio 2",
            EAN: 123456789,
          },
          {
            "Código convenio": 3,
            "Nombre convenio": "Convenio 3",
            EAN: 123456789,
          },
        ]}
      >
        <Input label="Nombre convenio" type="text" />
        <Input label="Código convenio" type="number" />
        <Input label="EAN" type="number" />
      </TableEnterprise>
    </div>
  );
};

export default Convenios;

