# Udagram To Do Application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

The project is split into two parts:
1. The `client` folder contains a web application that can use the API.
2. Backend Serverless API (Using AWS Services)

## Getting Started
> _tip_: it's recommended that you start with getting the backend API running since the frontend web application depends on the API.


# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.
