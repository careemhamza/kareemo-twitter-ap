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
