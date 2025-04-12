# Bug Track MonoRepo

> ## CS3213 Team 10

## Setup NextJS application and dev environment

1. Navigate to the `apps/bug-analysis-web/` directory by running `cd apps/bug-analysis-web/`
1. Install dependencies and start the frontend development server with `yarn && yarn dev`
1. Create a `.env.local` file in the current directory and populate `NEXT_PUBLIC_API_URL` environment variable, for e.g. `NEXT_PUBLIC_API_URL=http://localhost:8000`
1. Ensure that prettier and eslint extensions on VSCode are installed
1. Set your default formatter to 'Prettier - Code formatter' and check the setting `Editor: Format on Save`
1. Try to shift the code around, to test the auto-formatting. Also try to trigger eslint errors to see if your IDE highlights them

## Setup Redis
Redis needs to be running for the backend to work.

1. Make sure you have docker installed.
1. Run the following command:
   ```bash
   docker run -d -p 6379:6379 --name bugtrack-redis redis
   ```
1. Later, run the following command to stop the docker container:
   ```bash
   docker stop bugtrack-redis
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
   - set `MODE` to `development`.
   - set `JWT_SECRET_KEY` to any string of your choosing (eg randomly generated). Do not share this.
   - set `REDIS_BROKER_URL` to a url that matches with the port of the redis container in the previous section.
   - set `GITHUB_TOKEN` to a Personal Access Token from GitHub, with permissions to read from public repositories.
   - set `CELERY_BEAT_SCHEDULE` to a string representing the frequency of bug scraping. In the example, it occurs every 6 hours.
1. Install dependencies and start the backend with `yarn && yarn dev`

> To check that the environment is set up, run both frontend & backend, and ensure that the API is fetching correctly.
