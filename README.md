# andrebot-api

## Routes documentation
### Status codes:
- **[200]** - OK
- **[400]** - Bad request. Missing data
- **[403 | 404]** - Auth Error


### [GET] /testauth
 confirms that the server is online, connected to the db and that the authorization is working.
- auth: yes
- response content: empty
- response status: 200 = success, 403 = failed auth, 500 = correctly authed, but no db connection

###  [GET] - /andrebot/wordlerank
    fetch the wordle winners rank from the postgree db, with their victory count. If an user is from another platform, **and complete = True**, the anonymous version of their username will be used instead. If complete = False, only  requests from the chosen platforms will be shown
- auth: yes
- request content: 
```json
 "platforms": ["PLATFORM1", "PLATFORM2",...], "complete" : True|False
 ```
where PLATFORM is a subset of  ```{"telegram","web","discord","all"}```

- response content: 
```json
"rank" [ {"username": "x", "platform": "x", "count": N},...]
```


### [GET] /andrebot/winners
fetch all of the **victory events**, rather than the rank. If an user is from another platform, **and complete = True**, the anonymous version of their username will be used instead. If **complete = False**, only  requests from the chosen platforms will be shown
- auth: yes
- request content: 
```json
 "platforms": ["PLATFORM1", "PLATFORM2",...], "complete" : True|False
 ```
where PLATFORM is a subset of  ```{"telegram","web","discord","all"}```

- response content: 
```json 
"winners": [{"username": "x", "platform": "PLATFORM", "word": "x", "attempts": N, "date": date, "defeated_who": "andrebot OR username"}, ...]
```


### [POST] /andrebot/winners
add one or more wordle **victory events**
- auth: yes
- request content: 
```json 
"winners": [{"username": "x", "platform": "PLATFORM", "word": "x", "attempts": N, "date": date, "defeated_who": "andrebot OR username"}, ...]
```
- response content: empty


