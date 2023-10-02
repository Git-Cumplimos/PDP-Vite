import { notifyError } from "../../../utils/notify";

const transformData = (data) => {
  if (String(data).length >= 2) return String(data)
  else return `0${String(data)}`
}

export const validateDates = (searchDate) => {
  
  let limitMin = new Date()
  let limitMax = new Date()
  limitMin.setDate(limitMin.getDate() - 7)
  limitMax.setDate(limitMax.getDate() + 1)
  limitMin = `${limitMin.getFullYear()}-${transformData(limitMin.getMonth() + 1)}-${transformData(limitMin.getDate())}`
  limitMax = `${limitMax.getFullYear()}-${transformData(limitMax.getMonth() + 1)}-${transformData(limitMax.getDate())}`
  let error = false
  if (searchDate >= limitMax) {
    error = true;
    notifyError("La fecha máxima es el día actual") 
  }
  if (searchDate < limitMin) { 
    error = true; 
    notifyError("La fecha mínima es una semana atrás") 
  }

  return error ? false : true
}