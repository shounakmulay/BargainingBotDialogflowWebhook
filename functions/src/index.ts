//Initialize and import
import * as functions from 'firebase-functions';
const logic = require("./logic")
const { WebhookClient } = require('dialogflow-fulfillment')
const admin = require('firebase-admin')
const auth = require('basic-auth')
admin.initializeApp()



//Cloud Function
export const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response })


    const credentials = auth(request)
    // The "check" function will typically be against your user store
    if (!credentials || !logic.check(credentials.name, credentials.pass)) {
        response.statusCode = 401
        response.setHeader('WWW-Authenticate', 'Basic Auth')
        response.end('Access denied')
    } else {
        // response.end('Access granted')

        function trigFirstWelcome() {
            //trigger first welcome intent 
            const res = logic.buildJSONres("FirstWelcomeEvent", "userName", "Rishabh")//remove hardcoded string, get name dynamically
            response.json(res)
        }

        function trigFirstWelcomeRegUser() {
            //trigger first welcome reg user intent
            const res = logic.buildJSONres("FirstWelcomeRegUserEvent", "userName", "Shounak")//remove hardcoded string, get name dynamically
            response.json(res)
        }

        function OrderFoodConfirmation() {
            //trigger OrderFood intent
            //parameters to send = responseText
        }

        function OrderDrinks() {
            //get parameters from request
            //call ML engine with those params
            //check prediction and call appropriate intent
        }

        function test() {
            agent.add('testing')
        }



        //Map functions with intents
        const intentMap = new Map()
        intentMap.set('FirstWelcomeTrigger', trigFirstWelcome)
        intentMap.set('FirstWelcomeRegUserTrigger', trigFirstWelcomeRegUser)
        intentMap.set('test', test)
        agent.handleRequest(intentMap)


    }
})


