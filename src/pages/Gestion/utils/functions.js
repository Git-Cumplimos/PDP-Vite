import { notifyError } from "../../../utils/notify";

export const validateDates = (searchDate) => {
    
    let limitMin = new Date()
    let limitMax = new Date()
    limitMin.setDate(limitMin.getDate() - 7)
    limitMax.setDate(limitMax.getDate() + 1)
    let month = String(limitMin.getMonth()+1).length > 2 ? limitMin.getMonth()+1 : `0${limitMin.getMonth()+1}`
    limitMin = `${limitMin.getFullYear()}-${month}-${limitMin.getDate()}`
    limitMax = `${limitMax.getFullYear()}-${month}-${limitMax.getDate()}`
    let error = false
    if (searchDate >= limitMax){error = true;notifyError("La fecha máxima es el día actual")}
    if (searchDate < limitMin) {error = true;notifyError("La fecha mínima es una semana atrás")}

    return error ? false:true
  }