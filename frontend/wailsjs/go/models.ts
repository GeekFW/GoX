export namespace config {
	
	export class ServerConfig {
	    id: string;
	    name: string;
	    protocol: string;
	    address: string;
	    port: number;
	    config: string;
	    enabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ServerConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.protocol = source["protocol"];
	        this.address = source["address"];
	        this.port = source["port"];
	        this.config = source["config"];
	        this.enabled = source["enabled"];
	    }
	}
	export class TUNConfig {
	    deviceName: string;
	    ipAddress: string;
	    subnet: string;
	
	    static createFrom(source: any = {}) {
	        return new TUNConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.deviceName = source["deviceName"];
	        this.ipAddress = source["ipAddress"];
	        this.subnet = source["subnet"];
	    }
	}
	export class ProxyConfig {
	    xrayBinaryPath: string;
	    xrayConfig: string;
	    routeMode: string;
	    geoIPPath: string;
	
	    static createFrom(source: any = {}) {
	        return new ProxyConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.xrayBinaryPath = source["xrayBinaryPath"];
	        this.xrayConfig = source["xrayConfig"];
	        this.routeMode = source["routeMode"];
	        this.geoIPPath = source["geoIPPath"];
	    }
	}
	export class LogConfig {
	    level: string;
	    enabled: boolean;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new LogConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.level = source["level"];
	        this.enabled = source["enabled"];
	        this.path = source["path"];
	    }
	}
	export class Config {
	    theme: string;
	    themeColor: string;
	    language: string;
	    log: LogConfig;
	    proxy: ProxyConfig;
	    tun: TUNConfig;
	    servers: ServerConfig[];
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = source["theme"];
	        this.themeColor = source["themeColor"];
	        this.language = source["language"];
	        this.log = this.convertValues(source["log"], LogConfig);
	        this.proxy = this.convertValues(source["proxy"], ProxyConfig);
	        this.tun = this.convertValues(source["tun"], TUNConfig);
	        this.servers = this.convertValues(source["servers"], ServerConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	

}

export namespace server {
	
	export class ServerConfig {
	    id: string;
	    name: string;
	    protocol: string;
	    address: string;
	    port: number;
	    uuid: string;
	    password: string;
	    method: string;
	    network: string;
	    path: string;
	    host: string;
	    tls: boolean;
	    sni: string;
	    // Go type: time
	    created: any;
	    // Go type: time
	    updated: any;
	
	    static createFrom(source: any = {}) {
	        return new ServerConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.protocol = source["protocol"];
	        this.address = source["address"];
	        this.port = source["port"];
	        this.uuid = source["uuid"];
	        this.password = source["password"];
	        this.method = source["method"];
	        this.network = source["network"];
	        this.path = source["path"];
	        this.host = source["host"];
	        this.tls = source["tls"];
	        this.sni = source["sni"];
	        this.created = this.convertValues(source["created"], null);
	        this.updated = this.convertValues(source["updated"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

