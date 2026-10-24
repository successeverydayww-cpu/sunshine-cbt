/* ---- Sunshine Agent live relay (v11): student chat -> Superagent conversation ---- */
const AGENT_ID='6a20ddeb89bb6423ccb075d2';
const AGENT_CONV='6a20ddf00d15166b7528a144';
const AGENT_CORS={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
function extractReply(j){
  if(!j)return '';
  if(typeof j==='string')return j.trim();
  let best='';
  const tryObj=o=>{try{
    if(!o||typeof o!=='object'||best)return;
    if(typeof o.content==='string'&&o.role!=='user'&&o.role!=='system')best=o.content;
    if(typeof o.message==='string')best=o.message;
    if(typeof o.text==='string'&&o.role!=='user')best=o.text;
    if(typeof o.reply==='string')best=o.reply;
    if(typeof o.answer==='string')best=o.answer;
    if(typeof o.data==='string')best=o.data;
    if(o.data&&typeof o.data==='object'){
      if(typeof o.data.content==='string')best=o.data.content;
      if(typeof o.data.message==='string')best=o.data.message;
      if(Array.isArray(o.data))for(const it of o.data)tryObj(it);
    }
    if(o.message&&typeof o.message==='object')tryObj(o.message);
    if(Array.isArray(o.messages)){for(const it of o.messages)if(!best)tryObj(it);}
    if(Array.isArray(o.conversation)){for(const it of o.conversation)if(!best)tryObj(it);}
  }catch(e){}};
  tryObj(j);
  if(Array.isArray(j)){for(const it of j)if(!best)tryObj(it);}
  return String(best||'').trim();
}
async function handleAgent(request, env){
  if(request.method==='OPTIONS')return new Response('',{headers:AGENT_CORS});
  if(request.method!=='POST')return new Response(JSON.stringify({ok:false,err:'POST only'}),{status:405,headers:AGENT_CORS});
  let body={};try{body=await request.json()}catch(e){}
  const msg=String(body.msg||'').slice(0,2000);
  if(!msg)return new Response(JSON.stringify({ok:false,err:'empty'}),{status:400,headers:AGENT_CORS});
  const tok=String((env&&env.B44_TOKEN)||'');
  if(!tok)return new Response(JSON.stringify({ok:false,err:'not configured'}),{status:500,headers:AGENT_CORS});
  let prompt='[Sunshine CBT live-agent relay. You are the Sunshine Agent for Sunshine International School, Eket. A student is asking inside the CBT practice app. Reply as the Sunshine Agent: warm, clear, encouraging, WhatsApp style. PLAIN TEXT ONLY, no markdown headings, no links. If question context is provided, ground your answer in it (the correct answer and official explanation are given). Give exam study help for JAMB/WAEC/NECO subjects; if asked about other things, gently steer back to study. Do NOT use tools or take external actions. Do not reveal personal information about anyone. Student message]: '+msg;
  if(body.ctx&&body.ctx.q){try{
    const c=body.ctx;
    const opts=Array.isArray(c.o)?c.o.map((o,k)=>String.fromCharCode(65+k)+'. '+String(o)).join(' | '):'';
    prompt='[The student is looking at this question in the app:\nSubject: '+String(c.s||'')+'\nQ: '+String(c.q)+'\nOptions: '+opts+'\nCorrect answer: '+String.fromCharCode(65+Number(c.a||0))+'. '+(Array.isArray(c.o)?String(c.o[Number(c.a)||0]||''):'')+'\nOfficial explanation: '+String(c.e||'')+'\n]\n'+prompt;
  }catch(e){}}
  try{
    const r=await fetch('https://app.base44.com/api/agents/'+AGENT_ID+'/conversations/'+AGENT_CONV+'/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},
      body:JSON.stringify({content:prompt.slice(0,4000)})
    });
    if(!r.ok)return new Response(JSON.stringify({ok:false,err:'upstream '+r.status}),{status:502,headers:AGENT_CORS});
    const txt=await r.text();
    let j=null;try{j=JSON.parse(txt)}catch(e){}
    const reply=extractReply(j);
    if(!reply)return new Response(JSON.stringify({ok:false,err:'no reply'}),{status:502,headers:AGENT_CORS});
    return new Response(JSON.stringify({ok:true,reply:reply.slice(0,3000)}),{headers:AGENT_CORS});
  }catch(e){
    return new Response(JSON.stringify({ok:false,err:'relay fail'}),{status:502,headers:AGENT_CORS});
  }
}
