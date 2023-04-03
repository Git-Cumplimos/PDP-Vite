import { useCallback, useMemo } from "react";
import { makeMoneyFormatter, moneyValidator } from "../../../utils/functions";
import Input from "../../../components/Base/Input";


const filterExtraDigit = (data, digits = 0) => {
    const arr = data.split(/,/);
    if (arr.length < 2) {
        return data;
    }
    if (arr[1].length < 1) {
        return data;
    }

    return `${arr[0]},${arr[1].substring(0, digits)}`;
};

const useMoney = ({
    limits = [0, 10000000],
    equalError = 1,
    decimalDigits = 0,
}) => {
    const onChangeMoney = useCallback(
        (ev) => {
            console.log(equalError)

            const moneyFormatter = makeMoneyFormatter(decimalDigits);

            let caret_pos = ev.target.selectionStart ?? 0;

            const len = filterExtraDigit(ev.target.value, decimalDigits).length;

            const moneyValue =
                Math.round(
                    moneyValidator(ev.target.value) * Math.pow(10, decimalDigits)
                ) / Math.pow(10, decimalDigits);

            const [min, max] = limits;
            if (equalError === 1 && (moneyValue !== min)) {
                ev.target.setCustomValidity(
                    `El valor debe ser igual a ${moneyFormatter.format(min)}`
                );
            }
            else if (equalError === 2 && (moneyValue > max)) {
                ev.target.setCustomValidity(
                    `El valor debe ser menor o igual ${moneyFormatter.format(min)}`
                );
            }
            else if (equalError === 3 && (moneyValue < min)) {
                ev.target.setCustomValidity(
                    `El valor debe ser mayor o igual a ${moneyFormatter.format(min)}`
                );
            }
            else {
                ev.target.setCustomValidity("");
            }

            const toAdd =
                [",", "."].includes(ev.target.value.at(-1) ?? "") && decimalDigits
                    ? ","
                    : "";
            ev.target.value =
                moneyValue === 0 ? "$ 0" : moneyFormatter.format(moneyValue) + toAdd;

            ev.target.focus();
            caret_pos += ev.target.value.length - len;
            ev.target.setSelectionRange(caret_pos, caret_pos);

            return moneyValue;
        },
        [limits, decimalDigits, equalError]
    );
    return onChangeMoney;
};


export const formatMoney = makeMoneyFormatter(2);

const MoneyInput = ({ decimalDigits = 0, equalError = 1, ...input }) => {
    const inputLimits = useMemo(() => {
        const minVal = parseInt(input?.min) || 0;
        const maxVal = parseInt(input?.max) || 10000000;
        delete input.min;
        delete input.max;

        return [minVal, maxVal];
    }, [input?.min, input?.max]);

    const onChangeMoney = useMoney({
        limits: inputLimits,
        decimalDigits,
        equalError,
    });

    const localFormatMoney = useMemo(
        () => makeMoneyFormatter(decimalDigits),
        [decimalDigits]
    );

    const onInput = useCallback(
        (e) => {
            const inpFcn = input?.onInput;
            const chgFcn = input?.onChange;
            const value = onChangeMoney(e);
            inpFcn?.(e, value);
            chgFcn?.(e, value);
        },
        [input?.onChange, input?.onInput, onChangeMoney]
    );

    const dynamicProps = useMemo(() => {
        const _props = new Map([
            ["type", "tel"]
        ]);
        if (input?.value !== undefined) {
            const moneyValue = moneyValidator(`${input?.value ?? ""}`);
            _props.set("value", moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue));
        }
        if (input?.defaultValue !== undefined) {
            const moneyValue = moneyValidator(`${input?.value ?? ""}`);
            _props.set("value", moneyValue === "" ? "$ " : localFormatMoney.format(moneyValue));
        }
        return Object.fromEntries(_props)
    }, [input?.value, input?.defaultValue, localFormatMoney])

    return <Input {...input} {...dynamicProps} onInput={onInput} />;
};

export default MoneyInput;
