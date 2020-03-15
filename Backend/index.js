'use strict';
var telegram = require('telegram-bot-api');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('b0bfcf8a25a14ffb80a7817f72488993');




process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;


admin.initializeApp(functions.config().firebase);



exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function loadVOZ(agent) {
    var numberCount = parseInt(agent.parameters.number);

    if (isNaN(numberCount)) {
      numberCount = 10;
    }
    return admin.firestore().collection("News").orderBy("count").limit(numberCount).get().then(data => {
          var responses = [];
          if (data.docs.length > 0) {
            data.docs.forEach((doc,i) => {
               console.log(doc.data().title);
               responses.push(doc.data().title);
               responses.push(doc.data().url);
            });
             console.log(responses);
             agent.add(responses);
          } else {
             agent.add("Новостей нет");
          }
          agent.add(responses);
      }).catch(e => {
    	agent.add(["Упс... у нас ошибка появилась", "Разработчики обязательно исправят это"]);
      });
  }



  function loadNotifications (agent) {
    var numberCount = parseInt(agent.parameters.number);
    console.log("OUR NUMBER IS: " + numberCount);
    if (isNaN(numberCount)) {
      numberCount = 5;
    }

    return newsapi.v2.everything({
      q: 'Коронавирус казахстан',
      sortBy: 'publishedAt',
      pageSize: numberCount + 1
    }).then(response => {
      var responses = [];
	  var articles = response.articles;
      console.log(articles);
      for (var i = 0; i<articles.length-1; i++) {
      	var object = articles[i];
        responses.push(object.title);
        responses.push(object.url);
      }
      agent.add(responses);
    }).catch(e => {
      agent.add(["Упс... у нас ошибка появилась", "Разработчики обязательно исправят это"]);
    });
  }

  function subscribe (agent) {
    var id = request.body.originalDetectIntentRequest.payload.data.chat.id;
    return admin.firestore().collection("subscribe").doc(id).set({
    	a: true
    }).then(function(){
      return agent.add("Успешно");
    });
  }
  function otpiska (agent) {
  	var id = request.body.originalDetectIntentRequest.payload.data.chat.id;
    return admin.firestore().collection("subscribe").doc(id).delete().then(function(){
      return agent.add("Успешно");
    });
  }

  function yourFunctionHandler(agent) {
     agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
     agent.add(new Card({
         title: `Title: this is a card title`,
         imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
         text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
         buttonText: 'This is a button',
         buttonUrl: 'https://assistant.google.com/'
       })
     );
     agent.add(new Suggestion(`Quick Reply`));
     agent.add(new Suggestion(`Suggestion`));
   }

  function worldStats (agent) {
    return fetch('https://covid19.mathdro.id/api', {method: 'GET'})
      .then(res => res.json()) // expecting a json response
      .then(function(json) {
      console.log(json);
      var text = "Статистика мира: ";
      var text1 = "🦠 Всего зараженных: " + json.confirmed.value;
      var text2 = "💊 Количество смертей: " + json.deaths.value;
      var text3 = "🌡 Выздоровели: " + json.recovered.value;
      agent.add([text, text1, text2, text3]);
    });
  }


   function kazakhstanSituation (agent) {
     //https://api-dev.vlife.kz/covid19/v1/status
     //https://covid19.mathdro.id/api/countries/Kazakhstan
     return fetch('https://api-dev.vlife.kz/covid19/v1/status', {method: 'GET'})
      .then(res => res.json()) // expecting a json response
      .then(function(json) {
       	console.log(json);
        var text = "Статистика Казахстана: ";
     	var text1 = "🦠 Всего зараженных: " + json.infected;
		var text2 = "💊 Количество смертей: " + json.deaths;
        var text3 = "🌡 Выздоровели: " + json.recovered;
        agent.add([text, text1, text2, text3]);
     });
   }




   function analysis (agent) {
      var data = {
      	"lichoradka": ["Лихорадка","Часто"],
        "kashel": ["Кашель", "Почти всегда, Сухой"],
        "slabost": ["Слабость", "Часто"],
        "odyshka": ["Одышка", "Может быть"],
        "golova": ["Головная боль", "Редко"],
        "lomota": ["Ломота в теле", "Редко"],
        "gorlo": ["Боль в горле", "Редко"],
        "oznob": ["Озноб", "Практически нет"],
        "chichanie": ["Чихание", "Не характерно"]
      };
      var symps = [];
      var text = "";
      for (var i in Object.keys(agent.parameters)) {
        var parameter = Object.keys(agent.parameters)[i];
		var lastPoint = ",";
        if (i + 1 == Object.keys(agent.parameters).length) {
          lastPoint = ".";
        }
        if (!symps.includes(parameter) && agent.parameters[parameter] !== "") {
         text += data[parameter][0] + " - " + data[parameter][1] + lastPoint;
		 symps.push(parameter);
        }
      }
      agent.add("Симптомы коронавируса: ");
      agent.add(text);
    }


  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Statistics', kazakhstanSituation);
  intentMap.set('Analysis', analysis);
  intentMap.set('World', worldStats);
  intentMap.set('Subscribe', subscribe);
  intentMap.set('Otpiska', otpiska);
  intentMap.set('VOZ', loadVOZ);
  intentMap.set('Notifications', loadNotifications);

  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});


exports.sendMessage = functions.https.onCall((data, context) => {
	const title = data.title; const url = data.url;
  	return admin.firestore().collection("subscribe").get().then(data => {
      if (data.docs.length > 0) {
        data.docs.forEach((document, i) => {
          api.sendMessage({
              chat_id: document.id,
              text: url
          });
        });
        return {text: "SUCCESS"};
      } else {
        return {text: "SUCCESS"};
      }
    });
});
