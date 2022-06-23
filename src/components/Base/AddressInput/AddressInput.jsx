import { useEffect, useMemo, useState } from "react";
import Input from "../Input";
import Select from "../Select";
import classes from "./AddressInput.module.css";
import ViaInputs from "./ViaInputs";

const AddressInput = ({ label, place, getAddress }) => {
  const { AddressInput } = classes;

  const [mainStreetName, setMainStreetName] = useState("");

  const mainStreet = {
    streetNum: useState(""),
    streetLetter: useState(""),
    streetSuffix: useState(""),
    streetQuadrant: useState(""),
  };
  const secondaryStreet = {
    streetNum: useState(""),
    streetLetter: useState(""),
    streetSuffix: useState(""),
    streetQuadrant: useState(""),
  };

  const diffTypes = useMemo(() => ["VI"], []);

  const [thirdStreetNum, setThirdStreetNum] = useState("");
  const [detailsStreet, setDetailsStreet] = useState("");

  useEffect(() => {
    getAddress &&
      getAddress(
        `${mainStreetName} ${mainStreet.streetNum[0]}${
          mainStreet.streetLetter[0] !== ""
            ? ` ${mainStreet.streetLetter[0]}`
            : ""
        }${
          mainStreet.streetSuffix[0] !== ""
            ? ` ${mainStreet.streetSuffix[0]}`
            : ""
        }${
          mainStreet.streetQuadrant[0] !== ""
            ? ` ${mainStreet.streetQuadrant[0]}`
            : ""
        } # ${secondaryStreet.streetNum[0]}${
          secondaryStreet.streetLetter[0] !== ""
            ? ` ${secondaryStreet.streetLetter[0]}`
            : ""
        }${
          secondaryStreet.streetSuffix[0] !== ""
            ? ` ${secondaryStreet.streetSuffix[0]}`
            : ""
        }${
          secondaryStreet.streetQuadrant[0] !== ""
            ? ` ${secondaryStreet.streetQuadrant[0]}`
            : ""
        } - ${thirdStreetNum}`
      );
  });

  return (
    <div className="flex flex-col lg:col-span-2">
      {label && label !== "" && (
        <label
          className="text-xl text-center"
          htmlFor={`mainStreetName_${place}`}
        >
          {label}
        </label>
      )}
      <div className={AddressInput}>
        <Select
          id={`mainStreetName_${place}`}
          options={{
            "": "",
            Autopista: "AU",
            Avenida: "AV",
            "Avenida Calle": "AC",
            "Avenida Carrera": "AK",
            Bulevar: "BL",
            Calle: "CL",
            Carrera: "KR",
            Carretera: "CT",
            Circular: "CQ",
            Circunvalar: "CV",
            "Cuentas Corridas": "CC",
            Diagonal: "DG",
            Pasaje: "PJ",
            Paseo: "PS",
            Peatonal: "PT",
            Transversal: "TV",
            Troncal: "TC",
            Variante: "VT",
            Via: "VI",
          }}
          value={mainStreetName}
          onChange={(e) => setMainStreetName(e.target.value)}
          required
          self
        />
        {!diffTypes.includes(mainStreetName) ? (
          <>
            <ViaInputs streetObj={mainStreet} />
            #
            <ViaInputs streetObj={secondaryStreet} />
            &mdash;
            <Input
              id="thirdStreetNum"
              maxLength="3"
              minLength="1"
              size="1"
              autoComplete="off"
              value={thirdStreetNum}
              onInput={(e) => setThirdStreetNum(parseInt(e.target.value) || "")}
              required
              self
            />
            |
            <Input
              id="detailsStreet"
              maxLength="50"
              minLength="1"
              size="18"
              placeholder="Detalles"
              autoComplete="off"
              value={detailsStreet}
              onInput={(e) => setDetailsStreet(e.target.value)}
              self
            />
          </>
        ) : (
          <Input
            id="detailsStreet"
            maxLength="100"
            minLength="1"
            size="50"
            autoComplete="off"
            value={detailsStreet}
            onInput={(e) => setDetailsStreet(e.target.value)}
            self
          />
        )}
      </div>
    </div>
  );
};

export default AddressInput;
