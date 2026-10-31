const timeSchema = new Intl.DateTimeFormat("en-gb", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

const dateSchema = new Intl.DateTimeFormat("en-gb", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

export function formatDate(input: number | Date | unknown): string {
	if (!input) return "";

	let dateObj: Date;
	if (typeof input === "object" && input !== null) {
		if ("toMillis" in input && typeof (input as { toMillis: () => number }).toMillis === "function") {
			dateObj = new Date((input as { toMillis: () => number }).toMillis());
		} else if ("seconds" in input && typeof (input as { seconds: number }).seconds === "number") {
			dateObj = new Date((input as { seconds: number }).seconds * 1000);
		} else if (input instanceof Date) {
			dateObj = input;
		} else {
			return "";
		}
	} else if (typeof input === "number" || typeof input === "string") {
		dateObj = new Date(input);
	} else {
		return "";
	}

	if (isNaN(dateObj.getTime())) return "";

	const today = new Date();
	const isSameDay =
		today.getDate() === dateObj.getDate() && today.getMonth() === dateObj.getMonth() && today.getFullYear() === dateObj.getFullYear();

	const time = timeSchema.format(dateObj).toLocaleUpperCase();

	if (isSameDay) {
		return `Today at ${time}`;
	}
	const date = dateSchema.format(dateObj);
	return `${date}, ${time}`;
}

export default formatDate;
