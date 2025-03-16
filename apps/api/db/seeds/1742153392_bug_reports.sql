INSERT INTO
    bug_reports (id, dbms_id, category_id, title)
VALUES
    (0, 0, 0, 'Title 1'),
    (1, 0, 0, 'Title 2'),
    (2, 0, 1, 'Title 3'),
    (3, 0, 1, 'Title 4'),
    (4, 0, 2, 'Title 5'),
    (5, 0, 2, 'Title 6'),
    (6, 0, 3, 'Title 7'),
    (7, 0, 4, 'Title 8'),
    (8, 0, 4, 'Title 9'),
    (9, 0, 5, 'Title 10'),
    (10, 0, 5, 'Title 11'),
    (11, 0, 5, 'Title 12'),
    (12, 0, 6, 'Title 13'),
    (13, 0, 6, 'Title 14'),
    (14, 0, 7, 'Title 15'),
    (15, 0, 8, 'Title 16'),
    (16, 0, 8, 'Title 17'),
    (17, 0, 9, 'Title 18'),
    (18, 0, 9, 'Title 19'),
    (19, 0, 10, 'Title 20'),
    (20, 0, 11, 'Title 21'),
    (21, 0, 11, 'Title 22'),
    (22, 0, 12, 'Title 23'),
    (23, 0, 12, 'Title 24'),
    (24, 0, 13, 'Title 25'),
    (25, 0, 13, 'Title 26'),
    (26, 0, 14, 'Title 27'),
    (27, 0, 14, 'Title 28');

UPDATE bug_reports
SET
    description = '## Bug Report\n\nPlease answer these questions before submitting your issue. Thanks!\n\n### 1. Minimal reproduce step (Required)\n\n```sql\nSELECT UNCOMPRESSED_LENGTH('' invalid_compressed_data '')\n```\n\n### 2. What did you expect to see? (Required)\n\nMySQL returns `561409641`\n\n### 3. What did you see instead (Required)\n\nTiDB returns `1635151465`.\n\n### 4. What is your TiDB version? (Required)\n\n<!-- Paste the output of SELECT tidb_version() -->'
WHERE
    id = 0;

UPDATE bug_reports
SET
    description = 'In current code we don''t fully make use of the prefetch buffer. There''s a background goroutine (spawned in line 48) that uses the prefetch buffer to read data from reader (line 57)\n\nhttps://github.com/pingcap/tidb/blob/b7e97690b9feb019ab0bec9ea6814af432ae948d/pkg/util/prefetch/reader.go#L48-L63\n\nHowever if the reader only return partial data (like it''s a socket and OS chooses to return only few bytes, naming `N`) this reading action is finished and the loop is waiting on sending to channel (line 62). If the caller of "prefetch reader" doesn''t consume the channel quickly, we are wasting a large proportion of the prefetch buffer which is `buf[N:]` because they are not filled. We should let the background goroutine use `io.ReadFull` to fully use the prefetch buffer.'
WHERE
    id = 3;

UPDATE bug_reports
SET
    description = '## Bug Report\n\nPlease answer these questions before submitting your issue. Thanks!\n\n### 1. Minimal reproduce step (Required)\n\n<!-- a step by step guide for reproducing the bug. -->\n\n### 2. What did you expect to see? (Required)\n\n```\nmysql> SELECT IS_UUID('' 6ccd780c-baba-1026-8567-4cc3505b2a62 '');\n+---------------------------------------------------+\n| IS_UUID('' 6ccd780c-baba-1026-8567-4cc3505b2a62 '') |\n+---------------------------------------------------+\n|                                                 0 |\n+---------------------------------------------------+\n1 row in set (0.03 sec)\n\nmysql> SELECT UUID_TO_BIN('' 6ccd780c-baba-1026-9564-5b8c656024db '');\nERROR 1411 (HY000): Incorrect string value: '' 6ccd780c-baba-1026-9564-5b8c656024db '' for function uuid_to_bin\n```\n\n### 3. What did you see instead (Required)\n\n```\nmysql> SELECT IS_UUID('' 6ccd780c-baba-1026-8567-4cc3505b2a62 '');\n+---------------------------------------------------+\n| IS_UUID('' 6ccd780c-baba-1026-8567-4cc3505b2a62 '') |\n+---------------------------------------------------+\n|                                                 1 |\n+---------------------------------------------------+\n1 row in set (0.00 sec)\n\nmysql> SELECT UUID_TO_BIN('' 6ccd780c-baba-1026-9564-5b8c656024db '');\n+--------------------------------------------------------------------------------------------------------------+\n| UUID_TO_BIN('' 6ccd780c-baba-1026-9564-5b8c656024db '')                                                        |\n+--------------------------------------------------------------------------------------------------------------+\n| 0x6CCD780CBABA102695645B8C656024DB                                                                           |\n+--------------------------------------------------------------------------------------------------------------+\n1 row in set (0.00 sec)\n```\n\n### 4. What is your TiDB version? (Required)\n\n<!-- Paste the output of SELECT tidb_version() -->'
WHERE
    id = 25;
