from typing import List


def get_dbms_ai_summary_prompt(dbms_name: str, desc: List[str]) -> str:
    desc_numbered = "\n".join([f"{i + 1}. {d}" for i, d in enumerate(desc)])
    
    PROMPT = f"""
    Provide a concise 100-word summary for {dbms_name}, based on the following descriptions of bugs. The summary should offer a high-level overview of the issues observed in the DBMS, and potentially recommendations for the DBMS developer:
    {desc_numbered}
    """
    return PROMPT
