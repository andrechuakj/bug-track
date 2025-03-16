import os
from textwrap import dedent

from domain.config import engine
from sqlmodel import SQLModel, Session, text


class Runner:
    TABLE_NAME = "ran_seeds"
    tx: Session

    def __init__(self, tx: Session):
        self.tx = tx
        self.create_table_if_missing()

    def create_table_if_missing(self):
        print("Creating tables for entities")
        SQLModel.metadata.create_all(engine)
        print("Creating table for seeds")
        self.tx.exec(
            text(
                dedent(
                    f"""
        CREATE TABLE IF NOT EXISTS {Runner.TABLE_NAME} (
            seed_file_name VARCHAR(255) NOT NULL
        );
        """
                )
            )
        )
        self.tx.commit()

    def get_seeded_entities(self):
        print("Getting all records")
        result = self.tx.exec(
            text(
                dedent(
                    f"""
        SELECT * FROM {Runner.TABLE_NAME};
        """
                )
            )
        )
        return result.all()

    def run_transaction(self, filename: str, sql: str):
        self.tx.exec(text(sql))
        self.tx.exec(
            text(
                dedent(
                    f"""
        INSERT INTO {Runner.TABLE_NAME} (seed_file_name)
        VALUES (:seed_file_name);
        """
                )
            ),
            # Use parameters to prevent SQL injection
            params={"seed_file_name": filename},
        )
        self.tx.commit()


def scan_files():
    base_path = os.path.dirname(__file__)
    seeds_folder = "../db/seeds"
    folder_name = os.path.join(base_path, seeds_folder)
    seed_files = [
        f
        for f in os.listdir(folder_name)
        if os.path.isfile(os.path.join(folder_name, f))
    ]
    seed_files.sort()
    return seed_files


def run_seed_scripts(runner, migration_filenames, ran):
    run_count = 0
    base_path = os.path.dirname(__file__)
    seeds_folder = "../db/seeds"
    for filename in migration_filenames:
        if filename in ran:
            print(f"Skipping {filename}")
            continue
        run_count += 1
        print(f"Running {filename}")
        path = os.path.join(base_path, seeds_folder, filename)
        with open(path) as f:
            runner.run_transaction(filename, f.read())
    print(f"Ran {run_count} seeds!")


def main():
    migration_filenames = scan_files()
    print(f"Found {len(migration_filenames)} seed files:")
    for filename in migration_filenames:
        print(f"  - {filename}")
    with Session(engine, expire_on_commit=False) as tx:
        runner = Runner(tx)
        ran = runner.get_seeded_entities()
        print(f"Found {len(ran)} ran seeds:")
        for r in ran:
            print(f"  - {r.seed_file_name}")
        ran = set([r.seed_file_name for r in ran])
        run_seed_scripts(runner, migration_filenames, ran)
        ran = runner.get_seeded_entities()
        print(f"Found {len(ran)} ran seeds:")
        for r in ran:
            print(f"  - {r.seed_file_name}")
        print("All done!")


if __name__ == "__main__":
    main()
