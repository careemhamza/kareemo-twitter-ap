// ✅ مشروع Next.js بتسجيل دخول تويتر + حفظ المستخدمين + عرضهم مع زر "Do you know this user?"

// ملف: .env.local
nextauth_secret=kareemo_secret_123
nextauth_url=http://localhost:3000
twitter_client_id=a3NqazFRZVl1d2J0WmFNWF8yZGM6MTpjaQ
twitter_client_secret=8kTyxEYVVsdgvgo8OssNEvGYPYkgOZZxzN4JGD_ZHg1LDdPU49
supabase_url=https://nnwrbwxutmoflgfjqbte.supabase.co
supabase_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[اختصر للعرض فقط]

// ملف: lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.supabase_url;
const supabaseKey = process.env.supabase_key;

export const supabase = createClient(supabaseUrl, supabaseKey);


// ملف: pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.twitter_client_id,
      clientSecret: process.env.twitter_client_secret,
      version: '2.0',
    }),
  ],
  secret: process.env.nextauth_secret,
});


// ملف: pages/_app.js
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}


// ملف: pages/index.js
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      // حفظ المستخدم في Supabase
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


// ملف: pages/dashboard.js
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select();
      const filtered = data.filter(u => u.username !== session?.user?.username);
      setUsers(filtered);
    };
    fetchUsers();
  }, [session]);

  const vote = async (targetId, value) => {
    await supabase.from('votes').upsert({
      voter_id: session.user.id || session.user.email,
      target_id: targetId,
      vote_value: value,
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Welcome {session?.user?.name}</h1>
      <button onClick={() => signOut()}>Logout</button>

      <h2>Do you know these users?</h2>
      {users.map(user => (
        <div key={user.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <img src={user.image} alt={user.username} width={50} style={{ borderRadius: '50%' }} />
          <p>{user.name} (@{user.username})</p>
          <button onClick={() => vote(user.id, true)}>Yes</button>
          <button onClick={() => vote(user.id, false)}>No</button>
        </div>
      ))}
    </div>
  );
}
