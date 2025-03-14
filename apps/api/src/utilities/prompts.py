from typing import List

def get_dbms_ai_summary_prompt(dbms_name: str, desc: List[str]) -> str:
  desc_joined = '\n\n'.join(list(map(lambda x: f"- {x}", desc)))
  PROMPT = f'''Write a 100-word summary from {dbms_name}, given descriptions of some bugs as listed. Make it sound like you are giving a high-level overview of bugs occuring in the DBMS.
  {desc_joined}
  '''
  return PROMPT
