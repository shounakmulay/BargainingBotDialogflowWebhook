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

        function OrderFoodAck() {
            //trigger OrderFood intent
            //parameters to send = responseText
        }

        //get parameters from request
        //check prediction and call appropriate intent
        async function OrderDrinks() {
            //console.log("OrderDrinks: start")
            const parameters = request.body.queryResult.parameters
            //console.log("got params" + parameters)
            //console.log("call to getResJSON")
            const resJSON = await logic.getResJSON(parameters)
            //console.log("getResJSON done" + resJSON)
            response.json(resJSON)
        }

        function placeDrinksOrder() {
            //send response of placed order
            //update databases
            //trigger for order drinks counter yes
            //order drinks accept yes
            //order drinks offer low yes
            //order drinks taunt accept
        }

        /**
         * how to handle the counter
         * add paramater in json?
         * after counter limit call make new offer intent
         */
        async function counterReject() {
            //increase the quantity and make new offer
            //call counter offer again
            // const paramater = request.body.queryResult.outputContexts[1].parameters
            // let quantity = paramater.quantity
            // quantity = (quantity + ((quantity * Math.random()) + 1))
            // paramater.quantity = quantity
            // const resJSON = await logic.getResJSON(paramater)
            // response.json(resJSON)
        }

        function makeNewOffer() {
            //trigger for order drinks taunt new offer
            //order drinks offer low no
            //order drinks accept no
            //notify android to change ui for new offer?
        }


        function test() {
            agent.add('testing')
        }



        //Map functions with intents
        const intentMap = new Map()
        intentMap.set('OrderDrinks', OrderDrinks)
        intentMap.set('test', test)
        intentMap.set('OrderDrinks - Counter -no', counterReject)
        agent.handleRequest(intentMap)


    }
})


