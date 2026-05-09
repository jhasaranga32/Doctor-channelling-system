const blockedDates = ["2026-06-03", "2026-06-04"];
const dateToTest = new Date("2026-06-03T12:00:00"); // A noon time on that day
const y = dateToTest.getFullYear();
const m = String(dateToTest.getMonth() + 1).padStart(2, '0');
const d = String(dateToTest.getDate()).padStart(2, '0');
const formatted = `${y}-${m}-${d}`;
console.log(formatted);
console.log("Is blocked?", blockedDates.includes(formatted));
