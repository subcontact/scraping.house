import Linkedjs from './linkedjs';

async function test() {
  const l = await Linkedjs.init('firefox', { headless: false }, undefined, 'linkedjs.json');
  await l.login(process.env['LINKEDIN_USERNAME'] as string, process.env['LINKEDIN_PASSWORD'] as string);
  await l.userProfile(process.env['LINKEDIN_PROFILE_ID'] as string);
}

test().then();
