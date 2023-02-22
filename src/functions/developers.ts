import { Request, Response } from 'express';
import { QueryConfig, QueryResult } from 'pg';
import format from 'pg-format';
import { client } from '../database';
import { iDeveloperDataRequest, iDeveloperInfosRequest } from '../interfaces';

export const createDeveloper = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { name, email } = req.body;
	const developerData: iDeveloperDataRequest = { name, email };

	if (
		typeof developerData.name !== 'string' ||
		typeof developerData.email !== 'string'
	) {
		return res.status(400).json({
			message: 'Name and Email are required keys!',
		});
	}

	const queryString: string = format(
		`INSERT INTO developers(%I) VALUES (%L) RETURNING *;`,
		Object.keys(developerData),
		Object.values(developerData)
	);

	const queryResult: QueryResult = await client.query(queryString);

	return res.status(201).json(queryResult.rows[0]);
};

export const listDeveloper = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const devId: string = req.params.id;

	const queryString: string = `
    SELECT
        dv."id", dv."name", dv."email", dv."developerInfoId", di."developerSince", di."preferredOS"
    FROM
        developers dv
    LEFT JOIN
        developer_infos di ON dv."developerInfoId" = di.id
    WHERE
        dv.id = $1;
    `;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [devId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	return res.status(200).json(queryResult.rows[0]);
};

export const listDeveloperProjects = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { id } = req.params;

	const queryString: string = `
    SELECT 
        dv."id" AS "developerId", dv."name", dv."email", dv."developerInfoId",
        di."developerSince", di."preferredOS",
        pj."id" AS "projectId", pj."name", pj."description", pj."estimatedTime", pj."repository", pj."startDate", pj."endDate",
        pt."addedIn" AS "techAddedIn",
        string_agg(CAST(pt."technologyId" AS TEXT), ', ') AS "technologyIds",
        string_agg(te."name", ', ') AS "technologyNames"
    FROM
        projects pj
    JOIN
        developers dv ON pj."developerId" = dv.id
    LEFT JOIN
        projects_technologies pt ON pj."id" = pt."projectId"
    LEFT JOIN
        technologies te ON pt."technologyId" = te."id"
    LEFT JOIN 
        developer_infos di ON di."id" = dv."developerInfoId"
    WHERE
        dv.id = $1
    GROUP BY
    	pj."id", pt."addedIn", dv."id", di."developerSince", di."preferredOS";`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [id],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (!queryResult.rowCount) {
		return res.status(404).json({
			message: `This developer doesn't have projects!`,
		});
	}

	return res.status(200).json(queryResult.rows);
};

export const listAllDevelopers = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const queryString: string = `
    SELECT
        dv."id", dv."name", dv."email", dv."developerInfoId", di."developerSince", di."preferredOS"
    FROM
        developers dv
    LEFT JOIN
        developer_infos di ON dv.id = di.id;
    `;

	const queryResult: QueryResult = await client.query(queryString);

	return res.status(200).json(queryResult.rows);
};

export const updateDeveloper = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { id: devId } = req.params;
	const { name, email } = req.body;

	if (typeof email === 'string') {
		return res.status(400).json({
			message: `Email conflict! Email key isn't allowed to update.`,
		});
	}

	if (typeof name !== 'string') {
		return res.status(400).json({
			message: `The key 'name' is required!`,
		});
	}

	const queryConfig: QueryConfig = {
		text: `UPDATE developers SET "name" = $1 WHERE "id" = $2 RETURNING *;`,
		values: [name, devId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	return res.status(200).json(queryResult.rows[0]);
};

export const deleteDeveloper = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { id: devId } = req.params;

	const queryString: string = `
	WITH deleted_projects_technologies AS (
	    DELETE FROM "projects_technologies"
	    WHERE "projectId" IN (
	        SELECT "id" FROM "projects" WHERE "developerId" = $1
	    )RETURNING *
	),
	deleted_projects AS (DELETE FROM "projects" WHERE "developerId" = $2 RETURNING *),
	deleted_developer_info AS (
		DELETE FROM "developer_infos" WHERE "id" = (
			SELECT "developerInfoId" FROM "developers" WHERE "id" = $3)
		RETURNING *)
	DELETE FROM "developers" WHERE "id" = $4;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [devId, devId, devId, devId],
	};

	await client.query(queryConfig);

	return res.status(204).send();
};

export const createDeveloperInfo = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { developerSince, preferredOS } = req.body;
	const developerInfoDataRequest: iDeveloperInfosRequest = {
		developerSince,
		preferredOS,
	};

	if (
		preferredOS !== 'Linux' &&
		preferredOS !== 'Windows' &&
		preferredOS !== 'MacOS'
	) {
		return res.status(400).json({
			message:
				'Acceptable values for key preferredOS are: Windows, Linux and MacOS!',
		});
	}

	if (
		typeof developerInfoDataRequest.developerSince !== 'string' ||
		typeof developerInfoDataRequest.preferredOS !== 'string'
	) {
		return res.status(400).json({
			message: 'developerSince and preferredOS are required keys!',
		});
	}

	let queryString: string = format(
		`INSERT INTO developer_infos(%I) VALUES(%L) RETURNING *`,
		Object.keys(developerInfoDataRequest),
		Object.values(developerInfoDataRequest)
	);

	let queryResult: QueryResult = await client.query(queryString);

	const devInfoId: number = parseInt(queryResult.rows[0].id);

	const devId: number = parseInt(req.params.id);

	const developerInfoData = queryResult.rows[0];

	queryString = `UPDATE developers SET "developerInfoId" = ${devInfoId} WHERE id = ${devId} RETURNING *`;

	queryResult = await client.query(queryString);

	let queryResultString = queryResult;

	console.log(queryResultString);

	queryResultString.rows[0].developerInfoId = developerInfoData;

	return res.status(201).json(queryResultString.rows[0]);
};

export const updateDeveloperInfo = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { id: devId } = req.params;
	const { preferredOS } = req.body;

	if (
		preferredOS !== 'Linux' &&
		preferredOS !== 'Windows' &&
		preferredOS !== 'MacOS'
	) {
		return res.status(400).json({
			message:
				'Acceptable values for key preferredOS are: Windows, Linux and MacOS!',
		});
	}

	if (typeof preferredOS !== 'string') {
		return res.status(400).json({
			message: 'preferredOS is a required key!',
		});
	}

	const queryConfig: QueryConfig = {
		text: `SELECT * FROM developer_infos di JOIN developers dv ON dv."developerInfoId" = di."id" WHERE dv.id = $1;`,
		values: [devId],
	};

	const result: QueryResult = await client.query(queryConfig);

	if (!result.rowCount) {
		return res.status(400).json({
			message: `This developer doesn't have extra information registered!`,
		});
	}

	const devInfoId = result.rows[0].id;

	const queryString: QueryConfig = {
		text: `UPDATE developer_infos SET "preferredOS" = $1 WHERE "id" = $2 RETURNING *;`,
		values: [preferredOS, devInfoId],
	};

	const queryResult = await client.query(queryString);

	return res.status(200).json(queryResult.rows[0]);
};
