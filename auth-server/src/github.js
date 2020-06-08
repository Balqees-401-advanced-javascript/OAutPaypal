'use strict';

const superagent = require('superagent');
const users = require('./users.js');


/*
  Resources
  https://developer.github.com/apps/building-oauth-apps/
*/

const tokenServerUrl = process.env.TOKEN_SERVER;
const remoteAPI = process.env.REMOTE_API;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;

module.exports = async function authorize(req, res, next) {

  try {
    let code = req.query.code;
    console.log('(1) CODE:', code);

    let remoteToken = await exchangeCodeForToken(code);
    console.log('(2) ACCESS TOKEN:', remoteToken)

    let remoteUser = await getRemoteUserInfo(remoteToken);
    console.log('(3) GITHUB USER', remoteUser)

    let [user, token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    console.log('(4) LOCAL USER', user);

    next();
  } catch (e) {console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',e);
     next(`ERROR: ${e.message}`) }

}

async function exchangeCodeForToken(code) {

  console.log('#######---------------before-------------------#########',tokenServerUrl);
  let tokenResponse = await superagent.post(tokenServerUrl)
  .set('Authorization', `Basic {QVlUVzZ4TlpzQ05PWE1EZWlzZFM0ZUhSSllXTTZnRDAwcTUwRkp0YlBTRWIwMll3VUdBYUpLNFZ5MjFNaFNrNDU2T3g4S0ZpLTc1ejN6c0g=:EDuf8ghR7EGy4QAlEWLM58vhkgE_F1RZEzyUd2a_sfFuz8sx7nfGltzwZB_mYzPIOCnEgHPoWCdy0FeJ}`)
  
  .send({
    code: code,
    grant_type: 'authorization_code',
  }
  )
  
  

  let access_token = tokenResponse.body.access_token;
  console.log('#######---------------token-------------------#########', access_token);
  return access_token;

}


async function getRemoteUserInfo(token) {

  let userResponse =
    await superagent.get(remoteAPI)
      .set('user-agent', 'express-app')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')


  let user = userResponse.body;

  return user;

}

async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.login,
    password: 'oauthpassword'
  }

  let user = await users.save(userRecord);
  let token = users.generateToken(user);

  return [user, token];

}




