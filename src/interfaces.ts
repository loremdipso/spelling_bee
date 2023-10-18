export interface IPlayer {
	name: string;
	words: IWord[];
}

export interface IWord {
	text: string;
	correct?: boolean;
}
