import fetchData from "../../../utils/fetchData";

export const PeticionRecarga = async (url_, data_) => {
  try {
    const Peticion = await fetchData(url_, "POST", {}, data_);
    // if (!Peticion?.status) {
    //   console.error(Peticion?.msg);
    // }
    return Peticion;
  } catch (error) {
    console.log("Error con fetch - no conecta al servicio");
  }
};
