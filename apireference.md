https://developer.valvesoftware.com/wiki/Steam_Web_API#GetGlobalAchievementPercentagesForApp_.28v0001.29

Formats

Every method can return its results in 3 different formats: JSON, XML, and VDF. Each format represents the data described herein differently:
JSON

    The API returns an object containing the named object with the result data.
    Arrays are represented as an array with the name of the type of the objects in the array (ie. an object named "items" containing an array of objects of type "item" would be represented as an object named "items" containing an array named "item" containing several objects following the "item" structure).
    Null is represented as JSON's null.

XML

    XML Attributes are not used.
    Arrays are represented as a series of sub-elements in the containing element of the type of the array.
    Null is represented by the word "null" between the element's tags.

VDF (Valve Data Format)

    This is Valve's internal data format, as seen in uses like TF2's "scripts" folder (available in "team fortress 2 client content.gcf"). TF2's GetSchema returns data similar to "items/items_game.txt" (although qualities are not expanded into objects with a "value" field).
    Documentation of the format is in progress here.
    Arrays in the data are represented as a VDF array with the name of the type of the objects in the array, with a VDF array being an object with each item being prefixed with its numeric key as a quoted string.
    Null is represented as an empty string.

If no format is specified, the API will default to JSON.
Interfaces and method

All interfaces and method are self-documented through the ISteamWebAPIUtil/GetSupportedAPIList call. This can be found here.

When passed a key=<your API key> parameter, GetSupportedAPIList will show all APIs that your key can access. Without it (as above), it only displays APIs that do not require an API key.
Game interfaces and methods

Team Fortress 2 functions are described at http://wiki.teamfortress.com/wiki/WebAPI.
GetNewsForApp (v0002)

GetNewsForApp returns the latest of a game specified by its appID.

Example URL: http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json
Arguments

    appid
        AppID of the game you want the news of.
    count
        How many news enties you want to get returned.
    maxlength
        Maximum length of each news entry.
    format
        Output format. json (default), xml or vdf.

Result layout

An appnews object containing:

    appid, the AppID of the game you want news of
    newsitems, an array of news item information:
        An ID, title and url.
        A shortened excerpt of the contents (to maxlength characters), terminated by "..." if longer than maxlength.
        A comma-separated string of labels and UNIX timestamp.

GetGlobalAchievementPercentagesForApp (v0002)

Returns on global achievements overview of a specific game in percentages.

Example: http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440&format=xml
Arguments

    gameid
        AppID of the game you want the news of.
    format
        Output format. json (default), xml or vdf.

GetPlayerSummaries (v0002)

