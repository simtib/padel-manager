import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getLocalEnvironment } from './supabase-local.mjs';
const env=getLocalEnvironment();
const options={auth:{persistSession:false,autoRefreshToken:false}};
const service=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,options);
const ids=[];const eventIds=[];
const ok=({data,error})=>{if(error)throw error;return data;};
const denied=(r,fragment='')=>{assert.ok(r.error, 'Expected a rejected write');assert.ok(r.error.message.includes(fragment),r.error.message);};
async function account(plan='free'){
 const email=`plan-${randomUUID()}@example.test`,password=`Local-${randomUUID()}!`;
 const {user}=ok(await service.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:'Plan Test',plan:'pro'}}));ids.push(user.id);
 const api=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);ok(await api.auth.signInWithPassword({email,password}));
 assert.equal(ok(await api.from('profiles').select('plan').eq('id',user.id).single()).plan,'free');
 if(plan==='pro')ok(await service.from('profiles').update({plan}).eq('id',user.id));
 return {id:user.id,api};
}
async function create(owner,date='2099-10-01'){
 const r=await owner.api.rpc('create_event',{event_name:'Plan test',event_description:'Synthetic',event_type_value:'normal_match',event_date_value:date,start_time_value:'18:00',visibility_value:'public',max_players_value:4});
 if(r.data)eventIds.push(r.data);return r;
}
try {
 const free=await account(),pro=await account('pro'),other=await account('pro');
 denied(await free.api.from('profiles').update({plan:'pro'}).eq('id',free.id));
 denied(await free.api.from('profiles').upsert({id:free.id,plan:'pro'}));
 ok(await free.api.auth.updateUser({data:{plan:'pro'}}));assert.equal(ok(await free.api.from('profiles').select('plan').eq('id',free.id).single()).plan,'free');
 const concurrent=await Promise.all([create(free),create(free)]);assert.equal(concurrent.filter(r=>!r.error).length,1);denied(concurrent.find(r=>r.error),'1 active match');
 const first=concurrent.find(r=>!r.error).data;
 denied(await free.api.from('events').insert({owner_id:free.id,name:'Bypass',event_type:'normal_match',event_date:'2099-10-01',start_time:'18:00',visibility:'public',max_players:4}),'1 active match');
 ok(await free.api.from('events').update({status:'completed'}).eq('id',first));const second=ok(await create(free));
 denied(await free.api.from('events').update({status:'open'}).eq('id',first),'1 active match');
 const games=[];for(let i=0;i<6;i++)games.push(ok(await create(pro)));
 const joins=await Promise.all(games.slice(0,4).map(id=>free.api.rpc('register_for_event',{target_event_id:id})));
 assert.equal(joins.filter(r=>!r.error).length,3);denied(joins.find(r=>r.error),'3 upcoming matches');
 const missed=games[joins.findIndex(r=>r.error)];
 denied(await free.api.from('event_participants').insert({event_id:missed,user_id:free.id,registered_by:free.id}),'3 upcoming matches');
 const joined=games[joins.findIndex(r=>!r.error)];ok(await free.api.rpc('remove_event_participant',{target_event_id:joined,target_user_id:free.id}));ok(await free.api.rpc('register_for_event',{target_event_id:missed}));
 for(const id of games)ok(await other.api.rpc('register_for_event',{target_event_id:id}));
 const past=ok(await create(pro,'2020-01-01'));ok(await free.api.rpc('register_for_event',{target_event_id:past}));
 denied(await pro.api.from('events').update({event_date:'2099-11-01'}).eq('id',past),'3 upcoming matches');
 denied(await free.api.from('guest_players').insert({name:'Blocked guest',created_by:free.id}),'Upgrade to Pro');
 denied(await free.api.rpc('check_plan_action',{action_name:'guest'}),'Upgrade to Pro');
 const guest=ok(await pro.api.from('guest_players').insert({name:'Allowed guest',created_by:pro.id}).select('id').single());
 ok(await pro.api.from('event_participants').insert({event_id:games[4],guest_player_id:guest.id,registered_by:pro.id}));
 denied(await free.api.from('event_participants').insert({event_id:second,guest_player_id:guest.id,registered_by:free.id}),'Upgrade to Pro');
 ok(await free.api.from('event_participants').insert({event_id:second,user_id:free.id,registered_by:free.id,registration_status:'waiting_list'}));
 const full=ok(await create(pro));
 for(let i=0;i<4;i++){const g=ok(await pro.api.from('guest_players').insert({name:`Guest ${i}`,created_by:pro.id}).select('id').single());ok(await pro.api.from('event_participants').insert({event_id:full,guest_player_id:g.id,registered_by:pro.id}));}
 const waitingFree=await account();
 assert.equal(ok(await waitingFree.api.rpc('register_for_event',{target_event_id:full})),'waiting_list','Free users can join their first waiting list');
 ok(await waitingFree.api.rpc('remove_event_participant',{target_event_id:full,target_user_id:waitingFree.id}));
 assert.equal(ok(await waitingFree.api.rpc('register_for_event',{target_event_id:full})),'waiting_list','Free users can rejoin after leaving a waiting list');
 denied(await free.api.rpc('register_for_event',{target_event_id:full}),'waiting list');
 assert.equal(ok(await other.api.rpc('register_for_event',{target_event_id:full})),'waiting_list');
 // Plans are read from the DB, so an existing session gains/loses entitlements.
 ok(await service.from('profiles').update({plan:'pro'}).eq('id',free.id));ok(await create(free));ok(await free.api.rpc('check_plan_action',{action_name:'guest'}));
 ok(await service.from('profiles').update({plan:'free'}).eq('id',free.id));denied(await create(free),'1 active match');
 console.log('PASS: Free/Pro creation, concurrent limits, joining, withdrawal, rescheduling, guests, waitlists, anti-escalation and live plan changes.');
} finally {
 for(const id of eventIds)ok(await service.from('events').delete().eq('id',id));
 for(const id of ids)ok(await service.auth.admin.deleteUser(id));
}
