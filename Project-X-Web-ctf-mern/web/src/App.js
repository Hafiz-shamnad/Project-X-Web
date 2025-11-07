import React, { useState } from "react";
import axios from "axios";
function App(){
  const [slug,setSlug]=useState('');
  const [docker,setDocker]=useState('');
  const [flag,setFlag]=useState('');
  const api="http://localhost:8100/api/ctf";
  async function createChallenge(e){e.preventDefault();
    await axios.post(api+"/challenges",{title:slug,slug,docker_image:docker});
    alert('Challenge created');
  }
  async function verifyFlag(e){e.preventDefault();
    const r=await axios.post(api+'/verify',{instance_id:1,team_id:1,flag});
    alert(r.data.message);
  }
  return (<div style={{padding:'2em',fontFamily:'sans-serif'}}>
    <h1>Project-X-Web CTFZone</h1>
    <form onSubmit={createChallenge}>
      <input placeholder='slug' value={slug} onChange={e=>setSlug(e.target.value)}/>
      <input placeholder='docker image' value={docker} onChange={e=>setDocker(e.target.value)}/>
      <button type='submit'>Create</button>
    </form>
    <form onSubmit={verifyFlag}>
      <input placeholder='flag' value={flag} onChange={e=>setFlag(e.target.value)}/>
      <button type='submit'>Verify Flag</button>
    </form>
  </div>);
}
export default App;
