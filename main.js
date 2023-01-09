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
		this.requestClient = axios.create()
	}

	async onReady()
	{
		// Initialize your adapter here


		this.setState("info.connection", false, true);
		const configinterval = this.config.interval;
		this.log.info("Intervall:" + configinterval);
		this.log.info(this.config.steamapikey)

		await this.setObjectNotExistsAsync('Status', {
			type: 'state',
			common: {
				name: 'Status',
				type: 'boolean',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		
		// main method
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
			switch(personastate)
			{
				case 0:	status = "offline"; break;
				case 1: status = "online"; break;
				case 2: status = "playing"; break;
				case 3: status = "away"; break;
				case 4: status = "snooze"; break;
				default: status = "unrecognized";
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