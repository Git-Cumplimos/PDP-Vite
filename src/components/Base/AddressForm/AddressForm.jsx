import { Fragment, useCallback, useReducer } from "react";
import ButtonBar from "../ButtonBar";
import Button from "../Button";

const diffTypes = ["VI"];
const mainStreetTypes = [
  { label: "", value: "" },
  { label: "Autopista", value: "AU" },
  { label: "Avenida", value: "AV" },
  { label: "Avenida Calle", value: "AC" },
  { label: "Avenida Carrera", value: "AK" },
  { label: "Bulevar", value: "BL" },
  { label: "Calle", value: "CL" },
  { label: "Carrera", value: "KR" },
  { label: "Carretera", value: "CT" },
  { label: "Circular", value: "CQ" },
  { label: "Circunvalar", value: "CV" },
  { label: "Cuentas Corridas", value: "CC" },
  { label: "Diagonal", value: "DG" },
  { label: "Pasaje", value: "PJ" },
  { label: "Paseo", value: "PS" },
  { label: "Peatonal", value: "PT" },
  { label: "Transversal", value: "TV" },
  { label: "Troncal", value: "TC" },
  { label: "Variante", value: "VT" },
  { label: "Via", value: "VI" },
];

const initialAddress = {
  mainStreet: {
    name: "",
    number: "",
    letter: "",
    suffix: "",
    quadrant: "",
  },
  secondaryStreet: {
    number: "",
    letter: "",
    suffix: "",
    quadrant: "",
  },
  thirdStreet: {
    number: "",
  },
  detailsStreet: "",
};

