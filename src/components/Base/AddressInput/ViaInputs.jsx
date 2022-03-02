import Input from "../Input";
import Select from "../Select";

const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
};

const ViaInputs = ({ streetObj }) => {
  const { streetNum, streetLetter, streetSuffix, streetQuadrant } = streetObj;

  const [mainStreetNum, setMainStreetNum] = streetNum;
  const [mainStreetNumLetter, setMainStreetNumLetter] = streetLetter;
  const [mainStreetSuffix, setMainStreetSuffix] = streetSuffix;
  const [mainStreetQuadrant, setMainStreetQuadrant] = streetQuadrant;

  return (
    <>
      <Input
        id="mainStreetNum"
        type="text"
        maxLength="3"
        minLength="1"
        size="1"
        autoComplete="off"
        value={mainStreetNum}
        onInput={(e) => setMainStreetNum(parseInt(e.target.value) || "")}
        required
        self
      />
      <Select
        id="mainStreetNumLetter"
        options={{
          "": "",
          ...Object.fromEntries([
            ...[...Array(26)].map((_, i) => {
              return [String.fromCharCode(65 + i), String.fromCharCode(65 + i)];
            }),
          ]),
        }}
        value={mainStreetNumLetter}
        onInput={(e) => setMainStreetNumLetter(e.target.value)}
        self
      />
      <Input
        id="mainStreetSuffix"
        type="text"
        size="3"
        maxLength="7"
        value={mainStreetSuffix}
        onInput={(e) => setMainStreetSuffix(capitalize(e.target.value))}
        self
      />
      <Select
        id="mainStreetQuadrant"
        options={{
          "": "",
          NORTE: "NORTE",
          SUR: "SUR",
          ESTE: "ESTE",
          OESTE: "OESTE",
        }}
        value={mainStreetQuadrant}
        onInput={(e) => setMainStreetQuadrant(e.target.value)}
        self
      />
    </>
  );
};

export default ViaInputs;
