function purgeOptions(rules, options) {
	return Object.keys(options).filter(key => {
		const rule = rules[key];

		if (!rule) return false;

		return rule(options[key]);
	}).reduce((obj, key) => {
    return {
      ...obj,
      [key]: options[key]
    };
  }, {});;
}

function type(type) {
	return (value) => typeof value === type;
}

function oneOf(arr) {
	return (value) => arr.includes(value);
}

function equal(what) {
	return (value) => value === what;
}

function all(requirements) {
	return (value) => {
		for (req of requirements) {
			if (!req(value)) {
				return false;
			}
		}

		return true;
	};
}

function some(requirements) {
	return (value) => requirements.some(req => req(value));
}

module.exports = {
	purgeOptions,
	type,
	oneOf,
	equal,
	all,
	some
};