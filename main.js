'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;

class Steam extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'steam',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));
		this.on('objectChange', this.onObjectChange.bind(this));
		this.requestClient = axios.create();
		this.refreshStateTimeout = null;
	}

	async onReady()
	{
		// check current configuration
		if (!this.config.userid)
		{
			this.log.error('userid is empty - please check instance configuration of $(this.namespace)');
			return;
		}
		if (!this.config.steamapikey)
		{
			this.log.error('steamapikey is empty - please check instance configuration of $(this.namespace');
			return;
		}

		// Initialize your adapter here
		this.setState('info.connection', false, true);
		//this.log.info("Intervall:" + this.config.interval);
		//this.log.info(this.config.steamapikey);

		let accountcreated=new Date();
		let personaname='';

		await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' +this.config.steamapikey + '&steamids='+this.config.userid)
			.then((response) => {
				if (response.status==200)
				{
					accountcreated=new Date(response.data.response.players[0].timecreated * 1000);
					personaname=response.data.response.players[0].personaname;
				}

			})
			.catch(error => {
				this.log.error(error);
			});

		await this.setStateAsync('accountcreated', accountcreated.getDate(), true);
		await this.setStateAsync('accountname', personaname, true);

		// main method
		this.refreshState();
	}

	async refreshState() {
		let nextRefreshSec = 15;
		let gameid;
		let gamename='';
		let personastate =0;
		let status = '';

		if(this.config.interval)
		{
			nextRefreshSec=this.config.interval;
		}

		await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' +this.config.steamapikey + '&steamids='+this.config.userid)
			.then((response) => {
				gameid=response.data.response.players[0].gameid;
				personastate= response.data.response.players[0].personastate;
				gamename=response.data.response.players[0].gameextrainfo;
			})
			.catch(error => {
				this.log.error(error);
			});

		if (gameid)
		{
			status = 'playing';
		}
		else
		{
			switch(personastate)
			{
				case 0:	status = 'offline'; break;
				case 1: status = 'online'; break;
				case 2: status = 'playing'; break;
				case 3: status = 'away'; break;
				case 4: status = 'snooze'; break;
				default: status = 'unrecognized';
			}
		}

		let lastStatus='unrecognized';
		try {
			const obj = await this.getStateAsync('accountstatus');
			// @ts-ignore
			lastStatus=obj.val.toString();
		} catch (err) {
			lastStatus='unrecognized';
		}

		if ((lastStatus) !== status)
		{
			await this.log.info('Current status: ' + status);
			await this.setStateAsync('accountstatus', status, true);
			if (gameid)
			{
				await this.setStateAsync('gameid', gameid, true);
				await this.setStateAsync('gamename', gamename, true);
			}
			else
			{
				await this.setStateAsync('gameid', null, true);
				await this.setStateAsync('gamename', null, true);
			}
		}

		if (this.refreshStateTimeout) {
			this.clearTimeout(this.refreshStateTimeout);
		}

		this.refreshStateTimeout = this.setTimeout(() => {
			this.refreshStateTimeout = null;
			this.refreshState();
		}, nextRefreshSec * 1000);

		await this.log.debug('Current status: ' + status);
		this.log.debug(`refreshStateTimeout: re-created refresh timeout: id ${this.refreshStateTimeout}`);
	}

	onObjectChange(id, obj) {
		if (obj) {
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
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