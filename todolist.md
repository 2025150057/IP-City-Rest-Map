Followed by a pdf's service scenario.



# handling a gps data.
0. before runtime, get locations of seoul city data api and calc it's gps locs.
1. user sends a server gps data.
2. server gets a gps data. 
3. server finds a closest location of 0.

# handling a seoul api.
1. server sends a request to seoul api.
2. api sends a response(density datas, mirco dust datas) to server.
3. server parses the response and sends it to the front-end.

# handling a kakao api.
1. server sends a request to kakao api.
2. api sends a place datas to server.

# handling a weight.
1. user sends a preallocated weights to server.
2. server calculates a place's scores according to 1.
3. server sends a ranking list to user.
4. user chooses a place.
5. server sends a detailed datas, and server modifies weights.
6. user modifies weights.

# frontend work
0. design front-end.
1. get places data and show it at graph using d3.js and sigma.js

