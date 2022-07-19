

# Build Tools

This build tool is designed to provide automation for uploading metadata to Salesforce Commerce Cloud instances. 
<br/>
<i>See https://github.com/SalesforceCommerceCloud/sfcc-ci</i>

<br/>

## Prerequisites

**Grant your API key access to your instances**
<br/>
In order to perform CLI commands, you have to permit API calls to the Commerce Cloud instance(s) you wish to integrate with. You do that by modifying the Open Commerce API Settings as well as the WebDAV Client Permissions on the Commerce Cloud instance.
<br/>
<br/>

#### 1. Add WebDav Client Permissions

Use the following snippet as your client's permission set, replace my_client_id with your client ID. Note, if you already have WebDAV Client Permissions configured, e.g. for other API keys, you have to merge this permission set into the existing list of permission sets for the other clients.

* Navigate to Administration > Organization > WebDAV Client Permissions
* Add the permission set for your client ID to the permission settings.


```sh
{
      "clients":
      [
        {
          "client_id": "insert_my_client_id",
          "permissions":
          [
            {
              "path": "/impex",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/cartridges",
              "operations": [
                "read_write"
              ]
            }
          ]
        }
      ]
    }
```
<br/>
<br/>

#### 2. Open Commerce API Settings (OCAPI) 
* Log into the Business Manager
* Navigate to `Administration > Site Development > Open Commerce API Settings`
* Make sure, that you select `Data API and Global` from the select boxes
* Add the permission set for your client ID to the settings

Data
```sh
{
  "_v": "19.1",
  "clients": [
    {
      "client_id": "insert_my_client_id",
      "resources": [
        {
          "resource_id":"/code_versions",
          "methods":["get"],
          "read_attributes":"(**)",
          "write_attributes":"(**)"
        },
        {
          "resource_id":"/jobs/*/executions",
          "methods":["post"],
          "read_attributes":"(**)",
          "write_attributes":"(**)"
        },
        {
          "resource_id": "/code_versions/*",
          "methods": [
            "patch"
          ],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        },
        {
          "resource_id": "/jobs/*/executions",
          "methods": [
            "post",
            "get"
          ],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        },
        {
          "resource_id": "/jobs/*/executions/*",
          "methods": [
            "get"
          ],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        },
        {
          "resource_id": "/custom_objects/**/*",
          "methods": [
            "put",
            "get",
            "patch",
            "delete"
          ],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        },
        {
          "resource_id": "/customer_lists/**/customers/*",
          "methods": [
            "put",
            "post"
          ],
          "read_attributes": "(**)",
          "write_attributes": "(**)"
        }
      ]
    }
  ]
}
```
<br/>
<br/>

### Update dw.json file
You will need to update your dw.json file with the following additional paramters:
- client-id -- The same client id you used in the ocapi and webdev permissions above
- client-secret -- The same secret you used in the ocapi and webdev permissions above
- dataBundle -- this should be whatever value you want from the `package.json::dataBundles` array. 


Full `dw.json` example
```sh
{
  "hostname": "devXX-na01-org.demandware.net",
  "username": "",
  "password": "",
  "code-version": "",
  "client-id": "",
  "client-secret": "",
  "dataBundle": "",
  "jobBundle": ""
}
```

i.e. with databundle and job bundle values
```sh
"dataBundle": "test_data_core",
"jobBundle": "authz"
```

<br/>

# How to use:

To use:

* cd into `./src`
* run the following command:
```sh
npm run uploadData
```
<br/>
<br/>


## Alternatively, Running Manually:
- `cd` into the `~/src` directory.
- Run the following command:

```sh
node build-tools/build --deploy-data
```

<br/>
<br/>

## Troubleshooting

Having trouble running the `npm run uploadData` command?
<br/>

Within the `/src/package.json` file, make sure you have the following entry:

```sh
scripts: {
  "uploadData": "node build-tools/build --deploy-data"
}
```

