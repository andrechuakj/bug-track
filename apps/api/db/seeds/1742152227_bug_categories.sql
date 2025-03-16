INSERT INTO
    bug_categories (id, name)
VALUES
    (0, 'Crash / Segmentation Fault'),
    (1, 'Assertion Failure'),
    (2, 'Usability'),
    (3, 'Compatibility'),
    (4, 'Incorrect Query Result'),
    (5, 'Performance Degradation'),
    (6, 'Constraint Violation'),
    (7, 'Deadlock'),
    (8, 'Data Corruption'),
    (9, 'SQL Syntax / Parsing Error'),
    (10, 'Privilege Escalation'),
    (11, 'Memory Leak / Resource Exhaustion'),
    (
        12,
        'Concurrency Issue (race conditions, lost updates, etc.)'
    ),
    (
        13,
        'Transaction Anomaly (phantom reads, dirty reads, etc.)'
    ),
    (14, 'Non-Issues');
