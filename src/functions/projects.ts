import { Request, Response } from 'express';
import { QueryConfig, QueryResult } from 'pg';
import format from 'pg-format';
import { client } from '../database';
import { iProjectDataRequest } from '../interfaces';

// POST--
export const createProject = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const {
		name,
		description,
		estimatedTime,
		repository,
		startDate,
		endDate,
		developerId,
	} = req.body;

	const projectData: iProjectDataRequest = {
		name,
		description,
		estimatedTime,
		repository,
		startDate,
		endDate,
		developerId,
	};

	if (
		typeof projectData.name !== 'string' ||
		typeof projectData.description !== 'string' ||
		typeof projectData.estimatedTime !== 'string' ||
		typeof projectData.repository !== 'string' ||
		typeof projectData.startDate !== 'string' ||
		typeof projectData.developerId !== 'number'
	) {
		return res.status(400).json({
			message:
				'name, description, estimatedTime, repository, startDate and developerId are required keys! endDate is a optional key.',
		});
	}

	const queryString: string = format(
		`INSERT INTO projects(%I) VALUES (%L) RETURNING *;`,
		Object.keys(projectData),
		Object.values(projectData)
	);

	const queryResult: QueryResult = await client.query(queryString);

	return res.status(201).json(queryResult.rows[0]);
};

// GET--
export const listProject = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const projectId: string = req.params.id;

	const queryString: string = `
    SELECT 
        pj."id" AS "projectId", pj."name", pj."description", pj."estimatedTime", pj."repository", pj."startDate", pj."endDate", pj."developerId",
        pt."addedIn" AS "techAddedIn",
        string_agg(CAST(pt."technologyId" AS TEXT), ', ') AS "technologyIds",
        string_agg(te."name", ', ') AS "technologyNames"
    FROM
        projects pj
    LEFT JOIN
        projects_technologies pt ON pj."id" = pt."projectId"
    LEFT JOIN
        technologies te ON pt."technologyId" = te."id"
    WHERE
        pj."id" = $1
    GROUP BY
        pj."id", pt."addedIn"; 
    `;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [projectId],
	};
	const queryResult: QueryResult = await client.query(queryConfig);

	return res.status(200).json(queryResult.rows[0]);
};

// GET--
export const listAllProjects = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const queryString: string = `
    SELECT 
        pj."id" AS "projectId", pj."name", pj."description", pj."estimatedTime", pj."repository", pj."startDate", pj."endDate", pj."developerId",
        pt."addedIn" AS "techAddedIn",
        string_agg(CAST(pt."technologyId" AS TEXT), ', ') AS "technologyIds",
        string_agg(te."name", ', ') AS "technologyNames"
    FROM
        projects pj
    LEFT JOIN
        projects_technologies pt ON pj."id" = pt."projectId"
    LEFT JOIN
        technologies te ON pt."technologyId" = te."id"
    GROUP BY
        pj."id", pt."addedIn";
    `;

	const queryResult: QueryResult = await client.query(queryString);

	return res.status(200).json(queryResult.rows);
};

// PATCH
export const updateProject = async (
	req: Request,
	res: Response
): Promise<Response> => {
	return res.status(200);
};

// DELETE
export const deleteProject = async (
	req: Request,
	res: Response
): Promise<Response> => {
	return res.status(204);
};

// POST--
export const createProjectTechnology = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const { id: projectId } = req.params;
	const { name } = req.body;

	let queryString: string = `SELECT * FROM technologies WHERE "name" = $1;`;

	let queryConfig: QueryConfig = {
		text: queryString,
		values: [name],
	};

	let queryResult: QueryResult = await client.query(queryConfig);

	const techId = queryResult.rows[0].id;

    queryString = `INSERT INTO projects_technologies ("addedIn", "projectId", "technologyId") VALUES (NOW(), $1, $2)`

    queryConfig = {
        text: queryString,
        values: [projectId, techId]
    }

    await client.query(queryConfig)

    queryString = `
    SELECT 
        pj."id" AS "projectId", pj."name", pj."description", pj."estimatedTime", pj."repository", pj."startDate", pj."endDate",
        pt."addedIn" AS "techAddedIn",
        string_agg(CAST(pt."technologyId" AS TEXT), ', ') AS "technologyIds",
        string_agg(te."name", ', ') AS "technologyNames"
    FROM
        projects pj
    JOIN
        projects_technologies pt ON pj."id" = pt."projectId"
    JOIN
        technologies te ON pt."technologyId" = te."id"
    WHERE
        pj."id" = $1
    GROUP BY
        pj."id", pt."addedIn";  
    `;

    queryConfig = {
		text: queryString,
		values: [projectId],
	};

    queryResult = await client.query(queryConfig)

	return res.status(201).json(queryResult.rows[0]);
};

// DELETE
export const deleteProjectTechnology = async (
	req: Request,
	res: Response
): Promise<Response> => {
	return res.status(204);
};
