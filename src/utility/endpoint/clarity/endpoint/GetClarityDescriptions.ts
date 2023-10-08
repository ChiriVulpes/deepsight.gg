import ClarityEndpoint from "utility/endpoint/clarity/ClarityEndpoint";

export interface ClarityDescriptionTextComponent {
	text: string;
	linesContent?: undefined;
	table?: undefined;
	classNames?: string[];
	formula?: string;
}

export interface ClarityDescriptionLineComponent {
	text?: undefined;
	linesContent: ClarityDescriptionComponent[];
	table?: undefined;
	classNames?: string[];
	formula?: undefined;
}

export interface ClarityDescriptionTableCell {
	cellContent: string | ClarityDescriptionComponent[];
	classNames?: string[];
}

export interface ClarityDescriptionTableRow {
	rowContent: ClarityDescriptionTableCell[];
	classNames?: string[];
}

export interface ClarityDescriptionTableComponent {
	text?: undefined;
	linesContent?: undefined;
	table: ClarityDescriptionTableRow[];
	classNames?: string[];
	isFormula: boolean;
	formula?: undefined;
}

export interface ClarityDescriptionStatValues {
	stat?: number[];
	multiplier?: number[];
}

export interface ClarityDescriptionStat {
	active?: ClarityDescriptionStatValues;
	passive?: ClarityDescriptionStatValues;
	weaponTypes?: string[];
}

export type ClarityDescriptionComponent = ClarityDescriptionTextComponent | ClarityDescriptionLineComponent | ClarityDescriptionTableComponent;

export interface ClarityDescription {
	hash: number;
	name: string;
	itemHash?: number;
	itemName?: string;
	lastUpload: number;
	stats?: Record<string, ClarityDescriptionStat[]>;
	type: string;
	uploadedBy: string;
	descriptions: Record<string, string | ClarityDescriptionComponent[]>;
}

export default new ClarityEndpoint<Record<number, ClarityDescription>>("descriptions/clarity.json");
