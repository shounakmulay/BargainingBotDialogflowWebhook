//Initialize and import
import * as functions from 'firebase-functions';
import * as logic from "./logic"
const { WebhookClient } = require('dialogflow-fulfillment')
const admin = require('firebase-admin')
const auth = require('basic-auth')
admin.initializeApp()



//Cloud Function
export const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    const agent = new WebhookClient({ request, response })

    const credentials = auth(request)

    if (!credentials || !logic.check(credentials.name, credentials.pass)) {
        response.statusCode = 401
        response.setHeader('WWW-Authenticate', 'Basic Auth')
        response.end('Access denied')
    } else {
        // Access Granted

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

        async function OrderDrinks() {
            //get parameters from request
            //check prediction and call appropriate intent
            const data = request.body
            const parameters = data.parameters
            const resToSend = await logic.getResToSend(parameters)
            response.json(resToSend)
        }

        function test() {
            agent.add('testing')
        }



        //Map functions with intents
        const intentMap = new Map()
        intentMap.set('FirstWelcomeTrigger', trigFirstWelcome)
        intentMap.set('FirstWelcomeRegUserTrigger', trigFirstWelcomeRegUser)
        intentMap.set('OrderDrinks', OrderDrinks)
        intentMap.set('test', test)
        agent.handleRequest(intentMap)


    }
})


