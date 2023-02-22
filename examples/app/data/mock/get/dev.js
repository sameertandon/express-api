module.exports = {
  path: '/express-api/localhost/master',
  delay: 1000,
  template: {
    name: 'generator-express',
    profiles: [
      'dit'
    ],
    label: 'master',
    version: null,
    state: null,
    propertySources: [{
      name: 'https://github.org/det.yml',
      source: {
        config: {
          mongoDB: {
            uri: 'mongodb://localhost:27017/videovisit',
            options: {
              useNewUrlParser: true,
              ssl: false,
              poolSize: 10,
              bufferMaxEntries: 0,
              connectTimeoutMS: 2000,
              socketTimeoutMS: 45000,
              family: 4
            }
          },
          restAPI: [{
            code: 'userAPI',
            url: 'http://localhost:9080',
            path: '/user/account/eligibility',
            healthPath: '/health'
          }],
          uiConfig: {
            memberUrl: '/member'
          },
          errorCodes: {
            formatErrorCodeSQ: 'REG:39'
          },
          rules: {
            mrnFormat: {
              scope: 'ALL',
              region: {
                SCA: {
                  invalidLen: 11,
                  lenInRange: [{
                    min: 7,
                    max: 12,
                    invalidPrefixRegEx: '^11'
                  }],
                  stripZeroRegex: '^0+'
                },
                MRN: {
                  minLen: 7,
                  medianLen: 8,
                  lenInRangeMedian: [{
                    min: 9,
                    max: 12,
                    validPrefixRegEx: '^11'
                  }],
                  stripZeroRegex: '^0+'
                },
                COL: {
                  validLen: 9,
                  stripZeroRegex: '^0+'
                },
                KNW: {
                  validLen: 8,
                  stripZeroRegex: '^0+'
                },
                HAW: {
                  minLen: 2,
                  maxLen: 7,
                  stripZeroRegex: '^0+'
                },
                GGA: {
                  minLen: 7,
                  maxLen: 9,
                  stripZeroRegex: '^0+'
                },
                MID: {
                  minLen: 8,
                  maxLen: 9
                }
              }
            },
            email: {
              region: {
                NATIONAL: {
                  maxLen: 64,
                  regex: "^([A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$"
                },
                SCA: {
                  maxLen: 74,
                  regex: "^([A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$"
                }
              }
            },
            regionList: [
              'SCA',
              'MRN',
              'KNW',
              'MID',
              'HAW',
              'COL',
              'GGA'
            ]
          }
        }
      }
    }]
  }
}
