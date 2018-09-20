import Implementation = require('./')
import test = require('@fanny-pack/test')
import createTestRunner = require('@fanny-pack/test/build/runner')
import os = require('os')
import path = require('path')

test(new Implementation(path.join(os.tmpdir(), 'fanny-pack-node-test')), createTestRunner())
