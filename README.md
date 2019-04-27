# BargainingBotDialogflowWebhook
Webhook for Dialogflow Bot deployed on Firebase Cloud Functions

This is the part of the system that provides logic to the bot. This functions takes the extracted parameters from user's message performs necessary calculations, calls the machine learning model and **triggers appropriate intent in Dialogflow with the calculated result.**

The model this functions calls to get the price for bargaining is a **[Tensorflow model](https://github.com/shounakmulay/BargainingBotTensorflowModel)** deployed on **Cloud ML Engine**.

### View the entire System Architecture [here](https://github.com/shounakmulay/BargainingBot)
