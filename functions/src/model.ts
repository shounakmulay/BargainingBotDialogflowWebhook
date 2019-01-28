import { google } from 'googleapis'
const ml = google.ml('v1')
const { PubSub } = require('@google-cloud/pubsub')

export async function getPrediction(data) {
    //get prediction
    const instances = data.instances
    const model = data.model


    const { credential } = await google.auth.getApplicationDefault()

    const modelName = `projects/bargainingbot/models/${model}`

    const preds = await ml.projects.predict({
        auth: credential,
        name: modelName,
        requestBody: {
            instances
        }
    } as any)

    return preds.data

}

// export async function addDrinksOrderToDb(db, data) {

//     await db.collection('Orders').add(data)
//         .then(ref => console.log('Added document to Orders with ID: ', ref.id))

// }

export async function addDatabasePubSub(jsonData) {
    const pubsub = new PubSub()

    const topicName = 'add-to-firestore'
    const data = JSON.stringify(jsonData)

    const dataBuffer = Buffer.from(data)

    const messageId = await pubsub.topic(topicName).publish(dataBuffer)
    console.log(`Message ${messageId} published.`)

}
