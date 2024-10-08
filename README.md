# QuestKeeper Microservice Template

This repository serves the purpose of increasing development time for microservices. Microservices are written in Typescript and deployed on Clouflare Workers through Wrangler.
We are using HonoJS for the web framework. Refer to hono docs [here](https://hono.dev/docs/)

## Requirements

- Node LTS (20.10.0 as of right now)
- pnpm
- Cloudflare account (if you're deploying from your machine)
- vitest extension on VSCode

If you don't have pnpm head to [pnpm.io](https://pnpm.io/installation)

## Running

```
pnpm install
pnpm dev
```

To deploy to the Cloudflare Worker, you will need authorization.

```
pnpm deploy
```

## Accessing the service

Generally, the service will be launched locally at port [8787](http://localhost:8787)
You'll be able to access the SwaggerUI at `/v1/{baseEndpointName}/ui`

Some endpoints are protected, and will require an API key with the `x-api-key` header. This is dependent on where the routes are placed for the middleware.

## Env

In development, there is a `.dev.vars` file that should be used. Here are the basic development environment variables:

| Key          | Value                           |
| ------------ | ------------------------------- |
| SUPABASE_URL | "https://projectId.supabase.co" |
| SUPABASE_KEY | "eyJ..."                        |
| API_KEY      | "super-secret-key"              |

## Testing

We are using [vitest](https://vitest.dev/guide/) as the testing framework. Testing is hard, but just write em (this is as much for me as it is for whoever is reading this)!

Remember to mock the environment variables
