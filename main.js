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
	}

	async onReady()
	{
		// Initialize your adapter here
		//this.setState("info.connection", false, true);
		//this.log.info("Intervall:" + this.config.interval);
		//this.log.info(this.config.steamapikey);

		await this.setObjectNotExistsAsync('Status', {
			type: 'state',
			common: {
				name: 'Status',
				type: 'string',
				role: 'text',
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync('GameID', {
			type: 'state',
			common: {
				name: 'GameID',
				type: 'string',
				role: 'text',
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync('GameName', {
			type: 'state',
			common: {
				name: 'GameName',
				type: 'string',
				role: 'text',
				read: true,
				write: false,
			},
			native: {},
		});

		// main method
		this.steamupdate();
	}

	async steamupdate() {
		let gameid;
		let gamename='';
		let personastate =0;
		let status = '';

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
			const obj = await this.getStateAsync('Status');
			// @ts-ignore
			lastStatus=obj.val.toString();
		} catch (err) {
			lastStatus='unrecognized';
		}

		if ((lastStatus) !== status)
		{
			await this.log.info('Steamstatus ist aktuell: ' + status);
			await this.setStateAsync('Status', status, true);
			if (gameid)
			{
				await this.setStateAsync('GameID', gameid, true);
				await this.setStateAsync('GameName', gamename, true);
			}
			else
			{
				await this.setStateAsync('GameID', null, true);
				await this.setStateAsync('GameName', null, true);
			}
		}

		await this.log.info('Steamstatus ist aktuell: ' + status);

		this.setTimeout(() => this.steamupdate(),1000*this.config.interval);
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