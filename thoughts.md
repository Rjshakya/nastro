# Thoughts and Ideas

## site

### router
- dev-url : nastro.xyz/pageId?slug=xzy
- prod-url : <slug>.nastro.xyz/pageId ---> <slug>.nastro.xyz/pageTitle
- client will send pageId and slug
- for dev can do , env === dev , url.search.get("slug"),
- for prod , (url.host.regex()) or remove (.nastro.xyz)
- on site cards link , dev == {dev-url} , prod=={prod-url}.
