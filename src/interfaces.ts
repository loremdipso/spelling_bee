export interface IPlayer {
	name: string;
	words: IWord[];
	disallowed_words: string[];
}

export interface IWord {
	text: string;
	correct?: boolean;
}
