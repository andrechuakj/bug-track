export interface BugReport {
  id: number;
  title: string;
  bugDescription: string;
  githubIssueURL: string;
  githubRepoURL: string;
  createdAt: string;
  status: 'Open' | 'Closed';
  category: 'Incorrect query result' | 'Concurrency issue';
  categoryId: number;
  versionsAffected?: string[];
}

export const mockBugData: BugReport[] = [
  {
    id: 0,
    title: 'The `COERCIBILITY` of variables are different from MySQL',
    bugDescription: `
  ## Bug Report

  Please answer these questions before submitting your issue. Thanks!

  ### 1. Minimal reproduce step (Required)

  Run \`SELECT COERCIBILITY(@@character_set_server)\`

  ### 2. What did you expect to see? (Required)

  MySQL gives \`3\`.

  ### 3. What did you see instead (Required)

  TiDB gives \`4\`

  ### 4. What is your TiDB version? (Required)

  <!-- Paste the output of SELECT tidb_version() -->
    `,
    githubIssueURL: 'https://github.com/pingcap/tidb/issues/59618',
    githubRepoURL: 'https://github.com/pingcap/tidb',
    createdAt: '2025-02-18 15:02:44+00:00',
    status: 'Open',
    category: 'Incorrect query result',
    categoryId: 1,
    versionsAffected: ['1.0.0', '1.1.0'],
  },
  {
    id: 1,
    title: 'Concurrency issue during data updates',
    bugDescription: `
The CI test \`idc-jenkins-ci-tidb/check_dev_2 \` may fail when checking safepoint.
This is because there is gc safepoint registered by other concurrent test.
\`\`\`
=== RUN   TestOperator

    operator_test.go:80: 

        	Error Trace:	tests/realtikvtest/brietest/operator_test.go:80

        	            				tests/realtikvtest/brietest/operator_test.go:195

        	Error:      	the service gc safepoint exists

        	Test:       	TestOperator

        	Messages:   	it is struct { ServiceID string "json:\\"service_id\\""; ExpiredAt int64 "json:\\"expired_at\\""; SafePoint int64 "json:\\"safe_point\\"" }{ServiceID:"backup-stream-TestPiTRAndBackupInSQL-1", ExpiredAt:1739795773, SafePoint:456075134474649603}

--- FAIL: TestOperator (0.00s)

=== RUN   TestFailure

    operator_test.go:80: 

        	Error Trace:	tests/realtikvtest/brietest/operator_test.go:80

        	            				tests/realtikvtest/brietest/operator_test.go:248

        	Error:      	the service gc safepoint exists

        	Test:       	TestFailure

        	Messages:   	it is struct { ServiceID string "json:\\"service_id\\""; ExpiredAt int64 "json:\\"expired_at\\""; SafePoint int64 "json:\\"safe_point\\"" }{ServiceID:"backup-stream-TestPiTRAndBackupInSQL-1", ExpiredAt:1739795773, SafePoint:456075134474649603}

--- FAIL: TestFailure (0.00s)
\`\`\``,
    githubIssueURL: 'https://github.com/pingcap/tidb/issues/59604',
    githubRepoURL: 'https://github.com/pingcap/tidb',
    createdAt: '2025-02-18 08:14:56+00:00',
    status: 'Closed',
    category: 'Concurrency issue',
    categoryId: 2,
    versionsAffected: ['1.0.0'],
  },
];
