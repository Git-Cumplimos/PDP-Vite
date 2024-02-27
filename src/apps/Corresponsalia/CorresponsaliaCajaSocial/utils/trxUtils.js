export const algoCheckCuentaDepositoCajaSocial = (numeroCuenta) => {
  const numeroCuentaCut = numeroCuenta.slice(0, 10);
  let conteo = 0;
  let sumTotal = 0;
  const arrayVali = [7, 3, 1];
  for (let index = 0; index < numeroCuentaCut.length; index++) {
    if (conteo === 3) conteo = 0;
    const numeroCuentaIndividual = parseInt(numeroCuentaCut[index]);
    let resultMulti = numeroCuentaIndividual * arrayVali[conteo];
    if (resultMulti > 9) resultMulti = resultMulti % 10;
    sumTotal += resultMulti;
    conteo += 1;
  }
  const sumTotalResult = sumTotal % 10;
  return sumTotalResult === parseInt(numeroCuenta.slice(-1));
};
