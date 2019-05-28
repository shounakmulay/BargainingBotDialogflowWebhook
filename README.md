# BargainingBotDialogflowWebhook
Webhook for Dialogflow Bot deployed on Firebase Cloud Functions

This is the part of the system that provides logic to the bot. This functions takes the extracted parameters from user's message performs necessary calculations, calls the machine learning model and **triggers appropriate intent in Dialogflow with the calculated result.**

The model this functions calls to get the price for bargaining is a **[Tensorflow model](https://github.com/shounakmulay/BargainingBotTensorflowModel)** deployed on **Cloud ML Engine**.
This function takes the parameters from the JSON request and formats it to the request array for prediction. Then it triggers the appropriate intent of Dialogflow with the received prediction from the ML model.

### View the entire System Architecture [here](https://github.com/shounakmulay/BargainingBot)

##

### Try it for yourself:
This repo is part of the [Bargaining Bot](https://github.com/shounakmulay/BargainingBot) project.

* Clone this repo and then follow [this link](https://firebase.google.com/docs/functions/get-started) to setup firebase cloud functions and deploy this function.
* This function uses basic auth for http request authentication. You will need to add the username and password to the dialogflow console and also as environment variables in firebase.


This function won't work just yet. You will need to train and deploy a Tensorflow model and link it to this function. Continue with the instructions on [Bargaining Bot](https://github.com/shounakmulay/BargainingBot).
