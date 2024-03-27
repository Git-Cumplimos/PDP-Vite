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
    if (resultMulti > 9) {
      const firstDigit = parseInt(Math.floor(resultMulti / 10));
      const secondDigit = parseInt(resultMulti - 10 * firstDigit);
      resultMulti = firstDigit + secondDigit;
    }
    sumTotal += resultMulti;
    conteo += 1;
  }
  const nextValue = Math.ceil(sumTotal / 10) * 10;
  const sumTotalResult = nextValue - sumTotal;
  return sumTotalResult === parseInt(numeroCuenta.slice(-1));
};

export const algoCheckTarjetaCreditoBinCajaSocial = (numeroCuenta) => {
  const numeroCuentaCut = numeroCuenta.slice(0, 6);
  const dataBinValidacion = ["549166", "457021"];
  return dataBinValidacion.find((data) => data === numeroCuentaCut);
};