const buildAddress = ({
  mainStreet,
  secondaryStreet,
  thirdStreet,
  detailsStreet,
}) => {
  const mainInfo = Object.entries(mainStreet)
    .map(([_, val]) => val)
    .filter((val) => val)
    .join(" ");

  const secondaryInfo = Object.entries(secondaryStreet)
    .map(([_, val]) => val)
    .filter((val) => val)
    .join(" ");

  return `${mainInfo}${secondaryInfo !== "" ? ` # ${secondaryInfo}` : ""}${
    thirdStreet.number !== "" ? ` - ${thirdStreet.number}` : ""
  }${detailsStreet !== "" ? ` | ${detailsStreet}` : ""}`;
};

/**
 * Actions
 */
const UPDATE_MAIN_STREET_NAME = "UPDATE_MAIN_STREET_NAME";

const UPDATE_MAIN_STREET_NUMBER = "UPDATE_MAIN_STREET_NUMBER";
const UPDATE_MAIN_STREET_LETTER = "UPDATE_MAIN_STREET_LETTER";
const UPDATE_MAIN_STREET_SUFFIX = "UPDATE_MAIN_STREET_SUFFIX";
const UPDATE_MAIN_STREET_QUADRANT = "UPDATE_MAIN_STREET_QUADRANT";

const UPDATE_SECONDARY_STREET_NUMBER = "UPDATE_SECONDARY_STREET_NUMBER";
const UPDATE_SECONDARY_STREET_LETTER = "UPDATE_SECONDARY_STREET_LETTER";
const UPDATE_SECONDARY_STREET_SUFFIX = "UPDATE_SECONDARY_STREET_SUFFIX";
const UPDATE_SECONDARY_STREET_QUADRANT = "UPDATE_SECONDARY_STREET_QUADRANT";

const UPDATE_THIRD_STREET_NUMBER = "UPDATE_THIRD_STREET_NUMBER";

const UPDATE_DETAILS_STREET = "UPDATE_DETAILS_STREET";

const CLEAR_ADDRESS_STATE = "CLEAR_ADDRESS_STATE";

const reducerAddress = (addressState, action) => {
  switch (action.type) {
    case UPDATE_MAIN_STREET_NAME:
      return {
        ...addressState,
        mainStreet: {
          ...addressState.mainStreet,
          name: action.payload,
        },
      };
    case UPDATE_MAIN_STREET_NUMBER:
      return {
        ...addressState,
        mainStreet: {
          ...addressState.mainStreet,
          number: action.payload,
        },
      };
    case UPDATE_MAIN_STREET_LETTER:
      return {
        ...addressState,
        mainStreet: {
          ...addressState.mainStreet,
          letter: action.payload,
        },
      };
    case UPDATE_MAIN_STREET_SUFFIX:
      return {
        ...addressState,
        mainStreet: {
          ...addressState.mainStreet,
          suffix: action.payload,
        },
      };
    case UPDATE_MAIN_STREET_QUADRANT:
      return {
        ...addressState,
        mainStreet: {
          ...addressState.mainStreet,
          quadrant: action.payload,
        },
      };
    case UPDATE_SECONDARY_STREET_NUMBER:
      return {
        ...addressState,
        secondaryStreet: {
          ...addressState.secondaryStreet,
          number: action.payload,
        },
      };
    case UPDATE_SECONDARY_STREET_LETTER:
      return {
        ...addressState,
        secondaryStreet: {
          ...addressState.secondaryStreet,
          letter: action.payload,
        },
      };
    case UPDATE_SECONDARY_STREET_SUFFIX:
      return {
        ...addressState,
        secondaryStreet: {
          ...addressState.secondaryStreet,
          suffix: action.payload,
        },
      };
    case UPDATE_SECONDARY_STREET_QUADRANT:
      return {
        ...addressState,
        secondaryStreet: {
          ...addressState.secondaryStreet,
          quadrant: action.payload,
        },
      };
    case UPDATE_THIRD_STREET_NUMBER:
      return {
        ...addressState,
        thirdStreet: {
          ...addressState.thirdStreet,
          number: action.payload,
        },
      };
    case UPDATE_DETAILS_STREET:
      return {
        ...addressState,
        detailsStreet: action.payload,
      };
    case CLEAR_ADDRESS_STATE:
      return initialAddress;
    default:
      throw new Error(`Bad action ${JSON.stringify(action, null, 2)}`);
  }
};

const AddressForm = ({
  onCancel = () => {},
  onSuccess = () => {},
  editAddress = null,
}) => {
  const [addressState, dispatch] = useReducer(
    reducerAddress,
    editAddress ?? initialAddress
  );

  const onChangeAddress = useCallback(
    (ev) => dispatch({ type: ev.target.name, payload: ev.target.value }),
    []
  );

  return (
    <form
      className="grid grid-flow-row gap-2 my-4"
      onSubmit={useCallback(
        (ev) => {
          ev.preventDefault();
          onSuccess?.(buildAddress(addressState), addressState);
        },
        [onSuccess, addressState]
      )}
    >
      {!diffTypes.includes(addressState.mainStreet.name) ? (
        <Fragment>
          <div className="grid grid-cols-6 gap-2">
            <div className="grid grid-rows-2 col-span-2">
              <label htmlFor="mainStreet_name" className="h-auto">
                Tipo de dirección
              </label>
              <select
                id="mainStreet_name"
                name={UPDATE_MAIN_STREET_NAME}
                className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
                value={addressState.mainStreet.name}
                onChange={onChangeAddress}
                required
              >
                {mainStreetTypes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="mainStreet_number">Calle</label>
              <input
                id="mainStreet_number"
                name={UPDATE_MAIN_STREET_NUMBER}
                className="px-4 py-2 rounded-md bg-secondary-light text-black"
                value={addressState.mainStreet.number}
                onChange={onChangeAddress}
                type="text"
                maxLength="3"
                minLength="1"
                size="1"
                autoComplete="off"
                required
              />
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="mainStreet_letter"></label>
              <select
                id="mainStreet_letter"
                name={UPDATE_MAIN_STREET_LETTER}
                className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
                value={addressState.mainStreet.letter}
                onChange={onChangeAddress}
              >
                {Object.entries({
                  "": "",
                  ...Object.fromEntries([
                    ...[...Array(26)].map((_, i) => {
                      return [
                        String.fromCharCode(65 + i),
                        String.fromCharCode(65 + i),
                      ];
                    }),
                  ]),
                }).map(([label, value]) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="mainStreet_suffix"></label>
              <input
                id="mainStreet_suffix"
                name={UPDATE_MAIN_STREET_SUFFIX}
                className="px-4 py-2 rounded-md bg-secondary-light text-black"
                value={addressState.mainStreet.suffix}
                onChange={onChangeAddress}
                type="text"
                maxLength="3"
                minLength="1"
                size="1"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="mainStreet_quadrant"></label>
              <select
                id="mainStreet_quadrant"
                name={UPDATE_MAIN_STREET_QUADRANT}
                className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
                value={addressState.mainStreet.quadrant}
                onChange={onChangeAddress}
              >
                {Object.entries({
                  "": "",
                  NORTE: "NORTE",
                  SUR: "SUR",
                  ESTE: "ESTE",
                  OESTE: "OESTE",
                }).map(([label, value]) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="grid grid-rows-2">
              <label htmlFor="secondaryStreet_number">Numero</label>
              <input
                id="secondaryStreet_number"
                name={UPDATE_SECONDARY_STREET_NUMBER}
                className="px-4 py-2 rounded-md bg-secondary-light text-black"
                value={addressState.secondaryStreet.number}
                onChange={onChangeAddress}
                type="text"
                maxLength="3"
                minLength="1"
                size="1"
                autoComplete="off"
                required
              />
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="secondaryStreet_letter"></label>
              <select
                id="secondaryStreet_letter"
                name={UPDATE_SECONDARY_STREET_LETTER}
                className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
                value={addressState.secondaryStreet.letter}
                onChange={onChangeAddress}
              >
                {Object.entries({
                  "": "",
                  ...Object.fromEntries([
                    ...[...Array(26)].map((_, i) => {
                      return [
                        String.fromCharCode(65 + i),
                        String.fromCharCode(65 + i),
                      ];
                    }),
                  ]),
                }).map(([label, value]) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="secondaryStreet_suffix"></label>
              <input
                id="secondaryStreet_suffix"
                name={UPDATE_SECONDARY_STREET_SUFFIX}
                className="px-4 py-2 rounded-md bg-secondary-light text-black"
                value={addressState.secondaryStreet.suffix}
                onChange={onChangeAddress}
                type="text"
                maxLength="3"
                minLength="1"
                size="1"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="secondaryStreet_quadrant"></label>
              <select
                id="secondaryStreet_quadrant"
                name={UPDATE_SECONDARY_STREET_QUADRANT}
                className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
                value={addressState.secondaryStreet.quadrant}
                onChange={onChangeAddress}
              >
                {Object.entries({
                  "": "",
                  NORTE: "NORTE",
                  SUR: "SUR",
                  ESTE: "ESTE",
                  OESTE: "OESTE",
                }).map(([label, value]) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-rows-2">
              <label />
              <div className="m-auto align-middle text-center">&mdash;</div>
            </div>
            <div className="grid grid-rows-2">
              <label htmlFor="thirdStreet_number"></label>
              <input
                id="thirdStreet_number"
                name={UPDATE_THIRD_STREET_NUMBER}
                className="px-4 py-2 rounded-md bg-secondary-light text-black"
                value={addressState.thirdStreet.number}
                onChange={onChangeAddress}
                type="text"
                maxLength="3"
                minLength="1"
                size="1"
                autoComplete="off"
                required
              />
            </div>
          </div>
        </Fragment>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          <div className="grid grid-rows-2 col-span-2">
            <label htmlFor="mainStreet_name" className="h-auto">
              Tipo de dirección
            </label>
            <select
              id="mainStreet_name"
              name={UPDATE_MAIN_STREET_NAME}
              className="px-4 py-2 rounded-md bg-secondary-light text-black w-full"
              value={addressState.mainStreet.name}
              onChange={onChangeAddress}
              required
            >
              {mainStreetTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <div className="grid grid-rows-2">
          <label htmlFor="detailsStreet">Detalles</label>
          <input
            id="detailsStreet"
            name={UPDATE_DETAILS_STREET}
            className="px-4 py-2 rounded-md bg-secondary-light text-black"
            value={addressState.detailsStreet}
            onChange={onChangeAddress}
            type="text"
            maxLength="100"
            minLength="1"
            size="50"
            autoComplete="off"
          />
        </div>
      </div>
      <div>
        <div className="grid grid-rows-2">
          <label htmlFor="addressComplete">Direccion</label>
          <input
            id="addressComplete"
            nameu="addressComplete"
            className="px-4 py-2 rounded-md bg-secondary-light text-black"
            type="text"
            value={buildAddress(addressState)}
            placeholder="Ej: Calle 12 No. 10"
            disabled
          />
        </div>
      </div>
      <ButtonBar>
        <Button
          type="button"
          onClick={useCallback(() => onCancel?.(), [onCancel])}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={() => dispatch({ type: CLEAR_ADDRESS_STATE })}
        >
          Limpiar
        </Button>
        <Button type="submit">Aceptar</Button>
      </ButtonBar>
    </form>
  );
};

export default AddressForm;
