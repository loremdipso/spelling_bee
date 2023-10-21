// based off https://stackoverflow.com/a/33542499
export function saveDataToFile(filename: string, data: string) {
	const blob = new Blob([data], { type: "text/json" });
	const elem = window.document.createElement("a");
	elem.href = window.URL.createObjectURL(blob);
	elem.download = filename;
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}

export function shuffleArray<T>(array: T[]) {
	const result = [],
		itemsLeft = array.concat([]);

	while (itemsLeft.length) {
		const randomIndex = Math.floor(Math.random() * itemsLeft.length);
		const [randomItem] = itemsLeft.splice(randomIndex, 1); // take out a random item from itemsLeft
		result.push(randomItem); // ...and add it to the result
	}

	return result;
}
