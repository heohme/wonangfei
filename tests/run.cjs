const {spawnSync}=require('node:child_process');
const path=require('node:path');
const tests=['calc','accounting','modes','reminders','privacy','daily-target','monthly','floating','guide','artwork'];
for(const test of tests){
 const result=spawnSync(process.execPath,[path.join(__dirname,test+'.test.cjs')],{stdio:'inherit',cwd:path.join(__dirname,'..')});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
