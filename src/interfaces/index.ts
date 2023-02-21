export interface iOperationalSystem {
	Linux: string;
	Windows: string;
	MacOS: string;
}

export interface iDeveloperDataRequest {
	name: string;
	email: string;
	developerInfoId?: iDeveloperInfo;
}

export interface iDeveloperDataResponse extends iDeveloperDataRequest {
	id: number;
}

export interface iDeveloperInfo {
	id: number;
	developerSince: string;
	preferredOS: string;
}

export interface iDeveloperInfosRequest {
	developerSince: string;
	preferredOS: string;
}

export interface iDeveloperInfosResponse extends iDeveloperInfosRequest {
	id: number;
}

export interface iProjectDataRequest {
	name: string;
	description: string;
	estimatedTime: string;
	repository: string;
	startDate: string;
	endDate?: string;
	developerId: number;
}

export interface iProjectDataResponse extends iProjectDataRequest {
	id: number;
}
