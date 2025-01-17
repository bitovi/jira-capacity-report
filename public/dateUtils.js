
function getQuarter(date) {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
}

function getYear(date) {
    return date.getFullYear();
}

export function getStartOfThisQuarter(date) {
    const quarter = getQuarter(date);
    const year = getYear(date);
    return new Date(year, (quarter - 1) * 3, 1);
}

export function getEndOfThisQuarter(date) {
    const quarter = getQuarter(date);
    const year = getYear(date);
    return new Date(year, quarter * 3, 0);
}

export function getStartOfNextQuarter(date) {
    const quarter = getQuarter(date);
    const year = getYear(date);
    if (quarter === 4) {
        return new Date(year + 1, 0, 1);
    } else {
        return new Date(year, quarter * 3, 1);
    }
}

export function getEndOfNextQuarter(date) {
    const quarter = getQuarter(date);
    const year = getYear(date);
    if (quarter === 4) {
        return new Date(year + 1, 3, 31);
    } else {
        return new Date(year, quarter * 3 + 2, 31);
    }
}