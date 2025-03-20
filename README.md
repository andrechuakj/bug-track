# Bug Track MonoRepo

> ## CS3213 Team 10

## Setup NextJS application and dev environment

1. Navigate to the `apps/bug-analysis-web/` directory by running `cd apps/bug-analysis-web/`
1. Install dependencies and start the frontend development server with `yarn && yarn dev`
1. Create a `.env.local` file in the current directory and populate `NEXT_PUBLIC_API_URL` environment variable, for e.g. `NEXT_PUBLIC_API_URL=http://localhost:8000`
1. Ensure that prettier and eslint extensions on VSCode are installed
1. Set your default formatter to 'Prettier - Code formatter' and check the setting `Editor: Format on Save`
1. Try to shift the code around, to test the auto-formatting. Also try to trigger eslint errors to see if your IDE highlights them

## Setup FastAPI

1. Navigate to `apps/api/` directory by running `cd apps/api/`
1. Run the following commands:

   ```bash
   python -m venv myenv
   source myenv/bin/activate
   pip install -r requirements.txt
   ```

   > On Windows, use WSL to run the commands above.

1. Create a `.env.local` file in the current directory and populate `MODE`, `OPENAI_API_KEY`, `DATABASE_URL` and `JWT_SECRET_KEY` environment variables, with `MODE` set to `development`. `JWT_SECRET_KEY` can be any string of your choosing (eg randomly generated). 
1. Install dependencies and start the backend with `yarn && yarn dev`

> To check that the environment is set up, run both frontend & backend, and ensure that the API is fetching correctly.
