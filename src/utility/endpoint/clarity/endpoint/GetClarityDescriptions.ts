import ClarityEndpoint from "utility/endpoint/clarity/ClarityEndpoint";

export interface ClarityDescriptionTextComponent {
	text: string;
	linesContent?: undefined;
	classNames?: string[];
}

export interface ClarityDescriptionLineComponent {
	text?: undefined;
	linesContent: ClarityDescriptionComponent[];
	classNames?: string[];
}

export type ClarityDescriptionComponent = ClarityDescriptionTextComponent | ClarityDescriptionLineComponent;

export interface ClarityDescription {
	hash: number;
	name: string;
	lastUpload: number;
	type: string;
	uploadedBy: string;
	descriptions: Record<string, string | ClarityDescriptionComponent[]>;
}

export default new ClarityEndpoint<Record<number, ClarityDescription>>("descriptions/clarity.json");
