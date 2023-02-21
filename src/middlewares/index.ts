import { NextFunction, Request, Response } from 'express';
import { QueryConfig, QueryResult } from 'pg';
import { client } from '../database';

export const verifyDeveloperExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const devEmail: string = req.body.email;

	const queryString: string = `SELECT * FROM developers WHERE email = $1;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [devEmail],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (queryResult.rowCount) {
		return res.status(409).json({
			message: 'Developer already exists!',
		});
	}

	return next();
};

export const ensureDeveloperExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const devId: string = req.params.id;

	const queryString: string = `SELECT * FROM developers WHERE id = $1;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [devId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (!queryResult.rowCount) {
		return res.status(404).json({
			message: 'Developer not found!',
		});
	}

	return next();
};

export const ensureProjectExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const projectId: string = req.params.id;

	const queryString: string = `SELECT * FROM projects WHERE id = $1;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [projectId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (!queryResult.rowCount) {
		return res.status(404).json({
			message: 'Project not found!',
		});
	}

	return next();
};

export const verifyDeveloperInfoExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const devId: string = req.params.id;

	const queryString: string = `SELECT * FROM developers WHERE id = $1;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [devId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (queryResult.rows[0].developerInfoId !== null) {
		return res.status(404).json({
			message: 'Developer Infos already exists!',
		});
	}

	return next();
};

export const ensureDeveloperIdExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const { developerId } = req.body;

	const queryString: string = `SELECT * FROM developers WHERE id = $1;`;

	const queryConfig: QueryConfig = {
		text: queryString,
		values: [developerId],
	};

	const queryResult: QueryResult = await client.query(queryConfig);

	if (!queryResult.rowCount) {
		return res.status(404).json({
			message: 'Developer not found!',
		});
	}

	return next();
};

export const verifyTechnologyExists = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	const { name } = req.body;

	if (!name) {
		return res.status(400).json({
			message:
				'The key name is required! Remember that the tecnologies accepted are JavaScript, Python, React, Express.js, HTML, CSS, Django, PostgreSQL and MongoDB.',
		});
	}

    const queryString: string = `SELECT * FROM technologies WHERE "name" = $1;`

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [name]
    }

    const queryResult: QueryResult = await client.query(queryConfig)

    if (!queryResult.rows[0]) {
        return res.status(400).json({
            message: 'The tecnologies accepted are JavaScript, Python, React, Express.js, HTML, CSS, Django, PostgreSQL and MongoDB.'
        })
    }
    
	return next();
};
