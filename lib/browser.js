/*
 *  lib/browser.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-16
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var path = require('path');
var os = require('os');
var child_process = require('child_process');

var parse_arp = require('./parse_arp');
var flood = require('./flood');

/**
 */
var browser = function(paramd, callback) {
    if (arguments.length === 1) {
        paramd = {};
        callback = arguments[0];
    }

    paramd.poll = (paramd.poll !== undefined) ? paramd.poll : 3 * 60;

    var floodd = {
        ip: paramd.ip || ipv4(),
        verbose: paramd.verbose || false,
        max: paramd.max || 64,
    };

    var _doit = function() {
        flood.flood(floodd, function() {
            parse_arp.arp(paramd, function(error, d) {
                if (error) {
                    callback(error);
                } else if (!d) {
                    callback(null, null);
                } else if (d.mac) {
                    callback(null, d);
                }
            });
        });
    };

    _doit();
};

var ipv4 = function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var devs = ifaces[dev]
        for (var di in devs) {
            var details = devs[di]

            if (details.family != 'IPv4') {
                continue
            }
            if (details.address == '127.0.0.1') {
                continue
            }

            return details.address
        }
    }
}

/**
 *  API
 */
exports.browser = browser;