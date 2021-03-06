import React, { Component } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api'
import Amplify, { Auth, Hub } from 'aws-amplify';
import PubSub from '@aws-amplify/pubsub';
import { createUser } from './graphql/mutations'
import { listUsers, getUser } from './graphql/queries';
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
    const QueryResult = document.getElementById('QueryResult');
    const currentUser = (await Auth.currentAuthenticatedUser()).username;
    var followLeadersActive = true;

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    //This function displays the Following Leaderboard
    async function getFollowingLeaders() {
      MutationResult.innerHTML = `<h5>${currentUser}'s Following Leaderboard</h5>`;
      MutationEventButton.innerHTML=`View Global Leaderboard`;
      QueryResult.innerHTML = ``;
      var leaderboardArray = [];
      var userFollowingListArray = []

      //Push own user onto leaderboard array applying a filter to only query currentUser
      await API.graphql(graphqlOperation(listUsers, {filter:{username:{eq:currentUser}}})).then((evt) => {
        evt.data.listUsers.items.map((user, i) => {
          leaderboardArray.push(user);
        });
      })

      //put every person currentUser is following into an array
      await API.graphql(graphqlOperation(getUser, {username: currentUser})).then((evt) => {
        evt.data.getUser.following.map((following,i) => {
          userFollowingListArray.push(following);
        });
      })

      console.log(userFollowingListArray);
      //grab the data of every user being followed by currentUser and push onto leaderboard array
      await userFollowingListArray.forEach((followedUsername) => {
      	API.graphql(graphqlOperation(listUsers, {filter:{username:{eq:followedUsername}}})).then((evt) => {
	    		evt.data.listUsers.items.map((followedUser, i) => { 
	      			leaderboardArray.push(followedUser);
	    		});
	  		})
      })
      		 
      
      await sleep(750);
      console.log(leaderboardArray);

      await leaderboardArray.sort(function(a, b){return b.points - a.points});
      console.log(leaderboardArray);
      await leaderboardArray.forEach((user, i) => QueryResult.innerHTML += `<div style="display: flex; justify-content: space-between; padding: 10px; margin-left: 0px; margin-right: 40px; margin-top: 10px; margin-bottom: 10px; width: 500; border-radius: 25px; border-style: solid;"><div>${i+1}</div><div style="font-weight: bold;">${user.username}</div><div>${user.points}</div></div>`);
    }

    //This function displays the Global Leaderboard
    async function getGlobalLeaders() {
      MutationResult.innerHTML = `<h5>Global Leaderboard</h5>`;
	    MutationEventButton.innerHTML=`View Following Leaderboard`;
      QueryResult.innerHTML = ``;
      var leaderboardArray = [];
      var mtArray =[]

      //List other user's points by applying a filter to only query users not equal to currentUser
      await API.graphql(graphqlOperation(listUsers)).then((evt) => {
        evt.data.listUsers.items.map((user, i) => {
          leaderboardArray.push(user);
        });
      })
      await leaderboardArray.sort(function(a, b){return b.points - a.points});
      await leaderboardArray.forEach((user, i) => QueryResult.innerHTML += `<div style="display: flex; justify-content: space-between; padding: 10px; margin-left: 0px; margin-right: 40px; margin-top: 10px; margin-bottom: 10px; width: 500; border-radius: 25px; border-style: solid;"><div>${i+1}</div><div style="font-weight: bold;">${user.username}</div><div>${user.points}</div></div>`);
    }

    getFollowingLeaders();

    //controls which leaderboard is displayed
    MutationButton.addEventListener('click', (evt) => {
      followLeadersActive = !followLeadersActive;
      if(followLeadersActive)
        getFollowingLeaders();
      else
        getGlobalLeaders();
    });

  }

	 render() {
    return <div id='main' className = "leaderboard">
		      	<div className = "containerLeaderBoard">
		          <button id='MutationEventButton'></button>
		          <div id='MutationResult'></div>
		          <ol class="centerlist" id='QueryResult'></ol>
		        </div>
          	</div>

  }
}

