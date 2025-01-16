import { DateTime } from "luxon";

export const formatDate = () => {
    const now = DateTime.now();
    return {
        applicationDate: now.toISO()!,
        applicationYear: now.year
    };
}

export const formatDateForDisplay = (date: string) => {
    const dateTime = DateTime.fromISO(date);
    return dateTime.toFormat('dd/MM/yyyy');
}

export const formatDateForISO = (date: string) => {
    const dateTime = DateTime.fromFormat(date, 'dd/MM/yyyy').plus({ days: 1 });
    return dateTime.toISO();
}