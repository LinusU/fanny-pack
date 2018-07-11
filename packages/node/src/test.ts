import Implementation = require('./')
import test = require('@fanny-pack/test')
import os = require('os')
import path = require('path')

test(new Implementation(path.join(os.tmpdir(), 'fanny-pack-node-test')))
