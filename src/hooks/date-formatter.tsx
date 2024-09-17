const timeSchema = new Intl.DateTimeFormat("en-gb", {
	hour: "numeric",
	minute: "2-digit",
	hour12: true
});

const dateSchema = new Intl.DateTimeFormat("en-gb", {
	day: "numeric",
	month: "short",
	year: "numeric"
});

export default function useDate(input: number | Date) {
	const today = new Date();
	const inputDate = new Date(input);

	const date = dateSchema.format(input);
	const time = timeSchema.format(input).toLocaleUpperCase();

	if (today.getDate() === inputDate.getDate()) {
		return `Today at ${time}`;
	}
	return `${date}, ${time}`;
}
