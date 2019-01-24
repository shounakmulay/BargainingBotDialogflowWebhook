import * as model from './model'
const compare = require('tsscmp')
const USERNAME = 'dialogflowbargainingbot'
const PASSWORD = 'u$wPoC4Kb49yUB#Za%vV5dx6AwwWBlXD'
const MODEL_NAME = "price_prediction"

export function buildJSONres(eventname: String, param: string, value1) {
    //construct json object
    const responseObj = {
        "followupEventInput": {
            "name": eventname,
            "parameters": {
                [param]: value1
            }
        }
    }

    return responseObj
}


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
    const currentCost = parameters.currentCost.amount
    const userOffer = parameters.cost.amount
    let instanceArray: any[][]
    function setInstanceArray() {


        const quantity = parameters.quantity
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
        //accept intent
        return buildJSONres("OrderDrinks-AcceptEvent", "acceptedCost", userOffer)
    } else if (userOffer > predtictedCost) {
        //low amount offered by bot!
        //counter low intent
        return buildJSONres("OrderDrinks-OfferLowEvnet", "predictedCost", predtictedCost)
    } else if (userOffer < getLowLim(currentCost, 35, 40)) {
        //taunt user for too low offer
        //taunt intent
        return buildJSONres("OrderDrinks-TauntEvent", "predictedCost", predtictedCost)
    } else {
        //counter
        //counter intent
        return buildJSONres("OrderDrinks-CounterEvent", "predictedCost", predtictedCost)
    }


}

function getLowLim(amount, min, max) {
    return (amount - (amount * ((getRandomInt(min, max)) / 100)))
}
function getHighLim(amount, min, max) {
    return (amount + (amount * ((getRandomInt(min, max)) / 100)))
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}