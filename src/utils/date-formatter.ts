const timeSchema = new Intl.DateTimeFormat("en-US", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

const dateSchema = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const fullDateSchema = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

const weekdaySchema = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
});

export function toDate(input: number | Date | unknown): Date | null {
	if (!input) return null;

	if (typeof input === "object" && input !== null) {
		if ("toMillis" in input && typeof (input as { toMillis: () => number }).toMillis === "function") {
			return new Date((input as { toMillis: () => number }).toMillis());
		}
		if ("seconds" in input && typeof (input as { seconds: number }).seconds === "number") {
			return new Date((input as { seconds: number }).seconds * 1000);
		}
		if (input instanceof Date) {
			return isNaN(input.getTime()) ? null : input;
		}
	}

	if (typeof input === "number" || typeof input === "string") {
		const d = new Date(input);
		return isNaN(d.getTime()) ? null : d;
	}

	return null;
}

export function formatMessageTime(input: number | Date | unknown): string {
	const dateObj = toDate(input);
	if (!dateObj) return "";
	return timeSchema.format(dateObj);
}

export function formatDayDivider(input: number | Date | unknown): string {
	const dateObj = toDate(input);
	if (!dateObj) return "";

	const today = new Date();
	const isToday =
		today.getDate() === dateObj.getDate() && today.getMonth() === dateObj.getMonth() && today.getFullYear() === dateObj.getFullYear();
	if (isToday) return "Today";

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const isYesterday =
		yesterday.getDate() === dateObj.getDate() &&
		yesterday.getMonth() === dateObj.getMonth() &&
		yesterday.getFullYear() === dateObj.getFullYear();
	if (isYesterday) return "Yesterday";

	const diffDays = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
	if (diffDays > 0 && diffDays < 7) {
		return weekdaySchema.format(dateObj);
	}

	return fullDateSchema.format(dateObj);
}

export function getDayKey(input: number | Date | unknown): string {
	const dateObj = toDate(input);
	if (!dateObj) return "";
	return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
}

export function formatDate(input: number | Date | unknown): string {
	const dateObj = toDate(input);
	if (!dateObj) return "";

	const today = new Date();
	const isSameDay =
		today.getDate() === dateObj.getDate() && today.getMonth() === dateObj.getMonth() && today.getFullYear() === dateObj.getFullYear();

	const time = timeSchema.format(dateObj);

	if (isSameDay) {
		return `Today at ${time}`;
	}
	const date = dateSchema.format(dateObj);
	return `${date}, ${time}`;
}

export default formatDate;
