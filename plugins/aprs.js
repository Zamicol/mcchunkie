// Desc: query the FCC license database for license info.
(function(helper, to, from, msg, store, sh_store, cb ) {
	'use strict';
	var resp, what, who, parts = msg.split( ' ' );
	if (! store.aprs ) {
		store.aprs = {};
		store.aprs.url = 'http://api.aprs.fi/api/get?';
		store.aprs.qs = require('querystring');
		store.aprs_options = {
			format: 'json',
			apikey: store.token,
			what: '',
			name: ''
		};
		store.aprs.parseEntry = function(entry) {
			var l, text = [];
			for (l in entry) {
				if (entry.hasOwnProperty(l)) {
					text.push(l + ': ' + entry[l]);
				}
			}

			return text.join(', ');
		};
		store.aprs.buildList = function(entries) {
			var i, l, r, list;

			if (entries.length > 1) {
				r = 'I found %d entries (from http://aprs.fi), here is the first: %l';
			} else {
				r = '%l (http://aprs.fi)';
			}

			r = r.replace('%d', entries.length);
			r = r.replace('%l', store.aprs.parseEntry(entries[0]));
			return r;
		};
		store.aprs.whats = {
			loc: true,
			wx: true
		};
		store.aprs.get = function(what, who) {
			var aprs_url = store.aprs.url;

			store.aprs_options.what = what;
			store.aprs_options.name = who;

			aprs_url += store.aprs.qs.stringify(store.aprs_options);

			console.log(aprs_url);
			helper.httpGet(aprs_url, function(err, data) {
				var f;

				store.aprs_options.what = '';
				store.aprs_options.name = '';

				data = JSON.parse(data);
				if (data.result === 'ok' && data.found > 0) {
					resp = store.aprs.buildList(data.entries);
					cb.call(null, to, from, resp);
				} else {
					cb.call(null, to, from, 'I got nothin.');
				}
			});
		};
	}

	if (msg.match(/^aprs: / )) {
		msg = msg.replace(/^aprs: /, '');
		what = parts[0];
		who = parts[1];
		if ( store.aprs.whats[what] ) {
			store.aprs.get(what, who);
		}
	}

});
