// (c) Rogier Schouten <rogier.schouten@gmail.com>
// License: Apache-2.0

var child_process = require("child_process");
var es = require("event-stream");
var path = require("path");

var winExt = /^win/.test(process.platform)?".cmd":"";

function typedoc(options) {
	var files = [];
	var child;

	options = options || {};
	var args = [];
	for (var key in options) {
		if (options.hasOwnProperty(key)) {
			args.push("--" + key);
			args.push(options[key]);
		}
	}

	return es.through(function(file) {
		// keep pushing filenames on stack until we have all
		if (path.extname(file.path) == ".ts") {
			files.push(file.path);
		}
	}, function() {
		// end of stream, start typedoc
		var stream = this;

		for (var i = 0; i < files.length; i++) {
			args.push(files[i]);
		}

		var executable = path.join(__dirname, "node_modules", ".bin", "typedoc" + winExt);
		
		child = child_process.spawn(path.resolve(executable), args, {
			stdio: "inherit",
			env: process.env
		}).on("exit", function(code) {
			if (child) {
				child.kill();
			}
			stream.emit("end");
		});
	});
};

module.exports = typedoc;



