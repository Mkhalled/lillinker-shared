import Link from 'next/link';

const Home = () => {
  return (
    <>
      <h1 className="text-2xl font-bold">landing page </h1>
      <Link href="/auth/login">Login</Link>
    </>
  );
};

export default Home;
