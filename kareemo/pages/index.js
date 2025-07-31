import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const saveUser = async () => {
        await supabase.from('users').upsert({
          id: session.user.id || session.user.email,
          name: session.user.name,
          username: session.user.username,
          image: session.user.image,
        });
        router.push('/dashboard');
      };
      saveUser();
    }
  }, [session]);

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to Kareemo App</h1>
        <button onClick={() => signIn('twitter')}>Login with Twitter</button>
      </div>
    );
  }

  return <div>Redirecting...</div>;
}
