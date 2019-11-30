import React, { Component } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api'
import Amplify, { Auth, Hub } from 'aws-amplify';
import PubSub from '@aws-amplify/pubsub';
import { createUser, createTodo } from './graphql/mutations'
import { listUsers, listTodos } from './graphql/queries';
import Home from './Home.js';
import NavBar from './NavBar.js';
import BucketList from './BucketList.js';

import awsconfig from './aws-exports';
API.configure(awsconfig);
PubSub.configure(awsconfig);

Amplify.configure({
  Auth: {
    IdentityPoolId: 'us-east-1:3198bc65-dde4-426c-bdde-b35ac383f330',
    region: 'us-east-1',
    userPoolId: 'us-east-1_uLqyIsqnt',
    userPoolWebClientId: '224uf0oqjqib1oac70r3jd24g3',
    mandatorySignIn: true,
    oauth: {
      domain: 'platenbowl.auth.us-east-1.amazoncognito.com',
      scope: ['phone','email','profile','openid','aws.cognito.signin.user.admin'],
      redirectSignIn: 'https://master.d1artn8nksk20o.amplifyapp.com',
      redirectSignOut: 'https://master.d1artn8nksk20o.amplifyapp.com',
      responseType: 'token'
    }
  }
  });
					
export default class LeaderBoard extends React.Component {
	async componentDidMount(){
    const MutationButton = document.getElementById('MutationEventButton');
    const MutationResult = document.getElementById('MutationResult');
    var friendLeadersActive = true;

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const currentUser = (await Auth.currentAuthenticatedUser()).username;
    const QueryResult = document.getElementById('QueryResult');

    //This function displays the Friends Leaderboard
    async function getFriendLeaders() {
      MutationResult.innerHTML = `<h4>${currentUser}'s Friend Leaderboard</h4>`;
      QueryResult.innerHTML = ``;
      var leaderboardArray = [];

      //List own user's points at top by applying a filter to only query currentUser
      API.graphql(graphqlOperation(listUsers, {filter:{username:{eq:currentUser}}})).then((evt) => {
        evt.data.listUsers.items.map((user, i) => {
          QueryResult.innerHTML += `<p>${user.username} - ${user.points}</p>`
        });
      })
      await sleep(250);
      //List friend's points by applying a filter that only lists users who have currentUser in their friends list
      API.graphql(graphqlOperation(listUsers, {filter:{friends:{contains:currentUser}}})).then((evt) => {
        evt.data.listUsers.items.map((user, i) => { 
          QueryResult.innerHTML += `<p>${user.username} - ${user.points}</p>`
        });
      })
    }

    //This function displays the Global Leaderboard
    async function getGlobalLeaders() {
      MutationResult.innerHTML = `<h4>Global Leaderboard</h4>`;
      QueryResult.innerHTML = ``;
      var leaderboardArray = [];

      //List own user's points at top by applying a filter to only query currentUser
      API.graphql(graphqlOperation(listUsers, {filter:{username:{eq:currentUser}}})).then((evt) => {
        evt.data.listUsers.items.map((user, i) => {
          leaderboardArray.push(user);
          QueryResult.innerHTML += `<p>${user.username} - ${user.points}</p>`
        });
      })
      await sleep(250);
      //List other user's points by applying a filter to only query users not equal to currentUser
      API.graphql(graphqlOperation(listUsers, {filter:{username:{ne:currentUser}}})).then((evt) => {
        evt.data.listUsers.items.map((user, i) => {
          leaderboardArray.push(user);
          QueryResult.innerHTML += `<p>${user.username} - ${user.points}</p>`
        });
      })

      console.log(leaderboardArray);
      //console.log(leaderboardArray[0].points);
      console.log(leaderboardArray.sort(function(a, b){return b.items.points - a.items.points}));
    }

    getFriendLeaders();

    //controls which leaderboard is displayed
    MutationButton.addEventListener('click', (evt) => {
      friendLeadersActive = !friendLeadersActive;
      if(friendLeadersActive)
        getFriendLeaders();
      else
        getGlobalLeaders();
    });

  }

	 render() {
    return <div id='main' className = "leaderboard">
      <div className = "nav">
      <div className = "nav-right">
        <a href="#home">Home</a>
        <a href="#leaderboard" >Leaderboard</a>
        <a href="#recommendFood">Recommendations</a>
        <a href="#foodHistory">History</a>
        <a href="#bucketList">Bucket List</a>
      </div>
      </div>
      <div className = "containerLeaderBoard">
          <button id='MutationEventButton'>Change Leaderboard</button>
          <div id='MutationResult'></div>
          <div id='QueryResult'></div>
          </div>
        </div>

  }
}

