CREATE DATABASE sprint3;

CREATE TYPE OS AS ENUM ('Windows', 'Linux', 'MacOS');

--DEVELOPER_INFOS
CREATE TABLE IF NOT EXISTS developer_infos(
	"id" SERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" OS NOT NULL
);

--DEVELOPERS
CREATE TABLE IF NOT EXISTS developers(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) NOT NULL UNIQUE,
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE
);

--PROJECTS
CREATE TABLE IF NOT EXISTS projects(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" VARCHAR(300) NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL,
	FOREIGN KEY ("developerId") REFERENCES developers("id")
);

--TECHNOLOGIES
CREATE TABLE IF NOT EXISTS technologies(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

--PROJECTS_TECHNOLOGIES
CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER NOT NULL,
	FOREIGN KEY ("projectId") REFERENCES projects("id") ON DELETE CASCADE,
	"technologyId" INTEGER NOT NULL,
	FOREIGN KEY ("technologyId") REFERENCES technologies("id")
);

--TECHNOLOGIES DEFAULT VALUES
INSERT INTO
	technologies("name")
VALUES
	('JavaScript'), ('Python'),	('React'), ('Express.js'), ('HTML'), ('CSS'), ('Django'), ('PostgreSQL'), ('MongoDB');