Example URL: http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=XXXXXXXXXXXXXXXXXXXXXXX&steamids=76561197960435530 (This will show Robin Walker's profile information.)

Returns basic profile information for a list of 64-bit Steam IDs.
Arguments

    steamids
        Comma-delimited list of 64 bit Steam IDs to return profile information for. Up to 100 Steam IDs can be requested.
    format
        Output format. json (default), xml or vdf.

Return Value

Some data associated with a Steam account may be hidden if the user has their profile visibility set to "Friends Only" or "Private". In that case, only public data will be returned.
Public Data

    steamid
        64bit SteamID of the user
    personaname
        The player's persona name (display name)
    profileurl
        The full URL of the player's Steam Community profile.
    avatar
        The full URL of the player's 32x32px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
    avatarmedium
        The full URL of the player's 64x64px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
    avatarfull
        The full URL of the player's 184x184px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
    personastate
        The user's current status. 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play. If the player's profile is private, this will always be "0", except is the user has set their status to looking to trade or looking to play, because a bug makes those status appear even if the profile is private.
    communityvisibilitystate
        This represents whether the profile is visible or not, and if it is visible, why you are allowed to see it. Note that because this WebAPI does not use authentication, there are only two possible values returned: 1 - the profile is not visible to you (Private, Friends Only, etc), 3 - the profile is "Public", and the data is visible. Mike Blaszczak's post on Steam forums says, "The community visibility state this API returns is different than the privacy state. It's the effective visibility state from the account making the request to the account being viewed given the requesting account's relationship to the viewed account."
    profilestate
        If set, indicates the user has a community profile configured (will be set to '1')
    lastlogoff
        The last time the user was online, in unix time.
    commentpermission
        If set, indicates the profile allows public comments.

Private Data

    realname
        The player's "Real Name", if they have set it.
    primaryclanid
        The player's primary group, as configured in their Steam Community profile.
    timecreated
        The time the player's account was created.
    gameid
        If the user is currently in-game, this value will be returned and set to the gameid of that game.
    gameserverip
        The ip and port of the game server the user is currently playing on, if they are playing on-line in a game using Steam matchmaking. Otherwise will be set to "0.0.0.0:0".
    gameextrainfo
        If the user is currently in-game, this will be the name of the game they are playing. This may be the name of a non-Steam game shortcut.
    cityid
        This value will be removed in a future update (see loccityid)
    loccountrycode
        If set on the user's Steam Community profile, The user's country of residence, 2-character ISO country code
    locstatecode
        If set on the user's Steam Community profile, The user's state of residence
    loccityid
        An internal code indicating the user's city of residence. A future update will provide this data in a more useful way.
        steam_location gem/package makes player location data readable for output.
            An updated readable list can be found at quer's steam location
        Getting locstatecode and loccityid, can now be done from https://steamcommunity.com/actions/QueryLocations/<loccountrycode>/<locstatecode>/

GetFriendList (v0001)

Returns the friend list of any Steam user, provided their Steam Community profile visibility is set to "Public".

Example URL: http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&steamid=76561197960435530&relationship=friend
Arguments

    steamid
        64 bit Steam ID to return friend list for.
    relationship
        Relationship filter. Possibles values: all, friend.
    format
        Output format. json (default), xml or vdf.

Result data

The user's friends list, as an array of friends. Nothing will be returned if the profile is private.

    steamid
        64 bit Steam ID of the friend.
    relationship
        Relationship qualifier
    friend_since
        Unix timestamp of the time when the relationship was created.

GetPlayerAchievements (v0001)

Returns a list of achievements for this user by app id

Example URL: http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&steamid=76561197972495328
Arguments

    steamid
        64 bit Steam ID to return friend list for.
    appid
        The ID for the game you're requesting
    l (Optional)
        Language. If specified, it will return language data for the requested language.

Result data

A list of achievements.

    apiname
        The API name of the achievement
    achieved
        Whether or not the achievement has been completed.
    unlocktime
        Date when the achievement was unlocked.
    name (optional)
        Localized achievement name
    description (optional)
        Localized description of the achievement

GetUserStatsForGame (v0002)

Returns a list of achievements for this user by app id

Example URL: http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&steamid=76561197972495328
Arguments

    steamid
        64 bit Steam ID to return friend list for.
    appid
        The ID for the game you're requesting
    l (Optional)
        Language. If specified, it will return language data for the requested language.


GetOwnedGames (v0001)

GetOwnedGames returns a list of games a player owns along with some playtime information, if the profile is publicly visible. Private, friends-only, and other privacy settings are not supported unless you are asking for your own personal details (ie the WebAPI key you are using is linked to the steamid you are requesting).

Example URL: http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=XXXXXXXXXXXXXXXXX&steamid=76561197960434622&format=json
Arguments

    steamid
        The SteamID of the account.
    include_appinfo
        Include game name and logo information in the output. The default is to return appids only.
    include_played_free_games
        By default, free games like Team Fortress 2 are excluded (as technically everyone owns them). If include_played_free_games is set, they will be returned if the player has played them at some point. This is the same behavior as the games list on the Steam Community.
    format
        Output format. json (default), xml or vdf.
    appids_filter
        You can optionally filter the list to a set of appids. Note that these cannot be passed as a URL parameter, instead you must use the JSON format described in Steam_Web_API#Calling_Service_interfaces. The expected input is an array of integers (in JSON: "appids_filter: [ 440, 500, 550 ]" )

Result layout

    game_count the total number of games the user owns (including free games they've played, if include_played_free_games was passed)
    A games array, with the following contents (note that if "include_appinfo" was not passed in the request, only appid, playtime_2weeks, and playtime_forever will be returned):
        appid Unique identifier for the game
        name The name of the game
        playtime_2weeks The total number of minutes played in the last 2 weeks
        playtime_forever The total number of minutes played "on record", since Steam began tracking total playtime in early 2009.
        img_icon_url, img_logo_url - these are the filenames of various images for the game. To construct the URL to the image, use this format: http://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{hash}.jpg. For example, the TF2 logo is returned as "07385eb55b5ba974aebbe74d3c99626bda7920b8", which maps to the URL: [1]
        has_community_visible_stats indicates there is a stats page with achievements or other game stats available for this game. The uniform URL for accessing this data is http://steamcommunity.com/profiles/{steamid}/stats/{appid}. For example, Robin's TF2 stats can be found at: http://steamcommunity.com/profiles/76561197960435530/stats/440. You may notice that clicking this link will actually redirect to a vanity URL like /id/robinwalker/stats/TF2

GetRecentlyPlayedGames (v0001)

GetRecentlyPlayedGames returns a list of games a player has played in the last two weeks, if the profile is publicly visible. Private, friends-only, and other privacy settings are not supported unless you are asking for your own personal details (ie the WebAPI key you are using is linked to the steamid you are requesting).

Example URL: http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=XXXXXXXXXXXXXXXXX&steamid=76561197960434622&format=json
Arguments

    steamid
        The SteamID of the account.
    count
        Optionally limit to a certain number of games (the number of games a person has played in the last 2 weeks is typically very small)
    format
        Output format. json (default), xml or vdf.

Result layout

    total_count the total number of unique games the user has played in the last two weeks. This is mostly significant if you opted to return a limited number of games with the count input parameter
    A games array, with the following contents:
        appid Unique identifier for the game
        name The name of the game
        playtime_2weeks The total number of minutes played in the last 2 weeks
        playtime_forever The total number of minutes played "on record", since Steam began tracking total playtime in early 2009.
        img_icon_url, img_logo_url - these are the filenames of various images for the game. To construct the URL to the image, use this format: http://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{hash}.jpg. For example, the TF2 logo is returned as "07385eb55b5ba974aebbe74d3c99626bda7920b8", which maps to the URL: [2]

Community pages parameters

Most of Steam Community information can be returned in XML format by appending ?xml=1 to their URLs. This method does not require API key.
Community data

The Steam community data interface (XML only) is described here: https://partner.steamgames.com/documentation/community_data


Calling Service interfaces

There is a new style of WebAPI which we refer to as "Services". They function in many ways like the WebAPIs you are used to, the main difference being that all service APIs will accept their arguments as a single JSON blob in addition to taking them as GET or POST parameters. To pass in data as JSON, invoke the webapi with a parameter set like:

?key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&format=json&input_json={steamid: 76561197972495328}

Note that the JSON will need to be URL-encoded. The "key" and "format" fields should still be passed as separate parameters, as before. POST requests are supported as well.

You can identify if a WebAPI is a "Service" by the name of the interface; if it ends in "Service" like "IPlayerService", then it supports this additional method of passing parameter data. Some Service methods have parameters that are more complex structures and require this different input format. 