import express, { Application } from 'express';
import { startDatabase } from './database';
import {
	createDeveloper,
	createDeveloperInfo,
	deleteDeveloper,
	listAllDevelopers,
	listDeveloper,
	listDeveloperProjects,
	updateDeveloper,
	updateDeveloperInfo,
} from './functions/developers';
import {
	createProject,
	createProjectTechnology,
	deleteProject,
	deleteProjectTechnology,
	listAllProjects,
	listProject,
	updateProject,
} from './functions/projects';
import { verifyDeveloperExists, ensureDeveloperExists, ensureProjectExists, verifyDeveloperInfoExists, ensureDeveloperIdExists, verifyTechnologyExists } from './middlewares';

const app: Application = express();
app.use(express.json());

// ALL ROUTES:

// /developers
app.post('/developers', verifyDeveloperExists, createDeveloper);

app.get('/developers/:id',ensureDeveloperExists, listDeveloper);
app.get('/developers/:id/projects',ensureDeveloperExists, listDeveloperProjects);
app.get('/developers', listAllDevelopers);

app.patch('/developers/:id', ensureDeveloperExists, updateDeveloper);
app.delete('/developers/:id', ensureDeveloperExists, deleteDeveloper);

app.post('/developers/:id/infos', ensureDeveloperExists, verifyDeveloperInfoExists, createDeveloperInfo);
app.patch('/developers/:id/infos', ensureDeveloperExists, updateDeveloperInfo);

// /projects
app.post('/projects', ensureDeveloperIdExists, createProject);

app.get('/projects/:id', ensureProjectExists, listProject);
app.get('/projects', listAllProjects);

app.patch('/projects/:id', ensureProjectExists, updateProject);
app.delete('/projects/:id', ensureProjectExists, deleteProject);

app.post('/projects/:id/technologies', verifyTechnologyExists, ensureProjectExists, createProjectTechnology);
app.delete('/projects/:id/technologies/:name', ensureProjectExists, deleteProjectTechnology);

// APP LISTEN:

app.listen(3000, async () => {
	await startDatabase();
	console.log('Server is running!');
});
