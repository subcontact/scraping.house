import Linkedjs from './linkedjs';
import UserProfile from './user-profile';

async function test() {
  const l = await Linkedjs.init('firefox', { headless: true }, undefined, 'linkedjs.json');
  await l.login(process.env['LINKEDIN_USERNAME'] as string, process.env['LINKEDIN_PASSWORD'] as string);
  const up: UserProfile = await l.userProfile(process.env['LINKEDIN_PROFILE_ID'] as string);
  console.info(`User full name ${await up.fullName()}`);
  console.info(`User short description ${(await up.shortDescription()).trim()}`);
  console.info(`User location ${(await up.location()).trim()}`);
  console.info(`User information ${await up.about()}`);
  console.info(`User is premium ? ${await up.isPremium()}`);
  console.info(`User is influencer ${await up.isInfluencer()}`);
  const xps = await up.experiences();
  console.info(`User experiences: ${JSON.stringify(xps, undefined, 4)}`);
  const es = await up.education();
  console.info(`User education ${JSON.stringify(es, undefined, 4)}`);
  await l.close();
}

test().then();
