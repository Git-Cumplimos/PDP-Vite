import { useEffect } from "react";
import packageJson from "../../../../package.json";

// const urlprueba = `${process.env.REACT_APP_PRUEBA}`;

const CheckPackageVersion = () => {
  //   const caching = () => {
  //     let version = localStorage.getItem("version");
  //     console.log("prueba1", urlprueba);
  //     if (version != packageJson.version) {
  //       console.log("prueba2", urlprueba);
  //       if ("caches" in window) {
  //         caches.keys().then((names) => {
  //           names.forEach((name) => {
  //             caches.delete(name);
  //           });
  //         });
  //         window.location.reload(true);
  //       }
  //       localStorage.clear();
  //       localStorage.setItem("version", packageJson.version);
  //     }
  //   };

  //   useEffect(() => {
  //     caching();
  //   }, []);
  return <></>;
};

export default CheckPackageVersion;
