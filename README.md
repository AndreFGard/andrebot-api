# andrebot-api

## Authentication
Methods that require admin authentication, the headers should contain the fields:
- password: (your admin password)
- platform: (your admin name)

## Platforms
Currently, the only platforms available are telegram (tg), discord (dsc) and web (web) 

## Routes documentation
### Status codes:
- **[200]** - OK
- **[400]** - Bad request. Missing data
- **[403 | 404]** - Auth Error


### [GET] /andrebot/testauth
 confirms that the server is online, connected to the db and that the authorization is working.
- auth: admin
- response content: empty
- response status: 200 = success, 403 = failed auth, 500 = correctly authed, but no db connection

###  [GET] - /andrebot/getrank
    fetch the wordle winners rank from the postgree db, with their victory count. If an user is from another platform, **and complete = True**, the anonymous version of their username will be used instead. If complete = False, only  requests from the chosen platforms will be shown
- auth: admin
- request content: 
```json
{"platforms": [(list-of-platforms)]}
 ```
- response content: 
```json
{ "rank": [
  {
    "username": "actual_username|anon_username",
    "anon_username": "lively_purple_wildebeestdsc",
    "wins": 52,
    "platform": "dsc"
  },
]}
```

### [GET] /andrebot/winners
fetch all of the **victory events**, rather than the rank. If an user is from another platform, **and complete = True**, the anonymous version of their username will be used instead. If **complete = False**, only  requests from the chosen platforms will be shown
- auth: admin
- request content: 
```json
 "platforms": ["PLATFORM1", "PLATFORM2",...], "complete" : True|False
 ```
where PLATFORM is a subset of  ```{"telegram","web","discord","all"}```

- response content: 
```json 
"winners": [{"username": "x", "platform": "PLATFORM", "word": "x", "attempts": N, "date": date, "defeated_who": "andrebot OR username"}, ...]
```


### [POST] /andrebot/addwinners
add one or more wordle **victory events**
- auth: admin
- request content: 
```json 
{
  "winners": [
    {
      "username": "username",
      "loser_username": "loser_username (can be left as Andrebot)",
      "attempts": N,
      "word": "word",
      "platform": "dsc|tg"
    }
  ]
}
```
- response content: empty

### [GET] /andrebot/timetableeditor
Returns the html relative to the main timetable editor, as well as fetch (client side) the list of relevant classes for that bachelor and the timetable itself.
