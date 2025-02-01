import { useEffect, useState } from 'react';

const HomePage = () => {
  const [testApiMsg, setTestApiMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}:${process.env.NEXT_PUBLIC_API_PORT}`
    )
      .then((res) => res.json())
      .then((res: Record<string, unknown>) =>
        setTestApiMsg((res.message as string) ?? 'error')
      )
      .catch(() => setTestApiMsg('error'));
  }, []);

  return (
    <div>
      <button onClick={() => alert('Hello! We are at the root route!')}>
        Hello World!
      </button>
      <p className="text-red-400">{`Response from API: ${testApiMsg ?? 'Loading...'}`}</p>
    </div>
  );
};

export default HomePage;
