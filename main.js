// @ts-nocheck
'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;

class Steam extends utils.Adapter
{

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options)
	{
		super({
			...options,
			name: 'steam',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));
		this.on('objectChange', this.onObjectChange.bind(this));
		this.requestClient = axios.create();
		this.SteamApiClient = null;
		this.refreshStateTimeout = null;
		this.lastStatus = null;
	} //end constructor

	async onReady()
	{
		// check current configuration
		if (!this.config.userid)
		{
			this.log.error(`userid is empty - please check instance configuration of $(this.namespace)`);
			return;
		}
		if (!this.config.steamapikey)
		{
			this.log.error(`steamapikey is empty - please check instance configuration of $(this.namespace`);
			return;
		}

		this.SteamApiClient = axios.create({
			baseURL: 'http://api.steampowered.com',
			timeout: 1000,
			responseType: 'json',
			responseEncoding: 'utf8',
			validateStatus: (status) => {
				return [200, 201, 401].includes(status);
			},
		});


		this.refreshGlobalState();
		this.refreshState();
	}

	async refreshGlobalState()
	{
		const SteamApiResponse = await this.SteamApiClient.get(`/ISteamUser/GetPlayerSummaries/v0002/?key=${this.config.steamapikey}&steamids=${this.config.userid}`);
		//this.log.debug(`SteamApiResponse ${SteamApiResponse.status}: ${JSON.stringify(SteamApiResponse.data)}`);

		if (SteamApiResponse.status === 200) {
			const steamInfo = SteamApiResponse.data.response.players[0];

			//Convert from Unix Time to DateString
			const accountcreated=new Date(steamInfo.timecreated * 1000);
			const lastlogoff=new Date(steamInfo.lastlogoff * 1000);

			await this.setStateAsync('data.accountcreated', accountcreated.toDateString(), true);
			await this.setStateAsync('data.accountname', steamInfo.personaname, true);
			await this.setStateAsync('data.profileurl',steamInfo.profileurl, true);
			await this.setStateAsync('data.visibility',!!steamInfo.communityvisibilitystate, true);
			await this.setStateAsync('data.profilestate',!!steamInfo.profilestate, true);
			await this.setStateAsync('data.lastlogoff',lastlogoff.toDateString(), true);
			await this.setStateChangedAsync('data.realname',steamInfo.realname, true);
			if (steamInfo.commentpermission)
			{
				await this.setStateAsync('data.commentpermission',steamInfo.commentpermission, true);
			}
		}
	}

	async refreshState()
	{
		let nextRefreshSec = this.config.interval;
		let status = '';

		if(this.config.interval)
		{
			nextRefreshSec=this.config.interval;
		}

		try {

			const SteamApiResponse = await this.SteamApiClient.get(`/ISteamUser/GetPlayerSummaries/v0002/?key=${this.config.steamapikey}&steamids=${this.config.userid}`);

			if (SteamApiResponse.status === 200) {
				const steamInfo = SteamApiResponse.data.response.players[0];
				await this.setApiConnection(true);

				if (steamInfo.gameid)
				{
					status = 'playing';
				}
				else
				{
					status = this.getPersonaState(steamInfo.personastate);
				}

				if ((this.lastStatus) !== status)
				{
					this.log.info('Current status: ' + status);
					await this.setStateAsync('data.accountstatus', status, true);
					this.lastStatus=status;
					if (steamInfo.gameid)
					{
						await this.setStateAsync('data.gameid', steamInfo.gameid, true);
						await this.setStateAsync('data.gamename', steamInfo.gameextrainfo, true);
					}
					else
					{
						await this.setStateAsync('data.gameid', null, true);
						await this.setStateAsync('data.gamename', null, true);
					}
				}
			}

			if (this.refreshStateTimeout)
			{
				this.clearTimeout(this.refreshStateTimeout);
			}
		}
		catch (err)
		{
			await this.setApiConnection(false);

			if (err.name === 'AxiosError')
			{
				this.log.error(`Request to ${err?.config?.url} failed with code ${err?.status} (${err?.code}): ${err.message}`);
				this.log.debug(`Complete error object: ${JSON.stringify(err)}`);
			}
			else
			{
				this.log.error(err);
			}
		}
		finally
		{
			this.refreshStateTimeout = this.setTimeout(() =>
			{
				this.refreshStateTimeout = null;
				this.refreshState();
			},
			nextRefreshSec * 1000);

			//this.log.debug('Current status: ' + status);
			//this.log.debug(`refreshStateTimeout: re-created refresh timeout: id ${this.refreshStateTimeout} refresh interval: ${this.config.interval}`);
		}
	}

	onObjectChange(id, obj) {
		if (obj) {
			this.log.info('object ${id} changed: ${JSON.stringify(obj)}');
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			callback();
		} catch (e) {
			callback();
		}
	}

	async setApiConnection(status) {
		this.apiConnected = status;
		await this.setStateChangedAsync('info.connection', { val: status, ack: true });
	}

	getPersonaState(personastate) {
		let status='unrecognized';
		switch(personastate)
		{
			case 0:	status = 'offline'; break;
			case 1: status = 'online'; break;
			case 2: status = 'playing'; break;
			case 3: status = 'away'; break;
			case 4: status = 'snooze'; break;
			default: status = 'unrecognized';
		}
		return status;
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Steam(options);
} else {
	// otherwise start the instance directly
	new Steam();
}