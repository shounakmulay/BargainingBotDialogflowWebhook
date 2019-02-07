import * as functions from 'firebase-functions'
import * as model from './model'
const compare = require('tsscmp')
const USERNAME = functions.config().webhookauth.key
const PASSWORD = functions.config().webhookauth.id
const MODEL_NAME = "price_prediction"

//construct json object
export async function buildJSONres(eventname: string, param1: string = "", value1: any = "", extraparam1: string = "",
    extravalue1: any = "", extraparam2: string = "", extravalue2: any = "") {

    const responseObj = {
        "followupEventInput": {
            "name": eventname,
            "parameters": {
                [param1]: value1,
                [extraparam1]: extravalue1,
                [extraparam2]: extravalue2

            }
        }
    }
    return responseObj

}

//authentication check
export function check(name, pass) {
    let valid = true
    // Simple method to prevent short-circut and use timing-safe compare
    valid = compare(name, USERNAME) && valid
    valid = compare(pass, PASSWORD) && valid

    return valid
}

//parse the input params. Call ML engine
//build json res calling appropriate intent
//return json
export async function getResJSON(parameters) {

    const currentCost: number = parameters.currentCost.amount
    const quantityOld: number = parameters.quantityOld
    const userOffer: number = parameters.cost.amount
    const quantityTemp: number = parameters.quantity
    const quantity = parseInt(quantityTemp.toString())

    let instanceArray: any[][]

    //initialize parameteres, set appropriate values and return an array in proper format
    function setInstanceArray() {

        const minCost = getMinCost()
        const maxCost = getMaxCost()
        const isRegular = getIsRegular()
        const drink = { isBeer: 0, isVodka: 0, isWhisky: 0, isWine: 0 }
        const drinkName = {
            isAbsolut: 0, isBlendersPride: 0, isBlendersReserve: 0, isBudweiser: 0, isChenin: 0, isCorona: 0, isKetelOne: 0, isKingfisher: 0,
            isMagnum: 0, isRed: 0, isRedSpice: 0, isRose: 0, isSatori: 0, isSignature: 0, isSmirnoff: 0, isSmirnoffFLV: 0, isTeachers: 0, isVat69: 0,
            isWhite: 0, isHeineken: 0
        }
        const day = { isMon: 0, isTue: 0, isWed: 0, isThu: 0, isFri: 0, isSat: 0, isSun: 0 }

        Object.preventExtensions(drink)
        Object.preventExtensions(drinkName)
        Object.preventExtensions(day)

        function getMinCost(): number {
            return (currentCost - currentCost * ((getRandomInt(8, 16)) / 100))
        }

        function getMaxCost(): number {
            return (currentCost + currentCost * ((getRandomInt(5, 12)) / 100))
        }

        function getIsRegular() {
            if (parameters.regular === 1) {
                return 1
            } else {
                return 0
            }
        }

        function setDrink() {
            if (parameters.beer !== "") {
                drink.isBeer = 1
                setDrinkName(parameters.beer as string)
            } else if (parameters.whisky !== "") {
                drink.isWhisky = 1
                setDrinkName(parameters.whisky as string)
            } else if (parameters.vodka !== "") {
                drink.isVodka = 1
                setDrinkName(parameters.vodka as string)
            } else {
                drink.isWine = 1
                setDrinkName(parameters.wine as string)
            }

        }

        function setDrinkName(name: string) {
            if (drinkName.hasOwnProperty(name)) {
                drinkName[name] = 1
            }
        }

        function setDay() {
            const d = new Date()
            const utc = d.getTime() + (d.getTimezoneOffset() * 60000)
            const nd = new Date(utc + (3600000 * 5.5))
            const weekday = new Array(7);
            weekday[0] = "isSun";
            weekday[1] = "isMon";
            weekday[2] = "isTue";
            weekday[3] = "isWed";
            weekday[4] = "isThu";
            weekday[5] = "isFri";
            weekday[6] = "isSat";

            const currentDay: string = weekday[nd.getDay()];
            if (day.hasOwnProperty(currentDay)) {
                day[currentDay] = 1
            }
        }

        setDrink()
        setDay()

        const predArray = [[currentCost, minCost, maxCost, userOffer, isRegular, quantity,
            drink.isBeer, drink.isVodka, drink.isWhisky, drink.isWine, drinkName.isAbsolut, drinkName.isBlendersPride, drinkName.isBlendersReserve,
            drinkName.isBudweiser, drinkName.isChenin, drinkName.isCorona, drinkName.isKetelOne, drinkName.isKingfisher, drinkName.isMagnum, drinkName.isRed, drinkName.isRedSpice,
            drinkName.isRose, drinkName.isSatori, drinkName.isSignature, drinkName.isSmirnoff, drinkName.isSmirnoffFLV, drinkName.isTeachers, drinkName.isVat69, drinkName.isWhite,
            drinkName.isHeineken, day.isMon, day.isTue, day.isWed, day.isThu, day.isFri, day.isSat, day.isSun]]

        Object.preventExtensions(predArray)

        instanceArray = predArray
    }

    setInstanceArray()

    const data = {
        "model": MODEL_NAME,
        "instances": instanceArray
    }
    const prediction: any = await model.getPrediction(data)

    const predtictedCost = Math.round(prediction.predictions[0].outputs[0])

    //check ml response and decide which intent to call
    if (getLowLim(predtictedCost, 2, 5) < userOffer && userOffer < getHighLim(predtictedCost, 2, 5)) {
        //accept useroffer
        return await buildJSONres("OrderDrinks-AcceptEvent", "predictedCost", userOffer)
    } else if (userOffer > predtictedCost) {
        //low amount offered by bot!
        return await buildJSONres("OrderDrinks-OfferLowEvent", "predictedCost", predtictedCost)
    } else if (userOffer < getLowLim(currentCost, 35, 40)) {
        //taunt user for too low offer
        return await buildJSONres("OrderDrinks-TauntEvent", "predictedCost", predtictedCost)
    } else {
        //counter
        return await buildJSONres("OrderDrinks-CounterEvent", "predictedCost", predtictedCost, "quantity", quantity, "quantityOld", quantityOld)
    }
}

function getLowLim(amount, min, max) {
    return (amount - (amount * ((getRandomInt(min, max)) / 100)))
}
function getHighLim(amount, min, max) {
    return (amount + (amount * ((getRandomInt(min, max)) / 100)))
}

function getRandomInt(min, max) {
    const minval = Math.ceil(min);
    const maxval = Math.floor(max);
    return Math.floor(Math.random() * (maxval - minval + 1)) + min;
}

export function getDrinkName(parameters) {
    let drink: string
    if (parameters.beer !== "") {
        drink = parameters.beer as string
        return drink.substring(2)
    } else if (parameters.whisky !== "") {
        drink = parameters.whisky as string
        return drink.substring(2)
    } else if (parameters.vodka !== "") {
        drink = parameters.vodka as string
        return drink.substring(2)
    } else {
        drink = parameters.wine as string
        return drink.substring(2)
    }
}

export function getParameters(request) {
    for (const context of request.body.queryResult.outputContexts) {
        if (context.name.split("/").pop() === "orderdrinks-followup") {
            return context.parameters
        }
    }
}

export async function addDrinksOrderToDb(uid: string, drinkName: string, quantity: number, price: number) {
    const d = new Date()
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000)
    const nd = new Date(utc + (3600000 * 5.5))
    const data = {
        collectionName: 'Orders',
        data: {
            userid: uid,
            date: nd,
            drinks: {
                name: drinkName,
                price: price,
                qty: quantity
            }
        }
    }
    await model.addDatabasePubSub(data)
}
