import { format, parse, isValid as isValidDate } from "date-fns";
import { faker } from "@faker-js/faker";

export const CODING_VIOLATION_KEYWORD =
  "UNIFIED VEHICLE VOLUME REDUCTION PROGRAM";
export const ALL_DIGITS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
export const CODING_DAY_MAP: Record<
  string,
  { digits: string[]; label: string }
> = {
  Monday: { digits: ["1", "2"], label: "Monday" },
  Tuesday: { digits: ["3", "4"], label: "Tuesday" },
  Wednesday: { digits: ["5", "6"], label: "Wednesday" },
  Thursday: { digits: ["7", "8"], label: "Thursday" },
  Friday: { digits: ["9", "0"], label: "Friday" },
};
export const CODING_HOURS_LABEL = "7:00 AM - 10:00 AM and 5:00 PM - 8:00 PM";
export const CODING_DATE_FORMAT = "PP, hh:mm:ss a";

export interface ValidateCodingViolationArgs {
  violationName?: string | null;
  plateNumber?: string | null;
  violatedAt?: string | null;
}

export interface ValidateCodingViolationResult {
  isValid: boolean;
  message?: string;
}

export const getLastDigit = (plateNumber?: string | null) => {
  if (!plateNumber) return null;
  const digits = plateNumber.match(/\d/g);
  if (!digits || !digits.length) return null;
  return digits[digits.length - 1];
};

export const getCodingDayByDigit = (digit: string | null) => {
  if (!digit) return null;
  const entry = Object.values(CODING_DAY_MAP).find(({ digits }) =>
    digits.includes(digit)
  );
  return entry?.label ?? null;
};

export const isWithinCodingHours = (date: Date) => {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const morningStart = 7 * 60;
  const morningEnd = 10 * 60;
  const eveningStart = 17 * 60;
  const eveningEnd = 20 * 60;
  const inMorning = totalMinutes >= morningStart && totalMinutes <= morningEnd;
  const inEvening = totalMinutes >= eveningStart && totalMinutes <= eveningEnd;
  return inMorning || inEvening;
};

export const validateCodingViolation = ({
  violationName,
  plateNumber,
  violatedAt,
}: ValidateCodingViolationArgs): ValidateCodingViolationResult => {
  if (
    !violationName ||
    !violationName.toUpperCase().includes(CODING_VIOLATION_KEYWORD)
  ) {
    return { isValid: true };
  }
  if (!violatedAt) {
    return { isValid: true };
  }
  const lastDigit = getLastDigit(plateNumber);
  const codingDay = getCodingDayByDigit(lastDigit);
  if (!codingDay) {
    return { isValid: true };
  }
  const parsedDate = parse(violatedAt, CODING_DATE_FORMAT, new Date());
  if (!isValidDate(parsedDate)) {
    return { isValid: true };
  }
  const recordedDay = format(parsedDate, "EEEE");
  const recordedTime = format(parsedDate, "hh:mm a");
  if (recordedDay !== codingDay) {
    return {
      isValid: false,
      message: `Plate ${
        plateNumber ?? "N/A"
      } ends in ${lastDigit}, which is not part of the coding in effect on ${recordedDay}.`,
    };
  }
  if (!isWithinCodingHours(parsedDate)) {
    return {
      isValid: false,
      message: `Plate ${
        plateNumber ?? "N/A"
      } was recorded on ${recordedDay} at ${recordedTime}, which is outside the coding hours (${CODING_HOURS_LABEL}).`,
    };
  }
  return { isValid: true };
};

export const pickDigitNotUsedForDay = (day: string | null) => {
  const blockedDigits = day ? CODING_DAY_MAP[day]?.digits ?? [] : [];
  const availableDigits = ALL_DIGITS.filter(
    (digit) => !blockedDigits.includes(digit)
  );
  return faker.helpers.arrayElement(availableDigits);
};

export const replaceLastDigit = (plate: string, replacementDigit: string) => {
  const withReplacement = plate.replace(/(\d)(?!.*\d)/, replacementDigit);
  if (withReplacement !== plate) {
    return withReplacement;
  }
  return `${plate}${replacementDigit}`;
};
