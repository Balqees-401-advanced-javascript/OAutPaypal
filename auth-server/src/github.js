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
  } catch (e) {
     next(`ERROR: ${e.message}`) }

}

async function exchangeCodeForToken(code) {

  console.log('#######---------------before-------------------#########',tokenServerUrl);
  let tokenResponse = await superagent.post('https://api.sandbox.paypal.com/v1/oauth2/token')
  .set('Authorization', `Basic QVlUVzZ4TlpzQ05PWE1EZWlzZFM0ZUhSSllXTTZnRDAwcTUwRkp0YlBTRWIwMll3VUdBYUpLNFZ5MjFNaFNrNDU2T3g4S0ZpLTc1ejN6c0g6RUR1ZjhnaFI3RUd5NFFBbEVXTE01OHZoa2dFX0YxUlpFenlVZDJhX3NmRnV6OHN4N25mR2x0endaQl9tWXpQSU9DbkVnSFBvV0NkeTBGZUo=`)
  .set('Content-Type','application/x-www-form-urlencoded')
  .send({
    code: code,
    grant_type: 'authorization_code',
  }
  )
  // let refresh_token = tokenResponse.body.refresh_token;
  let access_token = tokenResponse.body.access_token;
  console.log('#######---------------token-------------------#########', access_token);
  return access_token;
}


async function getRemoteUserInfo(token) {
  console.log('#######---------------Beforuser-------------------#########' );
  let userResponse =
    await superagent.get('https://api.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1')
    .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)  
      console.log('#######---------------user-------------------#########', userResponse.body);
  let user = userResponse.body;

  return user;

}

async function getUser(remoteUser) {
  let userRecord = {
    username: remoteUser.name,
    password: 'oauthpassword'
  }

  let user = await users.save(userRecord);
  let token = users.generateToken(user);

  return [user, token];

}




