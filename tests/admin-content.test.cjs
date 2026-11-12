const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file,deps={}) {
 const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('require','exports','module',source)(name=>{if(name in deps)return deps[name];throw new Error('Unexpected dependency '+name);},module.exports,module);return module.exports;
}
const fields=load('lib/supabase/admin-fields.ts');
const adapter=load('lib/supabase/adapters.ts');
const time=load('lib/time.ts');
const view=load('content/event-view.ts',{'@/lib/time':time,'./events':{events:[]},'./meta':{published:x=>x,formatPartialDate:x=>x.value}});
test('titles become URL-safe slugs with whitespace and diacritics',()=>{assert.equal(fields.slugFromTitle('  Éko  Club / Annual Celebration! '),'eko-club-annual-celebration');});
test('multi-day events remain upcoming until their end, not their start',()=>{
 const event=adapter.mapEvent({id:'test',slug:'test',title:'Test',description:'One\n\nTwo',start_at:'2026-11-09T12:00:00Z',end_at:'2026-11-11T12:00:00Z',venue:'Hall',address:'Baton Rouge',category:'Community',image_url:'/media/community.webp',rsvp_enabled:true,capacity:25});
 assert.equal(event.managedId,'test');assert.equal(view.isUpcoming(event,new Date('2026-11-10T12:00:00Z')),true);
 assert.equal(view.isUpcoming(event,new Date('2026-11-11T12:00:00Z')),false);assert.deepEqual(event.body,['One','Two']);
 assert.equal(view.eventInstants(event).start.toISOString(),'2026-11-09T12:00:00.000Z');
});
test('Central Time mapping uses daylight saving in summer',()=>{
 const e=adapter.mapEvent({id:'test',slug:'test',title:'Test',description:'',start_at:'2026-07-01T12:00:00Z',end_at:'2026-07-01T14:00:00Z',image_url:'',rsvp_enabled:false});
 assert.equal(e.schedule.start,'2026-07-01T07:00');
 assert.equal(view.eventInstants(e).start.toISOString(),'2026-07-01T12:00:00.000Z');
});
test('blank images use the club crest; uploaded images preserve their public URL',()=>{assert.equal(adapter.managedMedia('','Club').remote,undefined);assert.equal(adapter.managedMedia('/media/photo.webp','Club').remote.src,'/media/photo.webp');});
