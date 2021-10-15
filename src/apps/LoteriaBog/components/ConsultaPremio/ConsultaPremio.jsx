import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";

const ConsultaPremio = ({
  operacion,
  sorteo,
  setSorteo,
  billete,
  setBillete,
  serie,
  setSerie,
  hash,
  setHash,
  onSubmit,
}) => {
  return (
    <Form onSubmit={onSubmit} grid>
      <Input
        id="numSorteo"
        label="Numero de sorteo"
        type="text"
        minLength="4"
        maxLength="4"
        autoComplete="false"
        value={sorteo}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setSorteo(num);
        }}
      />
      <Input
        id="numBillete"
        label="Numero de billete"
        type="text"
        minLength="4"
        maxLength="4"
        autoComplete="false"
        value={billete}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setBillete(num);
        }}
      />
      <Input
        id="numSerie"
        label="Numero de serie"
        type="text"
        minLength="3"
        maxLength="3"
        autoComplete="false"
        value={serie}
        onInput={(e) => {
          const num = parseInt(e.target.value) || "";
          setSerie(num);
        }}
      />
      {operacion === "pago" ? (
        <Input
          id="numSerie"
          label="Codigo de seguridad"
          type="text"
          autoComplete="false"
          value={hash}
          onInput={(e) => {            
            setHash(e.target.value);
          }}
        />
      ) : (
        ""
      )}
      <ButtonBar>
        <Button type="submit">Buscar</Button>
      </ButtonBar>
    </Form>
  );
};

export default ConsultaPremio;
