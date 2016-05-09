var url = require('url');

module.exports = {
    absoluteLink: function (req) {
        return url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl
        });
    },
    link: function (req) {
        return req.originalUrl;
    },
    queryString: function (req) {
        return req.query;
    }
};
