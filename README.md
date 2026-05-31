# IP-City-Rest-Map
a project for IP team project 

# HOW TO START

if you have git bash, simply type
git clone https://github.com/2025150057/IP-City-Rest-Map

after cloning, (make sure you are in 
right folder) type
npm install
for installing requirements(currently express.js)

type
npm run dev
for developer launching. (also, make sure
requirements are set)

# HOW TO CONTRIBUTE
make a new branch start with dev.
ex) dev/backend/seoulcityapi
and make any progress in there, send a merge request.

 - for backend devs, We're currently using 'express' and 'node.js' for backend stuff, to ensure this lecture's materials help you.

 - also, we're currently running our server with cloudflare, managed by me. 
  whole project is deployed at https://ip-city-rest-map-revive.dhs2025.workers.dev/ 
  if you need to update deployed version, just email to dhs2025@yonsei.ac.kr or ask me to get a permission in
  cloudflare dashboard. 

 it's a good practice to write comments to almost every functions and objects since we're using JS instead of Typescript, but you may not, if you feel abundant or just being tired of writing comments. in that case, please just comment #TODO, and I'll later put comments on that or else. 

 - + search about JSDOC, which is a helpful tool to document js objects.
 

 - for frontend devs, Good Luck! :) you're free to use any api's if needed, but you should include d3.js and sigma.js, as we've noted at pdf document.
 Though I've put some sample design images in that pdf, of course, if needed, you can ignore it without feeling any guilty. Those are just temporary images.

# HOW TO COMMIT (git tutorial for me)

in git bash, (make sure you're in right folder which has .git folder. if not, use cd ../ and cd {filename} to move to right folder.)
1. make new branch.
git branch {branchname ex)dev/test}

if you want, you can type 
git branch
to check a branch you have made exists.

2. switch to that branch.
git checkout {branchname}

3. pull datas from origin.
git pull origin {branchname}

4. make some changes.

5. apply differences to local branch.
git add .

6. make commit message
git commit -m "{message}"

7. push to remote branch.
git push origin {branchname}

8. if needed, make PR(pull request) to origin's main branch.

this can be done in github website.


if you have any question about this project, 
please send email to dhs2025@yonsei.ac.kr

