# ProPresenter : Planning Center Middleware

This application was created in order to connect ProPresenter to Planning Center Live.

The idea is that when the ProPresenter user clicks to the next slide or next section, Planning Center will register the change and move to the next item.

This code was written in Node.js.

To start, go into the API directory and run the following commands: `npm install` and `npm run`.

Utilized .env variables outside of the API directory.

## Planning Center

PLANCTRPROD_APP_ID=Your Application ID found in `https://api.planningcenteronline.com/oauth/applications`
PLANCTRPROD_SECRET_KEY=Your Secret key found in `https://api.planningcenteronline.com/oauth/applications`  
PLANCTR_BASE_URL=`https://api.planningcenteronline.com/services/v2/service_types`  
PLANCTR_CAMPUS_NAME=Found in `https://services.planningcenteronline.com/dashboard/`

**Created a second _service type_ as a testing account**  
PLANCTR_DEV_CAMPUS_NAME="Dev's Test"  
PLANCTR_API_ID=123456

## ProPresenter Data

**Prod environment**  
PRO_PRESENTER_IP_REG='10.1.21.29'  
PRO_PRESENTER_PORT_REG='1025'  
PRO_PRESENTER_TYPE_REG='remote'

**Local dev environment**  
PRO_PRESENTER_IP_LOCAL='192.168.0.3'  
PRO_PRESENTER_PORT_LOCAL='1025'  
PRO_PRESENTER_TYPE_LOCAL='remote'
