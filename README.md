# Bug Track MonoRepo

> ## CS3213 Team 10

## Setup NextJS application and dev environment

1. cd to `packages/bug-analysis-web/`, run `yarn && yarn dev`
1. Create a `.env.local` file and populate `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_PORT` environment variables
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
   On Windows, run the following instead:
   ```bash
   python -m venv myenv
   myenv\Scripts\activate
   pip install -r win_requirements.txt
   ```

1. Navigate to `src` with `cd src/`
1. Start the backend with `uvicorn main:app --reload`

> To check that the environment is set up, run both FE & BE, and ensure that the API is fetching correctly.
