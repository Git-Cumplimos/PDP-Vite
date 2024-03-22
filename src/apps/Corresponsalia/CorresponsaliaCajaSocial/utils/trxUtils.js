export const algoCheckCuentaCreditoBMCajaSocial = (numeroCuenta) => {
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

export const algoCheckCreditoLendingCajaSocial = (numeroCuenta) => {
  const numeroCuentaCut = numeroCuenta.slice(0, 12);
  let conteo = 0;
  let sumTotal = 0;
  const arrayVali = [3, 1, 2];
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

export const algoCheckTCCreditoRotativoCajaSocial = (numeroCuenta) => {
  const numeroCuentaCut = numeroCuenta.slice(0, 15);
  let conteo = 0;
  let sumTotal = 0;
  const arrayVali = [2, 1];
  for (let index = 0; index < numeroCuentaCut.length; index++) {
    if (conteo === 2) conteo = 0;
    const numeroCuentaIndividual = parseInt(numeroCuentaCut[index]);
    let resultMulti = numeroCuentaIndividual * arrayVali[conteo];
    console.log("1", resultMulti);
    if (resultMulti > 9) {
      const firstDigit = parseInt(Math.floor(resultMulti / 10));
      console.log("2", firstDigit);
      const secondDigit = parseInt(resultMulti - 10 * firstDigit);
      console.log("3", secondDigit);
      resultMulti = firstDigit + secondDigit;
    }
    console.log("4", resultMulti);
    sumTotal += resultMulti;
    conteo += 1;
  }
  console.log("8", sumTotal);
  const sumTotalResult = sumTotal % 10;
  console.log("casdsa", sumTotalResult);
  console.log("ccxzzzz", parseInt(numeroCuenta.slice(-1)));
  return sumTotalResult === parseInt(numeroCuenta.slice(-1));
};
