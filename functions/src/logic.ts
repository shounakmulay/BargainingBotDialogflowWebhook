const compare = require('tsscmp')
const USERNAME = 'dialogflowbargainingbot'
const PASSWORD = 'u$wPoC4Kb49yUB#Za%vV5dx6AwwWBlXD'

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