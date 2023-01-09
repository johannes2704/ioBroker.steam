'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const axios = require("axios").default;


// Load your modules here, e.g.:
// const fs = require("fs");

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
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('unload', this.onUnload.bind(this));
		this.requestClient = axios.create()
	}

	async onReady()
	{
		// Initialize your adapter here
		const configinterval = this.config.interval
		this.log.info("Intervall:" + interval);
		this.log.info(this.config.steamapikey)
		this.updateInterval = null
		this.steamupdate()
	}

  async steamupdate() {
		let object;
		let gameid;
		let personastate = 0;
		let status = "";
		let configinterval = this.config.interval

		await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' +this.config.steamapikey + '&steamids='+this.config.userid)
		  .then((response) => {
				gameid=response.data.response.players[0].gameid
				personastate= response.data.response.players[0].personastate
			})
			.catch(error => {
				this.log.error(error);
			});

		if (gameid)
		{
			status = "playing";
		}
		else
		{
				//The user's current status. 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play
				switch(personastate)
				{
						case 0:
						status = "offline"
						break;

						case 1:

						status = "online";
						break;

						case 2:
						status = "playing";
						break;

						case 3:
						status = "away";
						break;

						case 4:
						status = "snooze";
						break;

						default:
						status = "unrecognized";
				}    
		}
		
		const lastStatus = await this.getStateAsync("Status");
		if (lastStatus.val.toString() !== status.toString())
		{
			await this.log.info('Steamstatus ist aktuell: ' + status);
			await this.setStateAsync('Status', status, true);
		}
		await this.log.info('Steamstatus ist aktuell: ' + status);
		this.setTimeout(() => this.steamupdate(),15000);
		this.log.info(configinterval.toString())
	}  	


	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}


	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
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