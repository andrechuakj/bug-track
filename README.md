# Bug Track MonoRepo

> ## CS3213 Team 10

## Online deployment

Link to online deployment: https://bug-track.projects.richarddominick.me/

## Setup NextJS application and dev environment

1. Navigate to the `apps/bug-analysis-web/` directory by running `cd apps/bug-analysis-web/`
1. Install dependencies and start the frontend development server with `yarn && yarn dev`
1. Create a `.env.local` file in the current directory and populate `NEXT_PUBLIC_API_URL` environment variable, for e.g. `NEXT_PUBLIC_API_URL=http://localhost:8000`
1. Ensure that prettier and eslint extensions on VSCode are installed
1. Set your default formatter to 'Prettier - Code formatter' and check the setting `Editor: Format on Save`
1. Try to shift the code around, to test the auto-formatting. Also try to trigger eslint errors to see if your IDE highlights them

## Setup PostgreSQL

> We assume that you have Docker installed on your machine. If not, please install it from [here](https://docs.docker.com/get-docker/). Alternatively, you can install PostgreSQL manually from [here](https://www.postgresql.org/download/).

PostgreSQL needs to be running for the backend to work.

1. Make sure you have Docker installed.

1. Run the following command:

   ```bash
   docker run -d -p 5432:5432 --name bugtrack-postgres -e POSTGRES_HOST_AUTH_METHOD=trust
   ```

   This binds the default port for PostgreSQL, 5432, of the container to port 5432 of your local machine, allowing you to access the database from your local machine.

   Note: `-e POSTGRES_HOST_AUTH_METHOD=trust` is used to disable password authentication for local development. This is not recommended for production, but since we are only accesing the database locally from our own machine, it is safe to do so.

1. That's it! You now have a PostgreSQL database running in a Docker container.

   You can connect to it using any PostgreSQL client (e.g. pgAdmin, DBeaver, etc.) using the following credentials:

   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (no password)

   In your backend environment variables (`.env.local`), set the `DATABASE_URL` variable to `postgresql://postgres@localhost:5432/postgres`.


1. Once you want to shut it down, run the following command to stop the docker container:

   ```bash
   docker stop bugtrack-postgres
   ```

1. To delete the container (alongside all its data), run the following command:

   ```bash
   docker rm bugtrack-postgres
   ```

## Setup Redis

> We assume that you have Docker installed on your machine. If not, please install it from [here](https://docs.docker.com/get-docker/). Alternatively, you can install Redis from [here](https://redis.io/docs/getting-started/installation/).

Redis needs to be running for the backend to work.

1. Make sure you have Docker installed.

1. Run the following command:
   ```bash
   docker run -d -p 6379:6379 --name bugtrack-redis redis
   ```

1. That's it! You now have a Redis server running in a Docker container.

   You can connect to it using any Redis client (e.g. Redis Desktop Manager, etc.) using the following credentials:

   - Host: `localhost`
   - Port: `6379`
   - Password: (no password)

   In your backend environment variables (`.env.local`), set the `REDIS_BROKER_URL` variable to `redis://localhost:6379/0`.

1. Once you want to shut it down, run the following command to stop the docker container:
   ```bash
   docker stop bugtrack-redis
   ```

1. To delete the container (alongside all its data), run the following command:
   ```bash
   docker rm bugtrack-redis
   ```

## Setup FastAPI

1. Navigate to `apps/api/` directory by running `cd apps/api/`
1. Run the following commands:

   ```bash
   python -m venv myenv
   source myenv/bin/activate
   pip install -r requirements.txt
   ```

   > On Windows, use WSL to run the commands above.

1. Create an `.env.local` file in the current directory and populate all environment variables. You may take reference from `.env.local.example`.
   - Set `MODE` to `development`.
   - Set `JWT_SECRET_KEY` to any string of your choosing (eg randomly generated). Do not share this.
   - Set `DATABASE_URL` to a url that matches with the port of the PostgreSQL container in the previous section.
   - Set `REDIS_BROKER_URL` to a url that matches with the port of the Redis container in the previous section.
   - Set `GITHUB_TOKEN` to a Personal Access Token from GitHub, with permissions to read from repositories. It can be a read-only token; its sole use is only to bypass the aggressive rate-limiting imposed by GitHub for unauthenticated requests.
   - Set `CELERY_BEAT_SCHEDULE` to a cron string representing the frequency of bug scraping. In the example, it occurs every 6 hours. For a reference what cron strings are, what they mean, and how to write them, see <https://crontab.guru/>.
   - Set `FRONTEND_ALLOWED_ORIGINS` to a JSON string representing the allowed origins for the frontend. When running in development, this value is ignored, and the FastAPI backend is accessible from all origins.
1. Install dependencies and start the backend with `yarn && yarn dev`

> To check that the environment is set up, run both frontend & backend, and ensure that the API is fetching correctly.

For your convenience, the same `.env.local` file is below, where you have to populate `OPENAI_API_KEY`:

```
MODE=development
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
OPENAI_API_KEY=
JWT_SECRET_KEY=somesupersecretvalue
REDIS_BROKER_URL=redis://localhost:6379/0
GITHUB_TOKEN=your_github_token_here
CELERY_BEAT_SCHEDULE="0 */6 * * *"
FRONTEND_ALLOWED_ORIGINS='["http://localhost:3000"]'
```
