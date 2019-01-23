import { google } from 'googleapis'
const ml = google.ml('v1')

export async function getPrediction(data) {
    //get prediction
    const instances = data.instances
    const model = data.model


    const { credential } = await google.auth.getApplicationDefault()

    const modelName = `projects/priceprediction-8026a/models/${model}`

    const preds = await ml.projects.predict({
        auth: credential,
        name: modelName,
        requestBody: {
            instances
        }
    } as any)

    return preds.data

}
