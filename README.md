<!-- MarkdownTOC -->

- [Build a Serverless Facebook Messenger Chatbot](#build-a-serverless-facebook-messenger-chatbot)
    - [Quick Start](#quick-start)
        - [Install Serverless Framework](#install-serverless-framework)
        - [AWS Account Setup](#aws-account-setup)
        - [Facebook Setup](#facebook-setup)
        - [Setup Serverless Project](#setup-serverless-project)
        - [Setup Facebook APP](#setup-facebook-app)

<!-- /MarkdownTOC -->

<a name="build-a-serverless-facebook-messenger-chatbot"></a>
# Build a Serverless Facebook Messenger Chatbot

My tutorial article is written by chinese. ([link](http://soarlin.github.io/2016/10/07/serverless-facebook-messenger-bot/))

<a name="quick-start"></a>
## Quick Start

<a name="install-serverless-framework"></a>
### Install Serverless Framework

````
npm install -g serverless
````

<a name="aws-account-setup"></a>
### AWS Account Setup

Please refrense serverless document. [here](https://github.com/serverless/serverless/blob/master/docs/02-providers/aws/01-setup.md)

<a name="facebook-setup"></a>
### Facebook Setup

1. Create Facebook Page
2. Create Facebook Developer App
3. Add Messenger to FB APP

<a name="setup-serverless-project"></a>
### Setup Serverless Project

* clone this repo

````
git clone https://github.com/SoarLin/serverless-fb-messenger-bot.git
````

* install npm package

````
cd serverless-fb-messenger-bot
npm install
````

* setup serverless

````
vim serverless.yml
````
````
provider:
  # You can change your stage and aws region
  stage: dev
  region: ap-northeast-1

custom:
  stageVariables:
    # Remeber to setting your variables
    pageAccessToken: 'FB_Page_Access_Token'
    validationToken: 'Your_Validation_Token'
````

__Reference Image__![Reference Image](http://soarlin.github.io/images/serverless/FB-APIGateway.jpg)

* deploy service

````
serverless deploy
````

<a name="setup-facebook-app"></a>
### Setup Facebook APP

* use endpoints link (GET)

````
serverless info
````

* fill facebook webhook callback url and your verify token

__Reference Image__![webhook setting](http://soarlin.github.io/images/serverless/fb-webhook.png)

* Subscribe Page
* Done, you can talk to bot now.