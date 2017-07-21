var Accessory, Service, Characteristic, UUIDGen

const TEMPERATURE_SENSOR_NAME = 'sensor-temperature'
const HUMIDITY_SENSOR_NAME = 'sensor-humidity'

module.exports = function (homebridge) {
	// Accessory must be created from PlatformAccessory Constructor
	Accessory = homebridge.platformAccessory;

	// Service and Characteristic are from hap-nodejs
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	// For platform plugin to be considered as dynamic platform plugin,
	// registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
	homebridge.registerPlatform("homebridge-dht11", "DHT11", Sensor, true);
}

class Sensor {
	constructor(log, config, api) {
		log("DHT11 Init")
		this.log = log
		this.config = config
		if (!config.url) {
			throw new Error('Sensor url is required in config.json')
		}
		this.accessories = []

		if (api) {
			// Save the API object as plugin needs to register new accessory via this object.
			this.api = api

			// Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
			// Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
			// Or start discover new accessories
			this.api.on('didFinishLaunching', () => {
				if (this.accessories.length === 0) {
					this.addAccessory()
				}
			})
		}
	}

	configureAccessory(accessory) {
		accessory.reachable = true

		if (accessory.displayName === TEMPERATURE_SENSOR_NAME) {
			this._configureTempAccessory(accessory)
		}	
		if (accessory.displayName === HUMIDITY_SENSOR_NAME) {
			this._configureHumAccessory(accessory)
		}
		
		this.accessories.push(accessory)
	}

	addAccessory() {
		const uuidTemp = UUIDGen.generate(TEMPERATURE_SENSOR_NAME)
		const accessoryTemp = new Accessory(TEMPERATURE_SENSOR_NAME, uuidTemp)
		accessoryTemp.addService(Service.TemperatureSensor, 'Temperature Sensor')
		this._configureTempAccessory(accessoryTemp)
		this.accessories.push(accessoryTemp)

		const uuidHum = UUIDGen.generate(HUMIDITY_SENSOR_NAME)
		const accessoryHum = new Accessory(HUMIDITY_SENSOR_NAME, uuidHum)
		accessoryHum.addService(Service.HumiditySensor, 'Humidity Sensor')
		this._configureHumAccessory(accessoryHum)
		this.accessories.push(accessoryHum)

		this.api && this.api.registerPlatformAccessories("homebridge-dht11", "DHT11", [accessoryTemp, accessoryHum]);
	}

	getTemperature() {
		return 29.2
	}

	getHumidity() {
		return 47
	}

	_configureTempAccessory(accessory) {
		accessory.on('identify', (paired, callback) => {
			this.log(`identify: paired=${paired}`)
			callback()
		})

		if (accessory.getService(Service.TemperatureSensor)) {
			accessory.getService(Service.TemperatureSensor)
				.getCharacteristic(Characteristic.CurrentTemperature)
				.on('get', (callback) => {
					callback(null, this.getTemperature())
				})
		}
	}

	_configureHumAccessory(accessory) {
		accessory.on('identify', (paired, callback) => {
			this.log(`identify: paired=${paired}`)
			callback()
		})

		if (accessory.getService(Service.HumiditySensor)) {
			accessory.getService(Service.HumiditySensor)
				.getCharacteristic(Characteristic.CurrentRelativeHumidity)
				.on('get', (callback) => {
					callback(null, this.getHumidity())
				})
		}
	}
}
