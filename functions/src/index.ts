//Initialize and import
import * as functions from 'firebase-functions';
import * as logic from "./logic"
const { WebhookClient } = require('dialogflow-fulfillment')
const admin = require('firebase-admin')
const auth = require('basic-auth')
admin.initializeApp(functions.config().firebase)

/**
 * Add response suggestions?
 * const{Card , Suggestions} = require('dialogflow-fulfillment')
 */
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



        /**
         * Should ordering food call dialogflow?
         * or respond locally?
         * add cards?
         */
        function OrderFoodAck() {
            //trigger OrderFood intent
            //parameters to send = responseText

        }

        //get parameters from request
        //check prediction and call appropriate intent
        async function orderDrinks() {

            const parameters = request.body.queryResult.parameters

            const resJSON = await logic.getResJSON(parameters)
            response.json(resJSON)
        }

        async function placeDrinksOrder() {

            const parameters = logic.getParameters(request)
            const drinkName = logic.getDrinkName(parameters)
            const quantity = parameters.quantity
            const price = parameters.predictedCost
            const uid = parameters.uid

            const addDrinksPromise = logic.addDrinksOrderToDb(uid, drinkName, quantity, price)

            const buildJSONPromise = logic.buildJSONres("PlaceDrinksOrderEvent", "drinkName", drinkName, "quantity", quantity, "price", price)

            await Promise.all([addDrinksPromise, buildJSONPromise])
                .then(([voidRes, JSONRes]) => response.json(JSONRes))
                .catch((reason) => console.error("Promise.all rejected : " + reason))


        }



        //increase the quantity and make new offer
        //call counter offer again
        async function counterReject() {
            const displayName = request.body.queryResult.intent.displayName

            switch (displayName) {
                case "OrderDrinks - Counter - no": {
                    // const queryResult = request.body.queryResult

                    const parameter = logic.getParameters(request)

                    let quantity = parameter.quantity
                    parameter.quantityOld = quantity
                    quantity = Math.round((quantity + ((quantity * Math.random()) + 1)))
                    parameter.quantity = quantity


                    response.json(await logic.getResJSON(parameter))
                }
                    break;
                case "OrderDrinks - Counter - no - no": {
                    // const queryResult = request.body.queryResult
                    const paramater = logic.getParameters(request)
                    const quantityOld = paramater.quantityOld
                    paramater.quantity = quantityOld
                    paramater.quantityOld = ""

                    response.json(await logic.getResJSON(paramater))
                }
            }
        }




        /**
         * TODO
         * notify android to change ui for new offer?
         * reset contexts
         * use pub/sub?
         */
        async function makeNewOffer() {

            const displayName = request.body.queryResult.intent.displayName
            switch (displayName) {
                case "OrderDrinks - Taunt - NewOffer": {//working

                    response.json(await logic.buildJSONres("MakeNewOfferEvent", "tauntResponse", "Make a new offer!"))
                }
                    break;
                case "OrderDrinks - Counter - no - no - no": {//working

                    response.json(await logic.buildJSONres("MakeNewOfferEvent"))
                }
                    break;
                case "OrderDrinks - Accept - no": {//working

                    response.json(await logic.buildJSONres("MakeNewOfferEvent"))
                }
                    break;
                case "OrderDrinks - Offer Low - no": {//working

                    response.json(await logic.buildJSONres("MakeNewOfferEvent"))
                }
                    break;
            }



        }

        //reset all contexts
        function orderDrinksCancel() {

            const resObj = {
                "outputContexts": []
            }

            response.json(resObj)

        }

        //Map functions with intents
        const intentMap = new Map()
        intentMap.set('OrderDrinks', orderDrinks)
        intentMap.set('OrderDrinks - Counter - no', counterReject)
        intentMap.set('OrderDrinks - Counter - no - no', counterReject)
        intentMap.set('OrderDrinks - Offer Low - no', makeNewOffer)
        intentMap.set('OrderDrinks - Accept - no', makeNewOffer)
        intentMap.set('OrderDrinks - Counter - no - no - no', makeNewOffer)
        intentMap.set('OrderDrinks - Taunt - NewOffer', makeNewOffer)
        intentMap.set('OrderDrinks - Cancel', orderDrinksCancel)
        intentMap.set('OrderDrinks - Counter - yes', placeDrinksOrder)
        intentMap.set('OrderDrinks - Counter - no - yes', placeDrinksOrder)
        intentMap.set('OrderDrinks - Counter - no - no - yes', placeDrinksOrder)
        intentMap.set('OrderDrinks - Accept - yes', placeDrinksOrder)
        intentMap.set('OrderDrinks - Offer Low - yes', placeDrinksOrder)
        intentMap.set('OrderDrinks - Taunt - Accept', placeDrinksOrder)

        agent.handleRequest(intentMap)


    }
})
