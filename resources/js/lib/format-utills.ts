// export function formatNumberWithCommas(number: number, toFixed?: boolean) {
//     if (toFixed) {
//         return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     }
//     return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }
export function cleanDecimalNumber(val: any, maxDecimals: number = 6): any {
    if (val === null || val === undefined || val === '') return val;
    const str = typeof val === 'string' ? val.replace(/,/g, '').trim() : String(val);
    if (str === '-' || str === '') return val;
    const num = Number(str);
    if (isNaN(num)) return val;

    // Round safely to at most maxDecimals decimal places using scientific notation to prevent float precision quirks
    const rounded = Number(Math.round(Number(num + 'e+' + maxDecimals)) + 'e-' + maxDecimals);
    return rounded;
}

export function formatNumberWithCommas(
    val: string | number | null | undefined,
    cleanDecimals: boolean = false,
    maxDecimals: number = 6
): string {
    if (val === null || val === undefined || val === '') return '';
    let str = typeof val === 'string' ? val.replace(/,/g, '').trim() : val.toString();
    if (str === '-') return '-';

    if (cleanDecimals) {
        const cleaned = cleanDecimalNumber(str, maxDecimals);
        if (typeof cleaned === 'number') {
            str = cleaned.toString();
        }
    }

    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}